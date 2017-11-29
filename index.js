const puppeteer = require('puppeteer');

async function getPageForURL(browser, conf) {
  const page = await browser.newPage();
  await page.goto(conf.url);
  return page;
};

async function getPageForHTML(browser, conf) {
  const page = await browser.newPage();
  await page.setContent(conf.html);
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

async function generatePDF(conf) {
  let browser = await getBrowser();
  let page;
  if (conf.url) {
    page = await getPageForURL(browser, conf);
  } else {
    page = await getPageForHTML(browser, conf)
  }

  return await generatePDFFromPage(page);
}

function generateResponseForData(data, statusCode) {
  return {
      statusCode: statusCode,
      headers: {
          "Content-Type" : "application/pdf",
      },
      isBase64Encoded: true,
      body: data.toString('base64'),
  };
};

function parseConfFromEvent(event) {
  let conf = {};
  if (event.body) {
      conf.html = event.body;
  }

  if (event.queryStringParameters) {
      if (event.queryStringParameters.url) {
        conf.url = event.queryStringParameters.url;
      }
  }

  return conf;
}

export async function handler(event, context, callback) {
  let conf = parseConfFromEvent(event);
  let data = await generatePDF(conf);
  let response = generateResponseForData(data);
  callback(null, response);
}
