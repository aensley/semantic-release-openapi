# semantic-release-openapi

[![npm](https://img.shields.io/npm/v/@aensley/semantic-release-openapi)][npm]
[![npm types](https://badgen.net/npm/types/@aensley/semantic-release-openapi?icon=typescript)][npm]
[![license](https://img.shields.io/github/license/aensley/semantic-release-openapi.svg)](https://github.com/aensley/semantic-release-openapi/blob/main/LICENSE)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat)](https://standardjs.com)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://prettier.io)

[![ci](https://github.com/aensley/semantic-release-openapi/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/aensley/semantic-release-openapi/actions/workflows/ci.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/ac7dbc9a2d5e0bf8bd7d/maintainability)](https://codeclimate.com/github/aensley/semantic-release-openapi/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ac7dbc9a2d5e0bf8bd7d/test_coverage)](https://codeclimate.com/github/aensley/semantic-release-openapi/test_coverage)
[![npm downloads](https://img.shields.io/npm/dw/@aensley/semantic-release-openapi)][npm]

A Semantic Release plugin to update versions in OpenAPI specifications.

## Installation

This module is distributed via npm and should be installed as one of your project's `devDependencies`:

```bash
npm install --save-dev @aensley/semantic-release-openapi
```

## Usage

### Plugin Config

This plugin has one configuration option which must be supplied.

- **`apiSpecFiles`**: An array of OpenAPI specification file paths. [Glob patterns](https://www.npmjs.com/package/glob) (e.g. `'*.yaml'`) are supported.

  _All matching files must have a `.json`, `.yaml`, or `.yml` extension._

### Committing Changes

**IMPORTANT**: Semantic Release will not commit changes to your OpenAPI spec files unless you add the same files in `assets` for the **@semantic-release/git** plugin! See the example below.

### Example

```json
{
  "release": {
    "plugins": [
      [
        "@aensley/semantic-release-openapi",
        {
          "apiSpecFiles": ["openapi.yaml", "src/swagger-*.json"]
        }
      ],
      [
        "@semantic-release/git",
        {
          "assets": ["package.json", "openapi.yaml", "src/swagger-*.json"]
        }
      ]
    ]
  }
}
```

[npm]: https://www.npmjs.com/package/@aensley/semantic-release-openapi
