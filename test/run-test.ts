import * as path from 'path'
import {app} from 'electron'
import initAgent, {
  StateSignal,
  STATUS_EVENT,
  HolochainRunnerOptions,
} from '../src'

const runnerOptions: HolochainRunnerOptions = {
  happPath: path.join(__dirname, '../../test/hrea_suite.happ'),
  datastorePath: path.join(__dirname, '../../test/data/databases'),
  keystorePath: path.join(__dirname, '../../test/data/keystore')
  // appId?: string
  // appWsPort?: number
  // adminWsPort?: number
  // proxyUrl?: string
}

app.on('ready', async () => {
    try {
        const { statusEmitter } = await initAgent(app, runnerOptions)
        statusEmitter.on(STATUS_EVENT, (state: StateSignal) => {
            console.log('holochain-runner state:', state)
        })
    } catch (e) {
        console.log(e)
    }
})