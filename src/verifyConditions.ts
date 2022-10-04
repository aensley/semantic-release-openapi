import SemanticReleaseError from '@semantic-release/error'
import PluginConfig from './types'

export default async ({ apiSpecFiles }: PluginConfig): Promise<any> => {
  if (apiSpecFiles.length < 1) {
    throw new SemanticReleaseError(
      'Option "apiSpecFiles" was not included in the plugin config. See the README for instructions.',
      'ENOAPISPECFILES'
    )
  }
}
