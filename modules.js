console.log(arguments);
console.log(require('module').wrapper);

// module.exports
const C = require('./test-module-1');
const calc1 = new C();
console.log(calc1.add(2, 5));

// exports
const calc2 = require('./test-module-2');
console.log(calc2.multiply(2, 3));
const { multiply, add, divide } = require('./test-module-2');
console.log(multiply(2, 3));

// Caching
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();
/**
 * Results:
 * Hello from the top module
 * Log this beautiful text 👋
 * Log this beautiful text 👋
 * Log this beautiful text 👋
 *
 * Explain:
 * 'Hello from the top module' is only executed once because the NodeJS only required a function once
 *    due to caching.
 */
