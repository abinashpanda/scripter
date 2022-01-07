# scripter

[![tests](https://github.com/abinashpanda/scripter/actions/workflows/tests.yml/badge.svg)](https://github.com/abinashpanda/scripter/actions/workflows/tests.yml)

## Getting Started

#### Scripts

Temporary dev script to run the CLI

```
yarn dev:cli
```

### Writing functions

```ts
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
