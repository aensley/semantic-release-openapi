/**
 * Test prepare
 *
 * @group unit
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import SemanticReleaseError from '@semantic-release/error'
import type { PrepareContext } from 'semantic-release'

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
jest.unstable_mockModule('fs-extra', () => ({
  readJsonSync: jest.fn(),
  writeJsonSync: jest.fn()
}))
jest.unstable_mockModule('replace-in-file', () => ({
  replaceInFileSync: jest.fn()
}))

const { default: prepare } = await import('../src/prepare.js')
const { readJsonSync, writeJsonSync } = await import('fs-extra')
const { replaceInFileSync } = await import('replace-in-file')

const logger = {
  log: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as unknown as PrepareContext['logger']

const createContext = ({ version = '1.2.3' } = {}) =>
  ({
    nextRelease: { version },
    logger,
    cwd: '/path/to/cwd'
  }) as unknown as PrepareContext

const jsonFilePath = 'test/data/openapi.json'
const yamlFilePath = 'test/data/openapi.yaml'

describe('prepare', () => {
  beforeEach(() => {
    // Always pretend every file given exists.
    mockFdirSync.mockImplementation((value: unknown) => {
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

    it('if nextRelease is undefined', async () => {
      const context = { nextRelease: undefined, logger, cwd: '/path/to/cwd' } as unknown as PrepareContext
      expect.assertions(1) // Fail if there is no error caught.
      try {
        await prepare({ apiSpecFiles: [yamlFilePath] }, context)
      } catch (e) {
        expect(e).toEqual(new SemanticReleaseError('Could not determine the version from semantic release.'))
      }
    })
  })

  describe('openapi.json', () => {
    beforeEach(() => {
      ;(readJsonSync as unknown as jest.Mock).mockReturnValue({ info: { version: '1.2.2' } })
      ;(writeJsonSync as unknown as jest.Mock).mockReturnValue(true)
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
      ;(replaceInFileSync as unknown as jest.Mock).mockReturnValue([
        {
          file: yamlFilePath,
          hasChanged: true,
          numMatches: 1,
          numReplacements: 1
        }
      ])
      ;(writeJsonSync as unknown as jest.Mock).mockReturnValue(true)
    })

    it('updates the version', async () => {
      const context = createContext()

      await prepare({ apiSpecFiles: [yamlFilePath] }, context)

      expect(replaceInFileSync).toHaveBeenCalledTimes(1)
      expect(replaceInFileSync).toHaveBeenCalledWith({
        files: yamlFilePath,
        from: /version: ?.+$/im,
        to: 'version: 1.2.3'
      })
    })
  })
})
