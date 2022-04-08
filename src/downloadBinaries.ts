import * as request from 'request'
import * as fs from 'fs'
import { chmod } from 'fs/promises'
import * as path from 'path'
import * as tar from 'tar'
import {
  binariesDirectory,
  defaultHolochainRunnerBinaryPath,
  defaultLairKeystoreBinaryPath,
} from './binaries'

async function download(url: string, dest: string) {
  /* Create an empty file where we can save data */
  const file = fs.createWriteStream(dest)

  /* Using Promises so that we can use the ASYNC AWAIT syntax */
  await new Promise<void>((resolve, reject) => {
    request({
      /* Here you should specify the exact link to the file you are trying to download */
      uri: url,
      gzip: true,
    })
      .pipe(file)
      .on('finish', async () => {
        console.log(`${dest} is finished downloading.`)
        resolve()
      })
      .on('error', (error: Error) => {
        reject(error)
      })
  }).catch((error) => {
    console.log(`Something happened: ${error}`)
  })
}

async function downloadBinaries(tag: string) {
  fs.rmSync(binariesDirectory, { recursive: true, force: true })
  fs.mkdirSync(binariesDirectory)
  const holochainRunnerFilenames = {
    win32: 'holochain-runner-x86_64-pc-windows-msvc.tar.gz',
    darwin: 'holochain-runner-x86_64-apple-darwin.tar.gz',
    linux: 'holochain-runner-x86_64-unknown-linux-gnu.tar.gz'
  }
  const lairKeystoreFilenames = {
    win32: 'lair-keystore-x86_64-pc-windows-msvc.exe',
    darwin: 'lair-keystore-x86_64-apple-darwin',
    linux: 'lair-keystore-x86_64-unknown-linux-gnu'
  }
  const lairKeystoreUrl = `https://github.com/ddd-mtl/holochain-runner/releases/download/${tag}/${lairKeystoreFilenames[process.platform]}`
  await download(lairKeystoreUrl, defaultLairKeystoreBinaryPath)
  const holochainRunnerCompressedUrl = `https://github.com/ddd-mtl/holochain-runner/releases/download/${tag}/${holochainRunnerFilenames[process.platform]}`
  const compressedTempFilename = path.join(
    binariesDirectory,
    holochainRunnerFilenames[process.platform]
  )
  await download(holochainRunnerCompressedUrl, compressedTempFilename)
  await tar.x({ file: compressedTempFilename, cwd: binariesDirectory })
  fs.rmSync(compressedTempFilename)
  // defaultHolochainRunnerBinaryPath
  await chmod(defaultLairKeystoreBinaryPath, 511)
  await chmod(defaultHolochainRunnerBinaryPath, 511)
}

;(async () => {
  try {
    // current holochain-runner release version
    // version-bump
    const holochainRunnerTag = 'v0.0.36-rc2'
    await downloadBinaries(holochainRunnerTag)
  } catch (e) {
    console.log(e)
  }
})()
