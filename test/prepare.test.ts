/**
 * Test prepare
 */

import SemanticReleaseError from '@semantic-release/error'
import { readJsonSync, writeJsonSync } from 'fs-extra'
import replace from 'replace-in-file'
import type { Context } from 'semantic-release'
import prepare from '../src/prepare'
import glob from 'glob'

jest.mock('fs-extra')
jest.mock('replace-in-file')
jest.mock('glob')

const logger = {
  log: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as unknown as Context['logger']

const createContext = ({ version = '1.2.3' } = {}) =>
  ({
    nextRelease: { version },
    logger,
    cwd: '/path/to/cwd'
  } as unknown as Context)

const jsonFilePath = 'test/data/openapi.json'
const yamlFilePath = 'test/data/openapi.yaml'

describe('prepare', () => {
  beforeEach(() => {
    // Always pretend every file given exists.
    ;(glob.sync as jest.Mock).mockImplementation((value: string) => {
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
      ;(replace.sync as jest.Mock).mockReturnValue([
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

      expect(replace.sync).toHaveBeenCalledTimes(1)
      expect(replace.sync).toHaveBeenCalledWith({
        files: yamlFilePath,
        from: /version: ?.+$/im,
        to: 'version: 1.2.3'
      })
    })
  })
})
