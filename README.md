# electron-holochain

**Built-in Holochain Version: [v0.2.3-beta-rc.1](https://github.com/holochain/holochain/blob/main-0.2/CHANGELOG.md#20230930114759)**

**Important: Expects an HAPP built with HDK [~v0.2.2](https://docs.rs/hdk/0.2.2/hdk/index.html) and HDI [~v0.3.2](https://docs.rs/hdi/0.3.2/hdi/index.html)**

An alternative Holochain conductor binary useful for quick startup and including handling of key generation and hApp installation. Useful for production and development environments.

manage holochain processes during an electron application runtime, using [holochain-runner binary](https://github.com/lightningrodlabs/holochain-runner).

```typescript
// function initAgent(
//   app: App,
//   opts: ElectronHolochainOptions,
//   pathOptions?: PathOptions
// ): Promise<{ statusEmitter: StatusUpdates, shutdown: () => Promise<void> }>

import {app} from 'electron'
import initAgent, {
  StateSignal,
  StatusUpdates,
  STATUS_EVENT,
  APP_PORT_EVENT,
  ERROR_EVENT,
  LOG_EVENT,
  ElectronHolochainOptions,
  PathOptions
} from 'electron-holochain'

const runnerOptions: ElectronHolochainOptions = {
  happPath: 'pathtomyhapp.happ',
  keystorePath: string
  passphrase: string
  // datastorePath?: 'string' default: databases
  // appId?: string
  // appWsPort?: number
  // adminWsPort?: number
  // webrtcSignalUrl?: string
  // bootstrapUrl?: string
  // networkSeed?: string
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

// listen for normal log messages
statusEmitter.on(LOG_EVENT, (log: string) => {
  // do stuff
})

// listen for errors
statusEmitter.on(ERROR_EVENT, (error: Error) => {
  // do stuff
})
// when the app quits, holochain-runner and lair-keystore will shut down automatically

// you can also call the following, to shut them down
await shutdown()
```


## Updating holochain-runner version and releasing

Go to [./src/downloadBinaries.ts](./src/downloadBinaries.ts) and search for 'version-bump'.
Change the value of `const holochainRunnerTag = 'v0.7.9'` to the version of holochain-runner you want to bundle.
This will instructs clients to download that version of the holochain-runner binary from Github, during `npm install`.

To get this to trigger, run `npm run try-binary-download`.

## Publishing

Bump the package.json version. 
Commit. Tag. Push.
Run `npm run build` to build the typescript.
Then run `npm publish --access public` to publish to npmjs.com.
