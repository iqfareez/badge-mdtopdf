const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer. This is to make sure
  // the puppeteer can install and call the chrome binary in the correct location.
  // https://stackoverflow.com/a/77784336/13617136 
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};