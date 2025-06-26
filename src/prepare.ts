// Use dynamic import for @semantic-release/error in src/prepare.ts
// Replace all top-level require/import for @semantic-release/error with dynamic import inside the exported function
import { readJsonSync, writeJsonSync } from 'fs-extra'
import PluginConfig from './@types/pluginConfig'
import glob from 'glob'
import getReplaceInFile from './getReplaceInFile'

/**
 * Prepare the API Spec files
 *
 * @param {string[]}          apiSpecFiles List of api spec file paths, globs supported
 * @param {string}            version      The version string to write to the files
 * @param {Context['logger']} logger       The semantic release logger instance
 *
 * @throws {SemanticReleaseError}
 */
const prepareApiSpecFiles = async (apiSpecFiles: string[], version: string, logger: any): Promise<any> => {
  const SemanticReleaseError = (await import('@semantic-release/error')).default
  try {
    for (const fileNameGlob of apiSpecFiles) {
      const fileNames: string[] = (glob as any).sync(fileNameGlob)
      for (const fileName of fileNames) {
        let results: string[]
        if (fileName.split('.').pop() === 'json') {
          results = prepareApiSpecFileJson(fileName, version)
        } else {
          results = await prepareApiSpecFileYml(fileName, version)
        }
        results.forEach((resultFileName: string) => {
          logger.log('Wrote version %s to %s', version, resultFileName)
        })
      }
    }
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
const prepareApiSpecFileYml = async (apiSpecFile: string, version: string): Promise<string[]> => {
  const replace = await getReplaceInFile()
  return (replace as any)
    .sync({
      files: apiSpecFile,
      from: /version: ?.+$/im,
      to: 'version: ' + version
    })
    .filter((result: any) => result.hasChanged)
    .map((result: any) => result.file)
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
export default async function ({ apiSpecFiles }: PluginConfig, { nextRelease, logger }: any): Promise<any> {
  const version = nextRelease?.version ?? ''
  if (version.length < 1) {
    const SemanticReleaseError = (await import('@semantic-release/error')).default
    throw new SemanticReleaseError('Could not determine the version from semantic release.')
  }
  await prepareApiSpecFiles(apiSpecFiles, version, logger)
}
