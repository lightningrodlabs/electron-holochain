import { App } from 'electron'
import { HolochainRunnerOptions } from './options'
import { runHolochain, StateSignal, StatusUpdates } from './holochain'

// start up lair and holochain-runner processes,
// automatically shut them down on app quit,
// and emit events for status updates on their installation progress
export default async function setup(
  app: App,
  opts: HolochainRunnerOptions,
  holochainRunnerBinaryPath: string,
  lairKeystoreBinaryPath: string
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
        holochainRunnerBinaryPath,
        lairKeystoreBinaryPath
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
