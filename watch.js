const { execFile } = require('child_process')
const {
  copyFile,
  createWriteStream,
  stat,
  unlink,
} = require('fs')
const pathUtils = require('path')
const browserify = require('browserify')
const chalk = require('chalk')
const chokidar = require('chokidar')

const WATCH_DIR = './src'
const BUILD_SCRIPT = './build.sh'
const WEBSITE_DIR = './website'
const BUNDLE_SOURCE_NAME = 'index.js'

const log = (str) => console.log(chalk.blue('#'), str)
const error = (str, err) => console.log(chalk.red('#'), 'Error:', str, err)

const rebuildHandler = getWatchHandler(rebuild)
const unlinkHandler = getWatchHandler(unlink)

chokidar.watch(WATCH_DIR, { ignoreInitial: true })
  .on('ready', initialBuild)
  .on('add', rebuildHandler)
  .on('change', rebuildHandler)
  .on('unlink', unlinkHandler)
  .on('error', (err) => {
    error('Unexpected watcher error.', err)
    process.exit(1)
  })

log(`Watching '${WATCH_DIR}' and rebuilding website on changes.`)

// Watch event middleware

/**
 * Returns a wrapper for a specific watch event action, that performs some
 * work/validation required in all cases.
 * 
 * @param {Function} action - The watch event action.
 * @returns {Function} The wrapped watch event action.
 */
function getWatchHandler (action) {
  return (filePath) => {
    const fileName = pathUtils.basename(filePath)
    stat(filePath, (err, statResult) => {
      if (err) {

        if (err.code === 'ENOENT') {
          return // file was deleted
        }
        error('Unexpected fs.stat error', err)

        process.exit(1)
      } else if (statResult.isDirectory()) {

        error(`Unexpected directory '${filePath}' in 'src' folder. Directories are not supported; please flatten 'src' and try again.`)
        process.exit(1)
      } else {
        action({ srcFilePath: filePath, fileName })
      }
    })
  }
}

// Watch event handlers

/**
 * Completely rebuilds website from source files.
 * To be performed on initialization.
 */
function initialBuild () {
  execFile(BUILD_SCRIPT, (err, _stdout, _stderr) => {
    if (err) {
      error('Unexpected error on initial build of website.', err)
      process.exit(1)
    } else {
      log('Website ready.')
    }
  })
}

/**
 * Performs necessary build work for the given source file.
 *
 * @param {Object} opts - Options bag.
 * @param {string} opts.srcFilePath - The path to the file to rebuild.
 * @param {string} opts.fileName - The name of the file.
 */
function rebuild ({ srcFilePath, fileName }) {

  const destFilePath = pathUtils.join(WEBSITE_DIR, fileName)

  if (fileName === BUNDLE_SOURCE_NAME) {
    bundle(srcFilePath, destFilePath, fileName)
  } else {
    copyFile(srcFilePath, destFilePath, (err) => {
      if (err) {
        error(`Failed to copy '${fileName}' to '${WEBSITE_DIR}'.`, err)
      } else {
        log(`Copied '${fileName}'.`)
      }
    })
  }
}

/**
 * Bundles the given source file using browserify, outputting it at the
 * given destination.
 *
 * @param {string} srcPath - The path to the source file.
 * @param {string} destPath - The path to the destination file.
 * @param {string} fileName - The complete name of the file (path.basename).
 */
function bundle (srcPath, destPath, fileName) {

  const outStream = getOutStream()

  browserify()
    .add(srcPath)
    .bundle()
    .pipe(outStream)

  function getOutStream () {
    const stream = createWriteStream(destPath)
    stream.on('error', (err) => error(
      `Failed to bundle '${fileName}'.`,
      err,
    ))
    stream.on('finish', () => log(`Rebundled '${fileName}'.`))
    return stream
  }
}

/**
 * Attempts to delete (unlink) the output file corresponding to the given
 * source file.
 *
 * @param {Object} opts - Options bag.
 * @param {string} opts.fileName - The name of the source file.
 */
function deleteFile ({ fileName }) {

  unlink(pathUtils.join(WEBSITE_DIR, fileName), (err) => {
    if (err) {
      error(`Failed to delete '${fileName}' from '${WEBSITE_DIR}'.`, err)
    } else {
      log(`Deleted '${fileName}'.`)
    }
  })
}
