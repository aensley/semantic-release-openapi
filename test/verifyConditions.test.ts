/**
 * Test verifyConditions
 *
 * @group unit
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import SemanticReleaseError from '@semantic-release/error'

jest.unstable_mockModule('glob', () => ({
  globSync: jest.fn()
}))

const { default: verifyConditions } = await import('../src/verifyConditions.js')
const { globSync } = await import('glob')

describe('verifyConditions', () => {
  beforeEach(() => {
    ;(globSync as unknown as jest.Mock).mockImplementation((value: unknown) => {
      return [value]
    })
  })

  describe('apiSpecFiles', () => {
    it('errors if there are no paths provided', async () => {
      expect.assertions(1) // Fail if there is no error caught.
      try {
        await verifyConditions({ apiSpecFiles: [] })
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
      ;(globSync as unknown as jest.Mock).mockImplementation(() => {
        return []
      })
      expect.assertions(1) // Fail if there is no error caught.
      try {
        await verifyConditions({ apiSpecFiles: ['does-not-exist.yml'] })
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
        await verifyConditions({ apiSpecFiles: ['test/data/exists-but-invalid-extension.wrong'] })
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
