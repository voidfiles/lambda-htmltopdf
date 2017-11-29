const puppeteer = require('puppeteer');
puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']}).then(function (browser) {
  browser.close();
});
