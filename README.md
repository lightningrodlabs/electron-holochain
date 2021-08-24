# electron-holochain
manage holochain processes during an electron application runtime, using [holochain-runner binaries](https://github.com/Sprillow/holochain-runner).

```typescript
// function setup(
//   app: App,
//   opts: HolochainRunnerOptions,
//   pathOptions?: PathOptions
// ): Promise<StatusUpdates>

import {app} from 'electron'
import setup, {
  StateSignal,
  StatusUpdates,
  STATUS_EVENT,
  HolochainRunnerOptions,
  PathOptions
} from 'electron-holochain'

const runnerOptions: HolochainRunnerOptions = {
  dnaPath: 'pathtomydna.dna',
  // datastorePath?: 'string'
  // appId?: string
  // appWsPort?: number
  // adminWsPort?: number
  // keystorePath?: string
  // proxyUrl?: string
}

const statusEmitter = await setup(app, runnerOptions)

// listen on the statusEmitter
statusEmitter.on(STATUS_EVENT, (status: StateSignal) => {
  // do stuff
})

// when the app quits, holochain-runner and lair-keystore will shut down automatically
```