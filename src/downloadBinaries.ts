import * as request from 'request'
import * as fs from 'fs'
import { chmod } from 'fs/promises'
import * as path from 'path'
import * as tar from 'tar'
import {
  binariesDirectory,
  defaultHolochainRunnerBinaryPath,
} from './binaries.js'

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

  let platformArch: string = process.platform
  // darwin means MacOS
  if (platformArch === 'darwin') {
    if (process.arch === 'arm64') {
      platformArch = 'darwinArm64'
    } else if (process.arch === 'x64') {
      platformArch = 'darwinX64'
    }
  }
  const holochainRunnerFilenames = {
    win32: 'holochain-runner-x86_64-pc-windows-msvc.tar.gz',
    darwinX64: 'holochain-runner-x86_64-apple-darwin.tar.gz',
    darwinArm64: 'holochain-runner-arm64-apple-darwin.tar.gz',
    linux: 'holochain-runner-x86_64-unknown-linux-gnu.tar.gz',
  }
  const holochainRunnerCompressedUrl = `https://github.com/lightningrodlabs/holochain-runner/releases/download/${tag}/${holochainRunnerFilenames[platformArch]}`
  const compressedTempFilename = path.join(
    binariesDirectory,
    holochainRunnerFilenames[platformArch]
  )
  await download(holochainRunnerCompressedUrl, compressedTempFilename)
  await tar.x({ file: compressedTempFilename, cwd: binariesDirectory })
  fs.rmSync(compressedTempFilename)
  // defaultHolochainRunnerBinaryPath
  await chmod(defaultHolochainRunnerBinaryPath, 511)
}

;(async () => {
  try {
    // current holochain-runner release version
    // version-bump
    const holochainRunnerTag = 'v0.5.0'
    await downloadBinaries(holochainRunnerTag)
  } catch (e) {
    console.log(e)
  }
})()
