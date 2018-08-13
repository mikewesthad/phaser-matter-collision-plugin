# phaser-matter-collision

A plugin for making it easier to manage collisions with Phaser + Matter.js

## Development

The project is controlled by npm scripts and uses cypress & jest for testing. Cypress is used for end-to-end verification that the plugin works as expected with Phaser. Jest is used for unit testing the plugin (via heavy mocking since Phaser headless mode is not complete).

- The `watch` and `build` tasks will build the plugin source in library/ or the projects in tests/
- The `serve` task opens the whole project (starting at the root) in a server
- The `dev` task will build & watch the library, tests and open up the server. This is useful for creating tests and updating the library.
- The `dev:cypress` task will build & watch the library & tests, as well as open up cypress in headed mode. This is useful for checking out individual tests and debugging them.
- The `test:cypress` task will build the tests and run cypress in headless mode to check all end-to-end tests.
- The `test:jest` will run the jest tests.

## Tests

The cypress tests rely on a particular structure:

- Each test game inside of "tests/" should have an "index.html" file as the entry point. "src/js/index.js" will be compiled to "build/js/index.js" by webpack. (Cypress doesn't support `type="module"` on scripts, so this is necessary if we need modules.)
- Each test has access to `test-utils.js` which provides `startTest`, `passTest` and `failTest` methods. Call `startTest` at the beginning and pass/fail when the test passes/fails. This manipulates in the DOM in a way that cypress is expecting.
- Each test in "cypress/integration/" simply loads up the specified URL and waits for it to pass or timeout. (Technically, startTest and failTest are ignored, but they are useful for visual inspection of a test.)

The jest unit tests rely on a simple mocking of Phaser and Matter. They are stored inside "src/". Once Phaser headless is available, this testing structure could be re-evaluated
