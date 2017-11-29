const puppeteer = require('puppeteer');
puppeteer.launch().then(function (browser) {
  browser.close();
});
