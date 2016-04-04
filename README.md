# generate-table-of-contents
A simple no-dependency script that generates a table of contents structure from a DOM element.

## Requirements

No other libraries are required, but it uses element.querySelectorAll so the browser must support that.

## Usage

If you're running in a plain browser environment, it will add itself to window as the function `generateTableOfContents`. If you're bundling commonjs modules, it exports a single function with the same signature.

`generateTableOfContents(DOMElement, options)`

### Options

- **startLevel**: an integer specifying the heading level to start the table at. For example, `generateTableOfContents(element, {startLevel:3})` will find all `h3`s through `h6`s under `element` and return a table of contents element with up to four levels (for headers 3, 4, 5, and 6).
- **endLevel**: an integer specifying the heading level to start the table at (values over 6 are ignored).

## Tests

`npm test` to run all the tests.

The tests use emmet's abbreviation format to cut down on manual html typing for input and expected output generation.