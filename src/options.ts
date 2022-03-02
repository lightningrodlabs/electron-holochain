// translate the options object into
// an array of arguments that get passed to a ChildProcess exec call
// for the holochain-runner binary
export function constructOptions(options: HolochainRunnerOptions): string[] {
  let optionsArr = []
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
  if (options.keystorePath) {
    optionsArr = optionsArr.concat(['--keystore-path', options.keystorePath])
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
  // dnaPath is required
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
  keystorePath?: string
  proxyUrl?: string
  // membraneProof?: string // base64
  bootstrapUrl?: string
  uid?: string
}

export interface PathOptions {
  holochainRunnerBinaryPath: string,
  lairKeystoreBinaryPath: string
}
