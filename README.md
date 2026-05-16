# semantic-release-openapi

[![npm](https://img.shields.io/npm/v/semantic-release-openapi.svg)][npm]
[![npm types](https://badgen.net/npm/types/semantic-release-openapi?icon=typescript)][npm]
[![license](https://img.shields.io/github/license/aensley/semantic-release-openapi.svg)](https://github.com/aensley/semantic-release-openapi/blob/main/LICENSE)
[![prettier](https://img.shields.io/badge/prettier-ff69b4.svg?&logo=prettier&logoColor=fff)](https://prettier.io/)
[![standard](https://img.shields.io/badge/standard-f3df49.svg?logo=standardjs&logoColor=000)](https://standardjs.com/)
[![bundle size](https://img.shields.io/bundlephobia/min/semantic-release-openapi.svg?label=size)](https://bundlephobia.com/package/semantic-release-openapi)
[![npm downloads](https://img.shields.io/npm/dw/semantic-release-openapi.svg)][npm]<br>
[![Maintainability](https://qlty.sh/gh/aensley/projects/semantic-release-openapi/maintainability.svg)][qltysh]
[![Test Coverage](https://qlty.sh/gh/aensley/projects/semantic-release-openapi/coverage.svg)][qltysh]
[![test](https://github.com/aensley/semantic-release-openapi/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/aensley/semantic-release-openapi/actions/workflows/test.yml)
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/aensley/semantic-release-openapi.svg?label=ossf%20score)](https://scorecard.dev/viewer/?uri=github.com/aensley/semantic-release-openapi)

A Semantic Release plugin to update versions in OpenAPI / Swagger specification files.

## Installation

This module is distributed via npm and should be installed as one of your project's `devDependencies`:

```bash
npm install --save-dev semantic-release-openapi
```

## Usage

### Plugin Config

This plugin has one configuration option which must be supplied.

- **`apiSpecFiles`**: An array of OpenAPI / Swagger specification file paths. [Glob patterns](https://www.gnu.org/software/bash/manual/bash.html#Pattern-Matching) (e.g. `'*.yaml'`) are supported.

  _All matching files must have a `.json`, `.yaml`, or `.yml` extension._

### Committing Changes

**IMPORTANT**: Semantic Release will not commit changes to your OpenAPI spec files unless you add the same files in `assets` for the **@semantic-release/git** plugin! See the example below.

### Example

```json
{
  "release": {
    "plugins": [
      [
        "semantic-release-openapi",
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

[npm]: https://www.npmjs.com/package/semantic-release-openapi
[qltysh]: https://qlty.sh/gh/aensley/projects/semantic-release-openapi
