# OpenAPI Composition

This project is responsible for compiling various OpenAPI schema definitions
into a single "root level" OpenAPI specification.

## Usage

This package makes specific assumptions about how a project is structured.

It provides a single command, `build`.

The `build` command accepts a single argument, a path to a template file
used to generate the root level OpenAPI specification.

The template file should can be any valid OpenAPI file, either JSON or YAML,
but it should contain an `$imports` property that is an array of glob patterns
that will be used to find other OpenAPI files to include in the root level
OpenAPI specification:

```yaml
openapi: 3.1.0
paths:
  $imports: ['**/openapi.yaml']
```

The `build` command will generate a single OpenAPI specification file
that contains all of the `path` definitions from the imported files.

## Contributing

The following developer scripts are provided:

- `build`: Build the project.
- `clean`: Remove build artifacts.
- `lint`: Run ESLint.
- `pretty`: Check formatting using prettier.
