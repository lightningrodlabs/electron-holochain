import * as path from 'path'
import {app} from 'electron'
import initAgent, {
  StateSignal,
  STATUS_EVENT,
} from '../src'
import { ElectronHolochainOptions } from '../src/options'

const runnerOptions: ElectronHolochainOptions = {
  happPath: path.join(__dirname, '../../test/test.happ'),
  datastorePath: path.join(__dirname, '../../test/data/databases'),
  keystorePath: path.join(__dirname, '../../test/data/keystore'),
  passphrase: '1234abcd'
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