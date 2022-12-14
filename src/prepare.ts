import SemanticReleaseError from '@semantic-release/error'
import { readJsonSync, writeJsonSync } from 'fs-extra'
import replace from 'replace-in-file'
import { Context } from 'semantic-release'
import PluginConfig from './@types/pluginConfig'
import glob from 'glob'

/**
 * Prepare the API Spec files
 *
 * @param {string[]}          apiSpecFiles List of api spec file paths, globs supported
 * @param {string}            version      The version string to write to the files
 * @param {Context['logger']} logger       The semantic release logger instance
 *
 * @throws {SemanticReleaseError}
 */
const prepareApiSpecFiles = (apiSpecFiles: string[], version: string, logger: Context['logger']): any => {
  try {
    apiSpecFiles.forEach((fileNameGlob: string) => {
      const fileNames: string[] = glob.sync(fileNameGlob)
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
  const changedFiles = replace
    .sync({
      files: apiSpecFile,
      from: /version: ?.+$/im,
      to: 'version: ' + version
    })
    .filter((result) => result.hasChanged)
    .map((result) => result.file)
  return changedFiles
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
export default ({ apiSpecFiles }: PluginConfig, { nextRelease, logger }: Context): any => {
  const version = nextRelease?.version ?? ''
  if (version.length < 1) {
    throw new SemanticReleaseError('Could not determine the version from semantic release.')
  }

  prepareApiSpecFiles(apiSpecFiles, version, logger)
}
