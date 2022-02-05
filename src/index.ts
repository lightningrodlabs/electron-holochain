import { App } from 'electron'
import { HolochainRunnerOptions, PathOptions } from './options'
import {
  runHolochain,
  StateSignal,
  StatusUpdates,
  STATUS_EVENT,
  APP_PORT_EVENT,
} from './holochain'
import {
  defaultHolochainRunnerBinaryPath,
  defaultLairKeystoreBinaryPath,
} from './binaries'
import * as childProcess from 'child_process'
import * as fs from 'fs'
import * as kill from 'tree-kill'

export {
  StateSignal,
  StatusUpdates,
  HolochainRunnerOptions,
  STATUS_EVENT,
  PathOptions,
  APP_PORT_EVENT,
}

// start up lair and holochain-runner processes,
// automatically shut them down on app quit,
// and emit events for status updates on their installation progress
export default async function initAgent(
  app: App,
  opts: HolochainRunnerOptions,
  binaryPaths?: PathOptions
): Promise<{ statusEmitter: StatusUpdates; shutdown: () => Promise<void> }> {
  // wait for the app to be ready
  await app.whenReady()
  const statusEmitter = new StatusUpdates()
  // execute this in a callback
  // so that we can continue and return
  // the statusEmitter to the caller
  let lairHandle: childProcess.ChildProcessWithoutNullStreams
  let holochainHandle: childProcess.ChildProcessWithoutNullStreams
  ;(async () => {
    ;[lairHandle, holochainHandle] = await runHolochain(
      statusEmitter,
      opts,
      binaryPaths
    )
    app.on('will-quit', async () => {
      // SIGTERM signal is the default, and that's good
      await killHolochain(lairHandle, holochainHandle)
    })
  })()
  return {
    statusEmitter,
    shutdown: async () => {
      // SIGTERM signal is the default, and that's good
      await killHolochain(lairHandle, holochainHandle)
    },
  }
}

/**
 *
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Kill handles and their children
 */
async function killHolochain(
  lairHandle: childProcess.ChildProcessWithoutNullStreams,
  holochainHandle: childProcess.ChildProcessWithoutNullStreams
) {
  // Kill holochain and its children
  let canWaitForHolochain = false
  if (holochainHandle && holochainHandle.pid) {
    canWaitForHolochain = true
    console.debug('Killing holochain sub processes...')
    kill(holochainHandle.pid, function (err) {
      canWaitForHolochain = false
      if (!err) {
        console.debug('killed all holochain sub processes')
      } else {
        console.error(err)
      }
    })
  }
  // Kill lair-keystore and its children
  let canWaitForKeystore = false
  if (lairHandle && lairHandle.pid) {
    canWaitForKeystore = true
    console.debug('Killing lair-keystore sub processes...')
    kill(lairHandle.pid, function (err) {
      canWaitForKeystore = false
      if (!err) {
        console.debug('killed all lair-keystore sub processes')
      } else {
        console.error(err)
      }
    })
  }
  // Wait for the kill commands to complete and exit anyway after a timeout
  console.debug('waiting...')
  const start_time = Date.now()
  while (canWaitForHolochain || canWaitForKeystore) {
    await sleep(10)
    if (Date.now() - start_time > 5 * 1000) {
      console.error('Killing sub-processes TIMED-OUT. Aborted.')
      break
    }
  }
  console.debug('Killing sub-processes DONE.')
}

/**
 *
 */
export function getRunnerVersion(runnerBinaryPath?: string): string {
  const holochainRunnerBinaryPath: string = runnerBinaryPath
    ? runnerBinaryPath
    : defaultHolochainRunnerBinaryPath

  if (!fs.existsSync(holochainRunnerBinaryPath)) {
    console.error(
      'holochain-runner binary not found at path: ' + holochainRunnerBinaryPath
    )
    return 'holochain-runner missing'
  }

  const holochainHandle = childProcess.spawnSync(holochainRunnerBinaryPath, [
    '--version',
  ])

  if (holochainHandle.error) {
    console.error(
      'Calling holochain-runner failed: ' + holochainHandle.error.message
    )
    return 'holochain-runner broken'
  }

  return holochainHandle.stdout.toString()
}

/**
 *
 */
export function getLairVersion(lairBinaryPath?: string): string {
  const binaryPath: string = lairBinaryPath
    ? lairBinaryPath
    : defaultLairKeystoreBinaryPath

  if (!fs.existsSync(binaryPath)) {
    console.error('lair-keystore binary not found at path: ' + binaryPath)
    return 'lair-keystore missing'
  }

  const handle = childProcess.spawnSync(binaryPath, ['--version'])

  if (handle.error) {
    console.error('Calling lair-keystore failed: ' + handle.error.message)
    return 'lair-keystore broken'
  }

  return handle.stdout.toString()
}
