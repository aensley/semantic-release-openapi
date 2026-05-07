/**
 * Test verifyConditions
 */

import SemanticReleaseError from '@semantic-release/error'
import verifyConditons from '../src/verifyConditions'
import glob from 'glob'

jest.mock('glob')

describe('verifyConditions', () => {
  beforeEach(() => {
    // Always pretend every file given exists.
    ;(glob.sync as jest.Mock).mockImplementation((value: string) => {
      return [value]
    })
  })

  describe('apiSpecFiles', () => {
    it('errors if there are no paths provided', async () => {
      expect.assertions(1) // Fail if there is no error caught.
      try {
        await verifyConditons({ apiSpecFiles: [] })
      } catch (e) {
        expect(e).toEqual(
          new SemanticReleaseError(
            'Option "apiSpecFiles" was not included in the plugin config. See the README for instructions.',
            'ENOAPISPECFILES'
          )
        )
      }
    })

    it('errors if none of the paths exist', async () => {
      ;(glob.sync as jest.Mock).mockImplementation((value: string) => {
        return []
      })
      expect.assertions(1) // Fail if there is no error caught.
      try {
        await verifyConditons({ apiSpecFiles: ['does-not-exist.yml'] })
      } catch (e) {
        expect(e).toEqual(
          new SemanticReleaseError(
            'No files match the paths in "apiSpecFiles". Check your plugin config and try again.',
            'EINVALIDAPISPECFILES'
          )
        )
      }
    })

    it('errors if any of the paths has an invalid extension', async () => {
      expect.assertions(1) // Fail if there is no error caught.
      try {
        await verifyConditons({ apiSpecFiles: ['test/data/exists-but-invalid-extension.wrong'] })
      } catch (e) {
        expect(e).toEqual(
          new SemanticReleaseError(
            'File "test/data/exists-but-invalid-extension.wrong" is not valid. Must be a file with .json, .yaml, or .yml extension',
            'EINVALIDAPISPECFILETYPE'
          )
        )
      }
    })
  })
})
