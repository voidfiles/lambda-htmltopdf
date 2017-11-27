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
  return await page.pdf({format: 'A4'});
};

let browser;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  return browser;
}

export async function generatePDF(conf) {
  let browser = await getBrowser();
  let page;
  if (conf.url) {
    page = await getPageForURL(conf.url);
  } else {
    page = await getPageForHTML(conf.html)
  }

  return await generatePDFFromPage(page);
}
