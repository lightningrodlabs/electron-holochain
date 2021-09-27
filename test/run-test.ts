import * as path from 'path'
import {app} from 'electron'
import initAgent, {
  StateSignal,
  StatusUpdates,
  STATUS_EVENT,
  HolochainRunnerOptions,
  PathOptions
} from '../src'

const runnerOptions: HolochainRunnerOptions = {
  dnaPath: path.join(__dirname, 'profiles.dna'),
  // datastorePath?: 'string'
  // keystorePath?: string
  // appId?: string
  // appWsPort?: number
  // adminWsPort?: number
  // proxyUrl?: string
}

app.on('ready', async () => {
    try {
        const statusEmitter = await initAgent(app, runnerOptions)
        statusEmitter.on(STATUS_EVENT, (state: StateSignal) => {
            console.log('holochain-runner state:', state)
        })
    } catch (e) {
        console.log(e)
    }
})