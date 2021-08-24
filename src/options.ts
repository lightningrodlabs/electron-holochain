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
  // dnaPath is required
  optionsArr = optionsArr.concat([options.dnaPath])
  if (options.datastorePath) {
    optionsArr = optionsArr.concat([options.datastorePath])
  }
  return optionsArr
}

// match the command line
// options of holochain-runner
export interface HolochainRunnerOptions {
  dnaPath: string
  datastorePath?: string
  appId?: string
  appWsPort?: number
  adminWsPort?: number
  keystorePath?: string
  proxyUrl?: string
}

export interface PathOptions {
  holochainRunnerBinaryPath: string,
  lairKeystoreBinaryPath: string
}
