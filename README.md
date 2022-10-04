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

- `apiSpecFiles` (**REQUIRED**): An array of OpenAPI specification file paths. Glob patterns (e.g. `'*.yaml'`) are supported.
- `apiSpecType`: The filetype of the OpenAPI spec files. Must be either `'json'` or `'yaml'`. Defaults to `'yaml'`. _All apiSpecFiles must be of the same filetype_.

### Committing Changes

**IMPORTANT**: Semantic Release will not commit changes to your OpenAPI spec files unless you add the same files in `assets` for the **@semantic-release/git** plugin! See below for examples.

### Examples

#### YAML

If your OpenAPI specification files are in YAML format, you do not have to specify the `apiSpecType`.

```json
{
  "release": {
    "plugins": [
      [
        "semantic-release-openapi",
        {
          "apiSpecFiles": ["openapi.yaml", "src/swagger-*.yaml"]
        }
      ],
      [
        "@semantic-release/git",
        {
          "assets": ["package.json", "openapi.yaml", "src/swagger-*.yaml"]
        }
      ]
    ]
  }
}
```

#### JSON

If your OpenAPI specification files are in JSON format, you **must** specify `apiSpecType` of `'json'`.

```json
{
  "release": {
    "plugins": [
      [
        "semantic-release-openapi",
        {
          "apiSpecFiles": ["openapi.json"],
          "apiSpecType": "json"
        }
      ],
      [
        "@semantic-release/git",
        {
          "assets": ["package.json", "openapi.json"]
        }
      ]
    ]
  }
}
```
