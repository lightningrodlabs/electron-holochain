// translate the options object into
// an array of arguments that get passed to a ChildProcess exec call
// for the holochain-runner binary
export function constructOptions(options: HolochainRunnerOptions): string[] {
  let optionsArr = []
  // keystoreUrl is required
  optionsArr = optionsArr.concat(['--keystore-url', options.keystoreUrl])
  // optionals
  if (options.appId) {
    optionsArr = optionsArr.concat(['--app-id', options.appId])
  }
  if (options.appWsPort) {
    optionsArr = optionsArr.concat([
      '--app-ws-port',
      options.appWsPort.toString(),
    ])
  }
  if (options.adminWsPort) {
    optionsArr = optionsArr.concat([
      '--admin-ws-port',
      options.adminWsPort.toString(),
    ])
  }
  if (options.proxyUrl) {
    optionsArr = optionsArr.concat(['--proxy-url', options.proxyUrl])
  }
  // if (options.membraneProof) {
  //   optionsArr = optionsArr.concat(['--membrane-proof', options.membraneProof])
  // }
  if (options.bootstrapUrl) {
    optionsArr = optionsArr.concat(['--bootstrap-url', options.bootstrapUrl])
  }
  if (options.uid) {
    optionsArr = optionsArr.concat(['--uid', options.uid])
  }
  // happPath is required, and needs to be passed at the end
  optionsArr = optionsArr.concat([options.happPath])
  if (options.datastorePath) {
    optionsArr = optionsArr.concat([options.datastorePath])
  }
  return optionsArr
}

// options shared by holochain-runner as well as inputted to electron-holochain
export interface ExternalInternalOptions {
  happPath: string
  datastorePath?: string
  appId?: string
  appWsPort?: number
  adminWsPort?: number
  proxyUrl?: string
  // membraneProof?: string // base64
  bootstrapUrl?: string
  uid?: string
}

// we will bury this one internally
export interface HolochainRunnerOnlyOptions {
  keystoreUrl: string
}

// exposing this externally instead
export interface ExternalOnlyOptions {
  keystorePath: string
  passphrase: string
}

// match the command line
// options of holochain-runner
export type HolochainRunnerOptions = ExternalInternalOptions & HolochainRunnerOnlyOptions

export type ElectronHolochainOptions = ExternalInternalOptions & ExternalOnlyOptions

export interface PathOptions {
  holochainRunnerBinaryPath: string,
  lairKeystoreBinaryPath: string
}
