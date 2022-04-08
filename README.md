# electron-holochain

> Holochain Revision: [v0.0.127 Feb 23, 2022](https://github.com/holochain/holochain/releases/tag/holochain-0.0.127)
> 
> Lair Keystore Revision: [v0.0.9 Nov 4, 2021](https://github.com/holochain/lair/releases/tag/v0.0.9)
>
> Expects an HAPP built with HDK [v0.0.123](https://docs.rs/hdk/0.0.123/hdk/index.html)

manage holochain processes during an electron application runtime, using [holochain-runner binaries](https://github.com/Sprillow/holochain-runner).

```typescript
// function initAgent(
//   app: App,
//   opts: HolochainRunnerOptions,
//   pathOptions?: PathOptions
// ): Promise<{ statusEmitter: StatusUpdates, shutdown: () => Promise<void> }>

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
  happPath: 'pathtomyhapp.happ',
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

const { statusEmitter, shutdown } = await initAgent(app, runnerOptions)

// listen on the statusEmitter for status update
statusEmitter.on(STATUS_EVENT, (status: StateSignal) => {
  // do stuff
})

// listen on the statusEmitter for the websocket port used for app
statusEmitter.on(APP_PORT_EVENT, (appPort: string) => {
  // do stuff
}
// when the app quits, holochain-runner and lair-keystore will shut down automatically

// you can also call the following, to shut them down
await shutdown()
```
