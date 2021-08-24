import * as childProcess from 'child_process'
import { EventEmitter } from 'events'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as split from 'split'
import { constructOptions, HolochainRunnerOptions } from './options'

type STATUS_EVENT = 'status'
const STATUS_EVENT = 'status'

export declare interface StatusUpdates {
  on(event: STATUS_EVENT, listener: (status: StateSignal) => void): this
}

export class StatusUpdates extends EventEmitter {
  emitStatus(status: StateSignal): void {
    this.emit(STATUS_EVENT, status)
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
  // error states
  FailedToStart,
  Crashed,
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

export async function runHolochain(
  statusEmitter: StatusUpdates,
  options: HolochainRunnerOptions,
  holochainRunnerBinaryPath: string,
  lairKeystoreBinaryPath: string
): Promise<childProcess.ChildProcessWithoutNullStreams[]> {
  const lairHandle = childProcess.spawn(lairKeystoreBinaryPath, [
    '--lair-dir',
    options.keystorePath,
  ])
  const optionsArray = constructOptions(options)
  const holochainHandle = childProcess.spawn(
    holochainRunnerBinaryPath,
    optionsArray
  )
  return new Promise<childProcess.ChildProcessWithoutNullStreams[]>(
    (resolve, reject) => {
      // split divides up the stream line by line
      holochainHandle.stdout.pipe(split()).on('data', (line: string) => {
        const checkIfSignal = stdoutToStateSignal(line)
        if (checkIfSignal === StateSignal.IsReady) {
          resolve([lairHandle, holochainHandle])
        }
        if (checkIfSignal !== null) {
          statusEmitter.emitStatus(checkIfSignal)
        }
      })
      holochainHandle.stdout.on('error', (e) => {
        // reject()
      })
      holochainHandle.stderr.on('data', (e) => {
        // reject()
      })
    }
  )
}
