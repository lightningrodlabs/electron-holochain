import * as path from 'path'

const windowsExtension = process.platform === 'win32' ? '.exe' : ''
const holochainRunnerBinName = `holochain-runner${windowsExtension}`
const lairKeystoreBinName = `lair-keystore${windowsExtension}`

const binariesDirectory = path.join(
  __dirname,
  // is relative to the directory where this file compiles to: dist/src
  '../../binaries'
)

const defaultHolochainRunnerBinaryPath = path.join(
  binariesDirectory,
  holochainRunnerBinName
)

const defaultLairKeystoreBinaryPath = path.join(
  binariesDirectory,
  lairKeystoreBinName
)

export {
  holochainRunnerBinName,
  lairKeystoreBinName,
  binariesDirectory,
  defaultHolochainRunnerBinaryPath,
  defaultLairKeystoreBinaryPath,
}
