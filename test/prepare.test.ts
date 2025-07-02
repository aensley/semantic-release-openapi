/**
 * Test prepare
 */

// Mock @semantic-release/error to avoid ESM import issues in Jest
jest.mock('@semantic-release/error', () => {
  return {
    __esModule: true,
    default: class SemanticReleaseError extends Error {
      constructor(message: string) {
        super(message)
        this.name = 'SemanticReleaseError'
      }
    }
  }
})

// Mock glob to provide a sync function for tests
jest.mock('glob', () => ({
  __esModule: true,
  default: { sync: jest.fn() },
  sync: jest.fn()
}))

import SemanticReleaseError from '@semantic-release/error'
import { readJsonSync, writeJsonSync } from 'fs-extra'
import prepare from '../src/prepare.js'
import glob from 'glob'

jest.mock('fs-extra')

const logger = {
  log: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as any

const createContext = ({ version = '1.2.3' } = {}) =>
  ({
    nextRelease: { version },
    logger,
    cwd: '/path/to/cwd'
  }) as any

const jsonFilePath = 'test/data/openapi.json'
const yamlFilePath = 'test/data/openapi.yaml'

const replaceSyncMock = jest.fn()
jest.mock('../src/getReplaceInFile', () => ({
  __esModule: true,
  default: async () => ({
    sync: replaceSyncMock
  })
}))

describe('prepare', () => {
  beforeEach(() => {
    // Always pretend every file given exists.
    ;(glob.sync as unknown as jest.Mock).mockImplementation((value: string) => {
      return [value]
    })
  })

  describe('should error', () => {
    it('if there is no version', async () => {
      const context = createContext({ version: '' }) // empty version
      expect.assertions(1) // Fail if there is no error caught.
      try {
        await prepare({ apiSpecFiles: [yamlFilePath] }, context)
      } catch (e) {
        expect(e).toEqual(new SemanticReleaseError('Could not determine the version from semantic release.'))
      }
    })

    it('if there are no paths provided', async () => {
      const context = createContext()
      expect.assertions(1) // Fail if there is no error caught.
      try {
        await prepare({ apiSpecFiles: [''] }, context)
      } catch (e) {
        expect(e).toBeInstanceOf(SemanticReleaseError)
      }
    })
  })

  describe('openapi.json', () => {
    beforeEach(() => {
      ;(readJsonSync as jest.Mock).mockReturnValue({ info: { version: '1.2.2' } })
      ;(writeJsonSync as jest.Mock).mockReturnValue(true)
    })

    it('updates the version', async () => {
      const context = createContext()

      await prepare({ apiSpecFiles: [jsonFilePath] }, context)

      expect(readJsonSync).toHaveBeenCalledTimes(1)
      expect(readJsonSync).toHaveBeenCalledWith(jsonFilePath)
      expect(writeJsonSync).toHaveBeenCalledTimes(1)
      expect(writeJsonSync).toHaveBeenCalledWith(jsonFilePath, { info: { version: '1.2.3' } }, { spaces: 2 })
    })
  })

  describe('openapi.yaml', () => {
    beforeEach(() => {
      replaceSyncMock.mockReset()
      replaceSyncMock.mockReturnValue([
        {
          file: yamlFilePath,
          hasChanged: true,
          numMatches: 1,
          numReplacements: 1
        }
      ])
      ;(writeJsonSync as jest.Mock).mockReturnValue(true)
    })
    it('updates the version', async () => {
      const context = createContext()
      await prepare({ apiSpecFiles: [yamlFilePath] }, context)
      expect(replaceSyncMock).toHaveBeenCalledTimes(1)
      expect(replaceSyncMock).toHaveBeenCalledWith({
        files: yamlFilePath,
        from: /version: ?.+$/im,
        to: 'version: 1.2.3'
      })
    })
  })
})
