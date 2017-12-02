const puppeteer = require('puppeteer');
const process = require('process');

async function getPageForURL(page, conf) {
  console.log("getPageForURL got page");
  await page.goto(conf.url);
  console.log("getPageForURL got url");
  return page;
};

async function getPageForHTML(page, conf) {
  console.log("getPageForHTML got page");
  await page.setContent(conf.html);
  console.log("getPageForHTML set content");
  return page;
};

async function generatePDFFromPage(page) {
  return await page.pdf({format: 'A4'});
};

let browser;

async function getBrowser() {
  let conf = {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  if (process.env.CHROME_PATH) {
    conf.executablePath = process.env.CHROME_PATH;
  }
  if (!browser) {
    console.log("Launching a browser with conf", conf);
    browser = await puppeteer.launch(conf);
    let version = await browser.version();
    console.log("Launched browser", version);
  }

  return browser;
}

async function generatePDF(conf) {
  console.log("generatePDF start");
  let browser = await getBrowser();
  console.log("loaded browser, getting page");
  console.log("get a page");
  let page = await browser.newPage();
  console.log("Got a page");
  if (conf.url) {
    await getPageForURL(page, conf);
  } else {
    await getPageForHTML(page, conf)
  }
  console.log("got page, generating pdf");
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

console.log('Finished loading code');

export async function handler(event, context, callback) {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    let conf = parseConfFromEvent(event);
    console.log("Parsed conf", conf);
    let data = await generatePDF(conf);
    console.log("Generated pdf");
    let response = generateResponseForData(data);
    console.log("Generated a response");
    callback(null, response);
  } catch (e) {
    callback(e);
    return;
  }
  return;
}
