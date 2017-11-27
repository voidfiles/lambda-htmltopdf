const puppeteer = require('puppeteer');

async function getPageForURL(browser, url) {
  const page = await browser.newPage();
  await page.goto(url);
  return page;
};

async function getPageForHTML(browser, html) {
  const page = await browser.newPage();
  await page.goto(url);
  return page;
};

async function generatePDFFromPage(page) {
  await page.pdf({path: 'stamp.pdf', format: 'A4'});
};

(async function (conf) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let page;
  if (conf.url) {
    page = await getPageForURL(conf.url);
  } else {
    page = await getPageForHTML(conf.html)
  }


  await page.pdf({path: 'stamp.pdf', format: 'A4'});
  await browser.close();
})();
