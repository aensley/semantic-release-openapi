# semantic-release-openapi

A Semantic Release plugin to update versions in OpenAPI specifications.

## Installation

This module is distributed via npm and should be installed as one of your project's `devDependencies`:

```bash
npm install --save-dev @aensley/semantic-release-openapi
```

## Usage

### Plugin Config

This plugin has two configuration options available.

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
