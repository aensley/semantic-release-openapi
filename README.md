# semantic-release-openapi

[![npm](https://img.shields.io/npm/v/semantic-release-openapi.svg?logo=npm)][npm]
[![npm types](https://badgen.net/npm/types/semantic-release-openapi?icon=typescript)][npm]
[![license](https://img.shields.io/github/license/aensley/semantic-release-openapi.svg)](https://github.com/aensley/semantic-release-openapi/blob/main/LICENSE)
[![prettier](https://img.shields.io/badge/prettier-ff69b4.svg?&logo=prettier&logoColor=fff)](https://prettier.io/)
[![standard](https://img.shields.io/badge/standard-f3df49.svg?logo=standardjs&logoColor=000)](https://standardjs.com/)
[![npm downloads](https://img.shields.io/npm/dw/semantic-release-openapi.svg)][npm]
[![dependencies](https://img.shields.io/librariesio/release/npm/semantic-release-openapi.svg?label=deps&logo=npm)](https://libraries.io/npm/semantic-release-openapi)<br>
[![Maintainability](https://qlty.sh/gh/aensley/projects/semantic-release-openapi/maintainability.svg)][qltysh]
[![Test Coverage](https://qlty.sh/gh/aensley/projects/semantic-release-openapi/coverage.svg)][qltysh]
[![test](https://github.com/aensley/semantic-release-openapi/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/aensley/semantic-release-openapi/actions/workflows/test.yml)
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/aensley/semantic-release-openapi.svg?label=ossf)](https://scorecard.dev/viewer/?uri=github.com/aensley/semantic-release-openapi)
[![Socket](https://socket.dev/api/badge/npm/package/semantic-release-openapi)](https://socket.dev/npm/package/semantic-release-openapi)
[![snyk](https://snyk.io/test/npm/semantic-release-openapi/badge.svg)](https://security.snyk.io/package/npm/semantic-release-openapi)

A Semantic Release plugin to update versions in OpenAPI / Swagger specification files.

| Step               | Description                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `verifyConditions` | Verify existence of the `apiSpecFiles` config option, that it resolves to at least one valid `.json`, `.yml`, or `.yaml` file, and that it does not resolve to any other file types. |
| `prepare`          | Update the `info.version` field in all matching `apiSpecFiles`.                                                                                                                      |

## Installation

This module is distributed via npm and should be installed as one of your project's `devDependencies`:

```bash
npm install --save-dev semantic-release-openapi
```

## Usage

Configure the plugin wherever you have your [semantic-release configuration](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration).

## Configuration

This plugin has one configuration option which **must be supplied**.

| Option             | Description                                                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`apiSpecFiles`** | An array of OpenAPI / Swagger specification file paths.<br>[Glob patterns](https://www.gnu.org/software/bash/manual/bash.html#Pattern-Matching) (e.g. `'*.yaml'`) are supported.<br><br>_All matching files must have a `.json`, `.yaml`, or `.yml` extension._ |

> [!TIP]
>
> Semantic Release will not commit changes to your OpenAPI spec files unless you add the same files in `assets` for the **@semantic-release/git** plugin. See the examples below.

## Examples

The following examples assume you've put your `semantic-release` configuration in your `package.json` file.

### Basic Example

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

### Extended Example

```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      [
        "@semantic-release/github",
        {
          "assets": [
            {
              "path": "src/openapi.yml",
              "label": "Open API Spec"
            }
          ]
        }
      ],
      "@semantic-release/npm",
      [
        "semantic-release-openapi",
        {
          "apiSpecFiles": ["src/openapi.yml"]
        }
      ],
      [
        "@semantic-release/git",
        {
          "assets": ["package.json", "src/openapi.yml"]
        }
      ]
    ]
  }
}
```

[npm]: https://www.npmjs.com/package/semantic-release-openapi
[qltysh]: https://qlty.sh/gh/aensley/projects/semantic-release-openapi
