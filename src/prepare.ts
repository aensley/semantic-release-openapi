import SemanticReleaseError from '@semantic-release/error'
import { readFileSync as readJsonSync, writeFileSync as writeJsonSync } from 'jsonfile'
import { readFileSync, writeFileSync } from 'node:fs'
import type { PrepareContext } from 'semantic-release'
import type PluginConfig from './@types/pluginConfig.js'
import { fdir } from 'fdir'
import { isScalar, parseDocument, Scalar } from 'yaml'

/**
 * Prepare the API Spec files
 *
 * @param {string[]}          apiSpecFiles List of api spec file paths, globs supported
 * @param {string}            version      The version string to write to the files
 * @param {PrepareContext['logger']} logger       The semantic release logger instance
 *
 * @throws {SemanticReleaseError}
 */
const prepareApiSpecFiles = (apiSpecFiles: string[], version: string, logger: PrepareContext['logger']): any => {
  try {
    apiSpecFiles.forEach((fileNameGlob: string) => {
      // eslint-disable-next-line new-cap
      const fileNames: string[] = new fdir().glob(fileNameGlob).withBasePath().crawl('.').sync() as string[]
      fileNames.forEach((fileName: string) => {
        let results: string[]
        if (fileName.split('.').pop() === 'json') {
          results = prepareApiSpecFileJson(fileName, version)
        } else {
          results = prepareApiSpecFileYml(fileName, version)
        }
        results.forEach((resultFileName: string) => {
          logger.log('Wrote version %s to %s', version, resultFileName)
        })
      })
    })
  } catch (error: any) {
    throw new SemanticReleaseError(error)
  }
}

/**
 * Prepares a single API spec file in YAML format
 *
 * @param {string} apiSpecFile Single spec file to update, no globs
 * @param {string} version     The version string to write to the file
 *
 * @returns {string[]} A list of altered files
 */
const prepareApiSpecFileYml = (apiSpecFile: string, version: string): string[] => {
  const content = readFileSync(apiSpecFile, 'utf8')
  const doc = parseDocument(content)
  if (doc.errors.length > 0) {
    throw new Error(`Could not parse ${apiSpecFile}: ${doc.errors[0].message}`)
  }

  const node = doc.getIn(['info', 'version'], true)
  if (!isScalar(node) || node.range == null) {
    throw new Error(`No info.version field found in ${apiSpecFile}`)
  }

  // Splice the new value into the original source at the node's exact offsets
  // so comments, quoting, and all other formatting are preserved byte-for-byte.
  const [start, valueEnd] = node.range
  const quote = node.type === Scalar.QUOTE_DOUBLE ? '"' : node.type === Scalar.QUOTE_SINGLE ? "'" : ''
  const newContent = content.slice(0, start) + quote + version + quote + content.slice(valueEnd)
  writeFileSync(apiSpecFile, newContent)
  return [apiSpecFile]
}

/**
 * Prepares a single API spec file in JSON format
 *
 * @param {string} apiSpecFile Single spec file to update, no globs
 * @param {string} version     The version string to write to the file
 *
 * @returns {string[]} A list of altered files
 */
const prepareApiSpecFileJson = (apiSpecFile: string, version: string): string[] => {
  const specFile = readJsonSync(apiSpecFile)
  specFile.info.version = version
  writeJsonSync(apiSpecFile, specFile, { spaces: 2 })
  return [apiSpecFile]
}

/**
 * prepare hook for semantic release
 *
 * @throws {SemanticReleaseError}
 */
const prepare = ({ apiSpecFiles }: PluginConfig, { nextRelease, logger }: PrepareContext): any => {
  const version = nextRelease?.version ?? ''
  if (version.length < 1) {
    throw new SemanticReleaseError('Could not determine the version from semantic release.')
  }

  prepareApiSpecFiles(apiSpecFiles, version, logger)
}

export default prepare
