# semantic-release-openapi

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat)](https://standardjs.com)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://prettier.io)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@aensley/semantic-release-openapi)
![npm (scoped)](https://img.shields.io/npm/v/@aensley/semantic-release-openapi)

[![Maintainability](https://api.codeclimate.com/v1/badges/ac7dbc9a2d5e0bf8bd7d/maintainability)](https://codeclimate.com/github/aensley/semantic-release-openapi/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ac7dbc9a2d5e0bf8bd7d/test_coverage)](https://codeclimate.com/github/aensley/semantic-release-openapi/test_coverage)
[![Unit testing status](https://img.shields.io/github/workflow/status/aensley/semantic-release-openapi/ci/main?label=ci)](https://github.com/aensley/semantic-release-openapi/actions/workflows/ci.yml?query=branch%3Amain)

A Semantic Release plugin to update versions in OpenAPI specifications.

## Installation

This module is distributed via npm and should be installed as one of your project's `devDependencies`:

```bash
npm install --save-dev @aensley/semantic-release-openapi
```

## Usage

### Plugin Config

This plugin has one configuration option which must be supplied.

- `apiSpecFiles` (**REQUIRED**): An array of OpenAPI specification file paths. Glob patterns (e.g. `'*.yaml'`) are supported. All matching files must have a `.json`, `.yaml`, or `.yml` extension.

### Committing Changes

**IMPORTANT**: Semantic Release will not commit changes to your OpenAPI spec files unless you add the same files in `assets` for the **@semantic-release/git** plugin! See below for examples.

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
