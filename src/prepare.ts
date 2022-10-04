import SemanticReleaseError from '@semantic-release/error'
import { readJsonSync, writeJsonSync } from 'fs-extra'
import replace from 'replace-in-file'
import { Context } from 'semantic-release'
import PluginConfig from './types'
import glob from 'glob'

const prepareApiSpecFilesYml = (apiSpecFiles: string[], version: string, logger: Context['logger']): any => {
  try {
    apiSpecFiles.forEach((fileName: string) => {
      const changedFiles = replace
        .sync({
          files: fileName,
          from: /version: ?.+$/im,
          to: 'version: ' + version
        })
        .filter((result) => result.hasChanged)
        .map((result) => result.file)
      changedFiles.forEach((changedFile: string) => {
        logger.log('Wrote version %s to %s', version, changedFile)
      })
    })
  } catch (error) {
    throw new SemanticReleaseError(error)
  }
}

const prepareApiSpecFilesJson = (apiSpecFiles: string[], version: string, logger: Context['logger']): any => {
  try {
    apiSpecFiles.forEach((fileNameGlob: string) => {
      const fileNames: string[] = glob.sync(fileNameGlob)
      fileNames.forEach((fileName: string) => {
        const specFile = readJsonSync(fileName)
        specFile.info.version = version
        writeJsonSync(fileName, specFile, { spaces: 2 })
        logger.log('Wrote version %s to %s', version, fileName)
      })
    })
  } catch (error) {
    throw new SemanticReleaseError(error)
  }
}

export default ({ apiSpecFiles, apiSpecType }: PluginConfig, { nextRelease, logger }: Context): any => {
  const version = nextRelease?.version ?? ''
  if (version.length < 1) {
    throw new SemanticReleaseError('Could not determine the version from semantic release.')
  }

  switch (apiSpecType?.toLowerCase()) {
    case 'json':
      prepareApiSpecFilesJson(apiSpecFiles, version, logger)
      break
    case 'yaml':
    case 'yml':
    default:
      prepareApiSpecFilesYml(apiSpecFiles, version, logger)
  }
}
