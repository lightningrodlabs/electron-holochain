# electron-holochain

> Holochain Revision: [0.0.108 September 29, 2021](https://github.com/holochain/holochain/releases/tag/holochain-0.0.108)

> Lair Revision: [@GuillemCordoba vendored-openssl fork of 0.0.4](https://github.com/guillemcordoba/lair/commit/54e8168a15bc9b1a5f8a8222e97e66fa85794883)

manage holochain processes during an electron application runtime, using [holochain-runner binaries](https://github.com/Sprillow/holochain-runner).

```typescript
// function initAgent(
//   app: App,
//   opts: HolochainRunnerOptions,
//   pathOptions?: PathOptions
// ): Promise<StatusUpdates>

import {app} from 'electron'
import initAgent, {
  StateSignal,
  StatusUpdates,
  STATUS_EVENT,
  HolochainRunnerOptions,
  PathOptions
} from 'electron-holochain'

const runnerOptions: HolochainRunnerOptions = {
  dnaPath: 'pathtomydna.dna',
  // datastorePath?: 'string' default: databases
  // appId?: string
  // appWsPort?: number
  // adminWsPort?: number
  // keystorePath?: string default: keystore
  // proxyUrl?: string
}

const statusEmitter = await initAgent(app, runnerOptions)

// listen on the statusEmitter
statusEmitter.on(STATUS_EVENT, (status: StateSignal) => {
  // do stuff
})

// when the app quits, holochain-runner and lair-keystore will shut down automatically
```
