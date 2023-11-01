import * as childProcess from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import { EventEmitter } from 'events'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as split from 'split'
import {
  constructOptions,
  ElectronHolochainOptions,
  PathOptions,
} from './options.js'
import {
  defaultHolochainRunnerBinaryPath,
} from './binaries.js'


type STATUS_EVENT = 'status'
const STATUS_EVENT = 'status'
type APP_PORT_EVENT = 'port'
const APP_PORT_EVENT = 'port'
type LAIR_SOCKET_EVENT = 'lair'
const LAIR_SOCKET_EVENT = 'lair'
type ERROR_EVENT = 'error'
const ERROR_EVENT = 'error'
type HOLOCHAIN_LOG_EVENT = 'holochain_log'
const HOLOCHAIN_LOG_EVENT = 'holochain_log'
type WASM_LOG_EVENT = 'wasm_log'
const WASM_LOG_EVENT = 'wasm_log'
type HOLOCHAIN_RUNNER_QUIT = 'holochain_runner_quit'
const HOLOCHAIN_RUNNER_QUIT = 'holochain_runner_quit'
export {
  STATUS_EVENT,
  APP_PORT_EVENT,
  LAIR_SOCKET_EVENT,
  ERROR_EVENT,
  HOLOCHAIN_LOG_EVENT,
  WASM_LOG_EVENT,
  HOLOCHAIN_RUNNER_QUIT,
}

export declare interface StatusUpdates {
  on(
    event:
      | STATUS_EVENT
      | APP_PORT_EVENT
      | LAIR_SOCKET_EVENT
      | ERROR_EVENT
      | HOLOCHAIN_LOG_EVENT
      | WASM_LOG_EVENT
      | HOLOCHAIN_RUNNER_QUIT,
    listener: (status: StateSignal | string | Error) => void
  ): this
}

export class StatusUpdates extends EventEmitter {
  emitStatus(status: StateSignal): void {
    this.emit(STATUS_EVENT, status)
  }
  emitAppPort(port: string): void {
    this.emit(APP_PORT_EVENT, port)
  }
  emitLairSocket(socket: string): void {
    this.emit(LAIR_SOCKET_EVENT, socket)
  }
  emitWasmLog(line: string): void {
    this.emit(WASM_LOG_EVENT, line)
  }
  emitHolochainLog(line: string): void {
    this.emit(HOLOCHAIN_LOG_EVENT, line)
  }
  emitError(error: Error): void {
    this.emit(ERROR_EVENT, error)
  }
  emitHolochainRunnerQuit(): void {
    this.emit(HOLOCHAIN_RUNNER_QUIT)
  }
}

export enum StateSignal {
  IsFirstRun,
  IsNotFirstRun,
  CreatingKeys,
  RegisteringDna,
  InstallingApp,
  EnablingApp,
  AddingAppInterface,
  IsReady,
}

function stdoutToStateSignal(string: string): StateSignal {
  switch (string) {
    case '0':
      return StateSignal.IsFirstRun
    case '1':
      return StateSignal.IsNotFirstRun
    // IsFirstRun events
    case '2':
      return StateSignal.CreatingKeys
    case '3':
      return StateSignal.RegisteringDna
    case '4':
      return StateSignal.InstallingApp
    case '5':
      return StateSignal.EnablingApp
    case '6':
      return StateSignal.AddingAppInterface
    // Done/Ready Event
    case '7':
      return StateSignal.IsReady
    default:
      return null
  }
}

function checkLairInitialized(pathToLairConfig: string): boolean {
  // this file should be sitting on the file system
  // if the `lair-keystore init` command has been previously run in that directory
  const configFile = path.join(pathToLairConfig, 'lair-keystore-config.yaml')
  return fs.existsSync(configFile)
}

export async function runHolochain(
  statusEmitter: StatusUpdates,
  options: ElectronHolochainOptions,
  pathOptions?: PathOptions
): Promise<{
  holochainRunnerHandle: childProcess.ChildProcessWithoutNullStreams
}> {
  const holochainRunnerBinaryPath = pathOptions
    ? pathOptions.holochainRunnerBinaryPath
    : defaultHolochainRunnerBinaryPath

  // create the keystore folder if it doesn't
  // exist
  if (options.keystorePath && !checkLairInitialized(options.keystorePath)) {
    fs.mkdirSync(options.keystorePath, {
      recursive: true
    })
  }

  const optionsArray = constructOptions(options)
  // spawn holochain-runner and pass it a version
  // of the given options that it can digest
  const holochainRunnerHandle = childProcess.spawn(
    holochainRunnerBinaryPath,
    optionsArray,
    {
      env: {
        RUST_LOG: 'info,' +
        // this thrashes on startup
        'wasmer_compiler_cranelift=error,' +
        // this gives a bunch of warnings about how long db accesses are taking, tmi
        'holochain_sqlite::db::access=error,' +
        // this gives a lot of "search_and_discover_peer_connect: no peers found, retrying after delay" messages on INFO
        'kitsune_p2p::spawn::actor::discover=error'
        // RUST_LOG: 'info',
      }
    }
  )
  // write the passphrase through stdin
  holochainRunnerHandle.stdin.write(options.passphrase)
  holochainRunnerHandle.stdin.end()

  // split divides up the stream line by line
  holochainRunnerHandle.stdout.pipe(split()).on('data', (line: string) => {
    // Check for state signal
    const checkIfSignal = stdoutToStateSignal(line)
    const appPort = parseForAppPort(line)
    const lairKeystoreSocket = parseForLairKeystoreSocket(line)
    if (checkIfSignal !== null) {
      statusEmitter.emitStatus(checkIfSignal)
    } else if (appPort !== null) {
      statusEmitter.emitAppPort(appPort)
    } else if (lairKeystoreSocket !== null) {
      statusEmitter.emitLairSocket(lairKeystoreSocket)
    } else {
      console.log('this should be a wasm log', line)
      // per this discussion
      // https://github.com/holochain/holochain/issues/1449#issuecomment-1499888044
      // WASM logs are the ones being passed through stdout
      statusEmitter.emitWasmLog(line)
    }
  })
  holochainRunnerHandle.stderr.pipe(split()).on('data', (line: string) => {
    if (holochainRunnerHandle.killed) return;
    // per this discussion
    // https://github.com/holochain/holochain/issues/1449#issuecomment-1499888044
    // holochain logs are the ones being passed through stderr
    statusEmitter.emitHolochainLog(line)
  })
  holochainRunnerHandle.on('error', (error) => {
    if (holochainRunnerHandle.killed) return;
    statusEmitter.emitError(error)
  })
  holochainRunnerHandle.on('close', (code) => {
    if (holochainRunnerHandle.killed) return;
    console.log('holochain-runner closed with code: ', code)
    statusEmitter.emitHolochainRunnerQuit()
  })

  return {
    holochainRunnerHandle,
  }
}

function parseForAppPort(line: string): string | null {
  return parseForRegexp(line, /APP_WS_PORT: ([0-9]*)/gm);
}

function parseForLairKeystoreSocket(line: string): string | null {
  return parseForRegexp(line, /\# lair-keystore connection_url \# (.*) \#/gm);
}

function parseForRegexp(line: string, regex: RegExp): string | null {
  let match = regex.exec(line)
  if (match === undefined || match === null || match.length === 0) {
    return null
  }
  return match[1]
}