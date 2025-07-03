/**
 * Test verifyConditions
 */

jest.mock('@semantic-release/error', () => {
  return {
    __esModule: true,
    default: class SemanticReleaseError extends Error {
      constructor(message: string, code?: string) {
        super(message)
        this.name = 'SemanticReleaseError'
        if (code) (this as any).code = code
      }
    }
  }
})

let SemanticReleaseError: any
beforeAll(async () => {
  SemanticReleaseError = (await import('@semantic-release/error')).default
})

import { verifyConditions } from '../src/index.js'

// Configurable mock for fdir
let mockFiles: string[] = []
jest.mock('fdir', () => {
  class fdirMock {
    glob() {
      return this
    }
    crawl() {
      return this
    }
    sync() {
      return mockFiles
    }
  }
  return { __esModule: true, fdir: fdirMock }
})

describe('verifyConditions', () => {
  beforeEach(() => {
    mockFiles = []
  })

  describe('apiSpecFiles', () => {
    it('errors if there are no paths provided', async () => {
      mockFiles = []
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
      mockFiles = []
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
      mockFiles = ['test/data/exists-but-invalid-extension.wrong']
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
