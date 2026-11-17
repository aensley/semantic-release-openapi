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
jest.unstable_mockModule('jsonfile', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}))
jest.unstable_mockModule('node:fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}))

const { default: prepare } = await import('../src/prepare.js')
const { readFileSync: readJsonSync, writeFileSync: writeJsonSync } = await import('jsonfile')
const { readFileSync, writeFileSync } = await import('node:fs')

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
      ;(readFileSync as unknown as jest.Mock).mockReturnValue('info:\n  version: 1.2.2\n')
      ;(writeFileSync as unknown as jest.Mock).mockReturnValue(undefined)
    })

    it('updates the version', async () => {
      const context = createContext()

      await prepare({ apiSpecFiles: [yamlFilePath] }, context)

      expect(readFileSync).toHaveBeenCalledTimes(1)
      expect(readFileSync).toHaveBeenCalledWith(yamlFilePath, 'utf8')
      expect(writeFileSync).toHaveBeenCalledTimes(1)
      expect(writeFileSync).toHaveBeenCalledWith(yamlFilePath, 'info:\n  version: 1.2.3\n')
    })

    const expectYamlTransform = async (input: string, expected: string) => {
      ;(readFileSync as unknown as jest.Mock).mockReturnValue(input)
      await prepare({ apiSpecFiles: [yamlFilePath] }, createContext({ version: '1.3.0' }))
      expect(writeFileSync).toHaveBeenCalledWith(yamlFilePath, expected)
    }

    it('ignores "version:" inside comments', async () => {
      await expectYamlTransform(
        '# Generated from api.proto, schema version: 3\nopenapi: 3.0.3\ninfo:\n  title: Demo API\n  version: 1.2.3\npaths: {}\n',
        '# Generated from api.proto, schema version: 3\nopenapi: 3.0.3\ninfo:\n  title: Demo API\n  version: 1.3.0\npaths: {}\n'
      )
    })

    it('ignores "version:" inside string values', async () => {
      await expectYamlTransform(
        'openapi: 3.0.3\ninfo:\n  title: Demo API\n  description: "Requires client version: 2 or later."\n  version: 1.2.3\npaths: {}\n',
        'openapi: 3.0.3\ninfo:\n  title: Demo API\n  description: "Requires client version: 2 or later."\n  version: 1.3.0\npaths: {}\n'
      )
    })

    it('ignores other "version" keys that appear before info', async () => {
      await expectYamlTransform(
        'x-meta:\n  version: 9\nx-api-version: 4\ninfo:\n  version: 1.2.3\n',
        'x-meta:\n  version: 9\nx-api-version: 4\ninfo:\n  version: 1.3.0\n'
      )
    })

    it('preserves double quotes', async () => {
      await expectYamlTransform('info:\n  version: "1.2.3"\n', 'info:\n  version: "1.3.0"\n')
    })

    it('preserves single quotes', async () => {
      await expectYamlTransform("info:\n  version: '1.2.3'\n", "info:\n  version: '1.3.0'\n")
    })

    it('preserves trailing comments on the version line', async () => {
      await expectYamlTransform('info:\n  version: 1.2.3 # managed\n', 'info:\n  version: 1.3.0 # managed\n')
    })

    it('supports flow-style info mappings', async () => {
      await expectYamlTransform('info: { title: X, version: 1.2.3 }\n', 'info: { title: X, version: 1.3.0 }\n')
    })

    it('preserves CRLF line endings', async () => {
      await expectYamlTransform(
        'openapi: 3.0.3\r\ninfo:\r\n  version: 1.2.3\r\n',
        'openapi: 3.0.3\r\ninfo:\r\n  version: 1.3.0\r\n'
      )
    })

    it('errors if info.version is missing', async () => {
      ;(readFileSync as unknown as jest.Mock).mockReturnValue('openapi: 3.0.3\ninfo:\n  title: Demo API\n')
      expect.assertions(3)
      try {
        await prepare({ apiSpecFiles: [yamlFilePath] }, createContext())
      } catch (e) {
        expect(e).toBeInstanceOf(SemanticReleaseError)
        expect(String((e as SemanticReleaseError).message)).toContain('No info.version field found')
      }
      expect(writeFileSync).not.toHaveBeenCalled()
    })

    it('errors if the YAML is invalid', async () => {
      ;(readFileSync as unknown as jest.Mock).mockReturnValue('info:\n  description: "unterminated\n  version: 1.2.3\n')
      expect.assertions(3)
      try {
        await prepare({ apiSpecFiles: [yamlFilePath] }, createContext())
      } catch (e) {
        expect(e).toBeInstanceOf(SemanticReleaseError)
        expect(String((e as SemanticReleaseError).message)).toContain('Could not parse')
      }
      expect(writeFileSync).not.toHaveBeenCalled()
    })
  })
})
