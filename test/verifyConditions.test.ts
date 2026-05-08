/**
 * Test verifyConditions
 *
 * @group unit
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import SemanticReleaseError from '@semantic-release/error'

const mockFdirSync = jest.fn()

jest.unstable_mockModule('fdir', () => ({
  fdir: jest.fn().mockImplementation(() => ({
    glob: (pattern: string) => ({
      withBasePath: () => ({
        crawl: () => ({
          sync: () => mockFdirSync(pattern)
        })
      })
    })
  }))
}))

const { default: verifyConditions } = await import('../src/verifyConditions.js')

describe('verifyConditions', () => {
  beforeEach(() => {
    mockFdirSync.mockImplementation((value: unknown) => {
      return [value]
    })
  })

  describe('apiSpecFiles', () => {
    it('resolves when valid files are provided', async () => {
      await expect(verifyConditions({ apiSpecFiles: ['openapi.yaml'] })).resolves.toBeUndefined()
    })

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
      mockFdirSync.mockImplementation(() => {
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
