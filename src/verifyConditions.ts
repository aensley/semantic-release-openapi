import SemanticReleaseError from '@semantic-release/error'
import { fdir } from 'fdir'
import { extname } from 'node:path'
import type PluginConfig from './@types/pluginConfig.js'

/**
 * verifyConditions hook for semantic release
 *
 * @throws {SemanticReleaseError}
 */
const verifyConditions = async ({ apiSpecFiles }: PluginConfig): Promise<any> => {
  if (apiSpecFiles.length < 1) {
    throw new SemanticReleaseError(
      'Option "apiSpecFiles" was not included in the plugin config. See the README for instructions.',
      'ENOAPISPECFILES'
    )
  }

  const expectedExts: string[] = ['json', 'yaml', 'yml']
  let specFilesFound: boolean = false
  apiSpecFiles.forEach((fileNameGlob: string) => {
    // eslint-disable-next-line new-cap
    const fileNames: string[] = new fdir().glob(fileNameGlob).withBasePath().crawl('.').sync() as string[]
    if (fileNames.length > 0) {
      specFilesFound = true
      fileNames.forEach((fileName: string) => {
        if (!expectedExts.includes(extname(fileName).slice(1))) {
          throw new SemanticReleaseError(
            'File "' + fileName + '" is not valid. Must be a file with .json, .yaml, or .yml extension',
            'EINVALIDAPISPECFILETYPE'
          )
        }
      })
    }
  })

  if (!specFilesFound) {
    throw new SemanticReleaseError(
      'No files match the paths in "apiSpecFiles". Check your plugin config and try again.',
      'EINVALIDAPISPECFILES'
    )
  }
}

export default verifyConditions
