// translate the options object into
// an array of arguments that get passed to a ChildProcess exec call
// for the holochain-runner binary
export function constructOptions(options: HolochainRunnerOptions): string[] {
  let optionsArr = []

  // optionals
  if (options.keystorePath) {
    optionsArr = optionsArr.concat(['--keystore-path', options.keystorePath])
  }
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
  if (options.webrtcSignalUrl) {
    optionsArr = optionsArr.concat(['--proxy-url', options.webrtcSignalUrl])
  }
  // if (options.membraneProof) {
  //   optionsArr = optionsArr.concat(['--membrane-proof', options.membraneProof])
  // }
  if (options.bootstrapUrl) {
    optionsArr = optionsArr.concat(['--bootstrap-url', options.bootstrapUrl])
  }
  if (options.networkSeed) {
    optionsArr = optionsArr.concat(['--network-seed', options.networkSeed])
  }
  // happPath is required, and needs to be passed at the end
  optionsArr = optionsArr.concat([options.happPath])
  if (options.datastorePath) {
    optionsArr = optionsArr.concat([options.datastorePath])
  }
  return optionsArr
}

// match the command line
// options of holochain-runner
export interface HolochainRunnerOptions {
  happPath: string
  datastorePath?: string
  appId?: string
  appWsPort?: number
  adminWsPort?: number
  webrtcSignalUrl?: string
  // membraneProof?: string // base64
  bootstrapUrl?: string
  networkSeed?: string
  keystorePath?: string
}

// exposing this externally instead
export interface ExternalOnlyOptions {
  passphrase: string
}

export type ElectronHolochainOptions = HolochainRunnerOptions & ExternalOnlyOptions

export interface PathOptions {
  holochainRunnerBinaryPath: string,
}
