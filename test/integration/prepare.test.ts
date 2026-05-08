/**
 * @group integration
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { fileURLToPath } from 'node:url'
import { readJsonSync } from 'fs-extra'
import type { PrepareContext } from 'semantic-release'

const { default: prepare } = await import('../../src/prepare.js')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, 'fixtures')

const createContext = (version = '2.0.0') =>
  ({
    nextRelease: { version },
    logger: { log: () => {}, info: () => {}, success: () => {}, warn: () => {}, error: () => {} },
    cwd: process.cwd()
  }) as unknown as PrepareContext

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sr-openapi-test-'))
  fs.copyFileSync(path.join(fixturesDir, 'openapi.json'), path.join(tmpDir, 'openapi.json'))
  fs.copyFileSync(path.join(fixturesDir, 'openapi.yaml'), path.join(tmpDir, 'openapi.yaml'))
  fs.copyFileSync(path.join(fixturesDir, 'openapi.yml'), path.join(tmpDir, 'openapi.yml'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true })
})

const itUpdatesTheVersionYaml = (fileName: string) => {
  it('updates the version', async () => {
    const filePath = path.join(tmpDir, fileName)
    await prepare({ apiSpecFiles: [filePath] }, createContext('2.0.0'))
    const content = fs.readFileSync(filePath, 'utf8')
    expect(content).toContain('version: 2.0.0')
    expect(content).not.toContain('version: 1.0.0')
  })
}

const itDoesNotUpdateOtherFieldsYaml = (fileName: string) => {
  it('does not alter other fields', async () => {
    const filePath = path.join(tmpDir, fileName)
    await prepare({ apiSpecFiles: [filePath] }, createContext('2.0.0'))
    const content = fs.readFileSync(filePath, 'utf8')
    expect(content).toContain('title: Test API')
    expect(content).toContain("openapi: '3.0.0'")
  })
}

describe('prepare', () => {
  describe('openapi.json', () => {
    it('updates the version', async () => {
      const filePath = path.join(tmpDir, 'openapi.json')
      await prepare({ apiSpecFiles: [filePath] }, createContext('2.0.0'))
      const result = readJsonSync(filePath)
      expect(result.info.version).toBe('2.0.0')
    })

    it('does not alter other fields', async () => {
      const filePath = path.join(tmpDir, 'openapi.json')
      await prepare({ apiSpecFiles: [filePath] }, createContext('2.0.0'))
      const result = readJsonSync(filePath)
      expect(result.openapi).toBe('3.0.0')
      expect(result.info.title).toBe('Test API')
    })
  })

  describe('openapi.yaml', () => {
    itUpdatesTheVersionYaml('openapi.yaml')
    itDoesNotUpdateOtherFieldsYaml('openapi.yaml')
  })

  describe('openapi.yml', () => {
    itUpdatesTheVersionYaml('openapi.yml')
    itDoesNotUpdateOtherFieldsYaml('openapi.yml')
  })

  describe('glob patterns', () => {
    it('updates all matched files', async () => {
      await prepare({ apiSpecFiles: [path.join(tmpDir, '*.yaml'), path.join(tmpDir, '*.yml')] }, createContext('3.1.0'))
      const yamlContent = fs.readFileSync(path.join(tmpDir, 'openapi.yaml'), 'utf8')
      const ymlContent = fs.readFileSync(path.join(tmpDir, 'openapi.yml'), 'utf8')
      expect(yamlContent).toContain('version: 3.1.0')
      expect(ymlContent).toContain('version: 3.1.0')
    })
  })
})
