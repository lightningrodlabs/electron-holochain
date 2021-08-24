import { App } from 'electron'
import { HolochainRunnerOptions } from './options'
import { runHolochain, StateSignal, StatusUpdates } from './holochain'

// 
export default async function setup(
  app: App,
  opts: HolochainRunnerOptions
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
        opts
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
