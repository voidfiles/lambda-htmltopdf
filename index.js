const puppeteer = require('puppeteer');
console.log("yoyoyoyoy");
console.log(puppeteer);
(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://api.bepress.com/cover-page/aaron_edlin/90/');
  await page.pdf({path: 'stamp.pdf', format: 'A4'});
  await browser.close();
})();
