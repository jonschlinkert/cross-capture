# cross-capture [![NPM version](https://img.shields.io/npm/v/cross-capture.svg?style=flat)](https://www.npmjs.com/package/cross-capture) [![NPM monthly downloads](https://img.shields.io/npm/dm/cross-capture.svg?style=flat)](https://npmjs.org/package/cross-capture) [![NPM total downloads](https://img.shields.io/npm/dt/cross-capture.svg?style=flat)](https://npmjs.org/package/cross-capture)  [![Tests](https://github.com/jonschlinkert/cross-capture/actions/workflows/test.yml/badge.svg)](https://github.com/jonschlinkert/cross-capture/actions/workflows/test.yml)

> Capture screenshots programmatically. Cross-platform, with support for MacOS (Darwin), Windows, and Linux.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save cross-capture
```

## Usage

```js
import {
  capture, // Automatically detect platform
  captureLinux, // Capture on Linux
  captureDarwin, // Capture on MacOS
  captureWindows // Capture on Windows
} from 'cross-capture';

const result = await capture({
  cursor: true
  format: 'png', // this is the default
  window: { interactive: true } // this is the default
})
```

## Requirements

* macOS: Built-in support
* Linux: One of:
  - grim + slurp (Wayland)
  - maim (X11)
  - ImageMagick (import command)
* Windows: PowerShell 5.0+

## API

### capture

Take a screenshot with the specified options. Returns a Promise that resolves to a base64-encoded image or an error object.

```js
import { capture } from 'cross-capture';

// Take a full screen screenshot
const result = await capture();
console.log(result.data); // Base64 encoded PNG

// Take a screenshot of a specific region
const region = await capture({
  region: { x: 0, y: 0, width: 800, height: 600 }
});
```

### captureDarwin

macOS-specific screenshot function using the `screencapture` command. Supports window capture by ID or title and includes interactive window selection.

```js
import { captureDarwin } from 'cross-capture';

// Capture active window with cursor
const screenshot = await captureDarwin({
  window: { interactive: true },
  cursor: true
});

// Capture specific window by title
const terminal = await captureDarwin({
  window: { title: 'Terminal' }
});

// Capture window by ID
const byId = await captureDarwin({
  window: { id: '12345' }
});
```

### captureLinux

Linux-specific screenshot function that automatically detects and uses the appropriate tools:

* Wayland: Uses `grim` for capture and `slurp` for selection
* X11: Uses `maim` for capture and `xdotool` for window management

```js
import { captureLinux } from 'cross-capture';

// Capture window by title
const browser = await captureLinux({
  window: { title: 'Firefox' }
});

// Capture region with cursor
const region = await captureLinux({
  cursor: true,
  region: {
    x: 100,
    y: 100,
    width: 500,
    height: 300
  }
});

// Interactive selection (uses slurp on Wayland, maim -s on X11)
const selected = await captureLinux();
```

### captureWindows

Windows-specific screenshot function using PowerShell and Windows Forms. Interactive selection is implemented via a semi-transparent form overlay. Window capture requires exact window title match.

```js
import { captureWindows } from 'cross-capture';

// Interactive region selection
const region = await captureWindows();

// Capture specific window
const notepad = await captureWindows({
  window: { title: 'Untitled - Notepad' }
});

// Capture region as JPG
const jpg = await captureWindows({
  format: 'jpg',
  region: {
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  }
});
```

### Options

The following options can be passed to the capture functions:

#### interactive

Type: `boolean`
Default: `false`

Enable interactive selection mode (where supported).

```js
const screenshot = await capture({ interactive: true });
```

#### cursor

Type: `boolean`
Default: `false`

Include the cursor in the screenshot.

```js
const withCursor = await capture({ cursor: true });
```

#### format

Type: `string`
Default: `'png'`

Output format for the screenshot. Supported values: `'png'`, `'jpg'`.

```js
const jpgScreenshot = await capture({ format: 'jpg' });
```

#### quality

Type: `number`
Default: `100`

JPEG quality (0-100) when using `format: 'jpg'`.

```js
const compressed = await capture({
  format: 'jpg',
  quality: 80
});
```

#### region

Type: `object`

Capture a specific region of the screen.

Properties:

* `x` (number): X coordinate
* `y` (number): Y coordinate
* `width` (number): Width of region
* `height` (number): Height of region

```js
const region = await capture({
  region: {
    x: 100,
    y: 100,
    width: 500,
    height: 300
  }
});
```

#### window

Type: `object`

Capture a specific window.

Properties:

* `title` (string): Window title to match
* `id` (string): Window ID (macOS only)
* `interactive` (boolean): Interactive window selection

```js
// Capture by window title
const window = await capture({
  window: { title: 'Terminal' }
});

// Interactive window selection (macOS)
const selected = await capture({
  window: { interactive: true }
});
```

#### tempFile

Type: `string`

Custom temporary file path for the screenshot.

```js
const custom = await capture({
  tempFile: '/tmp/my-screenshot.png'
});
```

## Release History

### v1.0.0

* Initial release with cross-platform support
* Basic screenshot capabilities
* Window and region capture support

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Author

**Jon Schlinkert**

* [GitHub Profile](https://github.com/jonschlinkert)
* [Twitter Profile](https://twitter.com/jonschlinkert)
* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)

### License

Copyright © 2025, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the MIT License.

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on April 13, 2025._
