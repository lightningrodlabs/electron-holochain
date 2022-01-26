import { App } from 'electron'
import {constructOptions, HolochainRunnerOptions, PathOptions} from './options'
import {
  runHolochain,
  StateSignal,
  StatusUpdates,
  STATUS_EVENT,
  APP_PORT_EVENT,
} from './holochain'
import {defaultHolochainRunnerBinaryPath, defaultLairKeystoreBinaryPath} from "./binaries";
import * as childProcess from "child_process";

export { StateSignal, StatusUpdates, HolochainRunnerOptions, STATUS_EVENT, PathOptions, APP_PORT_EVENT }

// start up lair and holochain-runner processes,
// automatically shut them down on app quit,
// and emit events for status updates on their installation progress
export default async function initAgent(
  app: App,
  opts: HolochainRunnerOptions,
  binaryPaths?: PathOptions
): Promise<StatusUpdates> {
  // wait for the app to be ready
  await app.whenReady()
  const statusEmitter = new StatusUpdates()
  // execute this in a callback
  // so that we can continue and return
  // the statusEmitter to the caller
  ;(async () => {
    try {
      const [lairHandle, holochainHandle] = await runHolochain(
        statusEmitter,
        opts,
        binaryPaths
      )
      app.on('will-quit', () => {
        // SIGTERM signal is the default, and that's good
        lairHandle.kill()
        holochainHandle.kill()
      })
    } catch (e) {
      statusEmitter.emitStatus(StateSignal.FailedToStart)
    }
  })()
  return statusEmitter
}


/**
 *
 */
export function getRunnerVersion(runnerBinaryPath?: string): string {
  const holochainRunnerBinaryPath: string = runnerBinaryPath
    ? runnerBinaryPath
    : defaultHolochainRunnerBinaryPath

  const holochainHandle = childProcess.spawnSync(
    holochainRunnerBinaryPath,
    ['--version']
  )

  return holochainHandle.stdout.toString()
}


/**
 *
 */
export function getLairVersion(lairBinaryPath?: string): string {
  const binaryPath: string = lairBinaryPath
    ? lairBinaryPath
    : defaultLairKeystoreBinaryPath

  const handle = childProcess.spawnSync(
    binaryPath,
    ['--version']
  )

  return handle.stdout.toString()
}
