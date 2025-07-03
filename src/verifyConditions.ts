import { fdir } from 'fdir'
import PluginConfig from './@types/pluginConfig.js'

/**
 * verifyConditions hook for semantic release
 *
 * @throws {SemanticReleaseError}
 */
export default async function ({ apiSpecFiles }: PluginConfig): Promise<any> {
  const SemanticReleaseError = (await import('@semantic-release/error')).default
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
    const fileNames: string[] = new fdir().glob(fileNameGlob).crawl('.').sync()
    if (fileNames.length > 0) {
      specFilesFound = true
      fileNames.forEach((fileName: string) => {
        if (!expectedExts.includes(fileName.split('.').pop() ?? '')) {
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
