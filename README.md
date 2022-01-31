# electron-holochain

> Holochain Revision: [v0.0.115 Nov 10, 2021](https://github.com/holochain/holochain/releases/tag/holochain-0.0.115)
> 
> Lair Keystore Revision: [v0.0.9 Nov 4, 2021](https://github.com/holochain/lair/releases/tag/v0.0.9)
>
> Expects a DNA built with HDK [v0.0.115](https://docs.rs/hdk/0.0.115/hdk/index.html)

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
  APP_PORT_EVENT,
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
  // membraneProof?: string
  // bootstrapUrl?: string
  // uid?: string
}

const statusEmitter = await initAgent(app, runnerOptions)

// listen on the statusEmitter for status update
statusEmitter.on(STATUS_EVENT, (status: StateSignal) => {
  // do stuff
})

// listen on the statusEmitter for the websocket port used for app
statusEmitter.on(APP_PORT_EVENT, (appPort: string) => {
  // do stuff
}
// when the app quits, holochain-runner and lair-keystore will shut down automatically
```
