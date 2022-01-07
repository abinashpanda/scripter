# scripter

[![tests](https://github.com/abinashpanda/scripter/actions/workflows/tests.yml/badge.svg)](https://github.com/abinashpanda/scripter/actions/workflows/tests.yml)

## Getting Started

This codebase is a monorepe and uses [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/). To install all the packages, go to the root directory and run

```sh
yarn
```

#### Scripts

Temporary dev script to run the CLI

```sh
yarn dev
```

### Writing functions

To build any internal tool, you need to just create a `.ts` file in the `<rootDir>/functions` directory. For example for the function shown below we sould be the UI as shown below.

```ts
/* functions/diff.ts */

/**
 * Subtract two numbers
 *
 * @scripterTitle Subtract
 */
export default function diff(
  /** @scripterParam First Number */ first: number,
  /** @scripterParam Second Number */ second: number,
) {
  return first - second
}
```

This function would render a UI like

<img src="./assets/screenshot.png" />
