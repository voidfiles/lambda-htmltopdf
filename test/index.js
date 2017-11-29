var assert = require('assert');
var rewire = require("rewire");
var htmltopdf = rewire("../build.js");
var server = require('./server');

let getBrowser = htmltopdf.__get__("getBrowser");

describe('HTMLToPDF', function() {
  describe('getBrowser', function() {
    it('should return a browser object', function(done) {

      getBrowser().then(function (b) {
        assert.equal(b._eventsCount, 0);
      }).then(done, done);
    });

    it('should create one browser object even with multiple calls', function(done) {
      getBrowser().then(function (b) {
        b.__test = true;
        return getBrowser().then(function (b2) {
          assert.equal(b2.__test, true);
        });
      }).then(done, done);
    });
  });

  describe("parseConfFromEvent", function () {
    let conf;
    let parseConfFromEvent = htmltopdf.__get__("parseConfFromEvent");
    it('Should see html in the body', function () {

      conf = parseConfFromEvent({});
      assert.equal(conf.html, null);

      conf = parseConfFromEvent({
        body: "<html>"
      });
      assert.equal(conf.html, "<html>");
    });
    it('Should see url in the queryStringParameters', function () {
      conf = parseConfFromEvent({});
      assert.equal(conf.url, null);

      conf = parseConfFromEvent({
        queryStringParameters: {}
      });
      assert.equal(conf.url, null);
      conf = parseConfFromEvent({
        queryStringParameters: {
          url: 'http://google.com'
        }
      });
      assert.equal(conf.url, 'http://google.com');
    })
  });

  describe("generateResponseForData", function () {
    it('Should handle buffers', function () {
      let generateResponseForData = htmltopdf.__get__("generateResponseForData");
      let data = Buffer.from("hellow", 'utf8');
      let response = generateResponseForData(data, 200);
      assert.equal(response.statusCode, 200);
      assert.equal(response.isBase64Encoded, true);
      assert.equal(response.body, 'aGVsbG93');
      assert.equal(response.headers["Content-Type"], "application/pdf");
    });
  })

  describe("getPageForHTML", function () {
    it('Should return page for html', function (done) {
      let getPageForHTML = htmltopdf.__get__("getPageForHTML");
      let conf = {
        html: "<html><body>Hello</body></html>",
      };
      getBrowser().then(function (browser) {
        return getPageForHTML(browser, conf).then(function (page) {
          return page;
        });
      }).then(function (page) {
        return page.content().then(function (c) {
          assert.equal(c, "<html><head></head><body>Hello</body></html>");
        }).then(done);
      }).catch(done);
    });
  });

  describe("getPageForURL", function () {
    before(function () {
      server.listen(9999);
    });

    after(function () {
      server.close();
    });
    it('Should return page with url', function (done) {
      let getPageForURL = htmltopdf.__get__("getPageForURL");
      let conf = {
        url: "http://localhost:9999/",
      };
      let getBrowser = htmltopdf.__get__("getBrowser");
      getBrowser().then(function (browser) {
        return getPageForURL(browser, conf).then(function (page) {
          return page;
        });
      }).then(function (page) {
        assert.equal(page.url(), conf.url);
      }).then(done, done)
    });
  });

  describe("generatePDFFromPage", function () {
    it('Should return page for html', function (done) {
      let generatePDFFromPage = htmltopdf.__get__("generatePDFFromPage");
      let getPageForHTML = htmltopdf.__get__("getPageForHTML");
      let conf = {
        html: "<html><body>Hello</body></html>",
      };
      getBrowser().then(function (browser) {
        return getPageForHTML(browser, conf);
      }).then(function (page) {
        return generatePDFFromPage(page);
      }).then(function (buf) {
        assert.equal(
          buf.toString('base64').endsWith("R4cmVmCjE5NjgyCiUlRU9G"),
          true,
        );
      }).then(done, done)
    });
  });

  describe("generatePDF", function () {
    it('Should return PDF buffer', function (done) {
      let generatePDF = htmltopdf.__get__("generatePDF");
      let conf = {
        html: "<html><body>Hello</body></html>",
      };
      generatePDF(conf).then(function (buf) {
        assert.equal(
          buf.toString('base64').endsWith("R4cmVmCjE5NjgyCiUlRU9G"),
          true,
        );
      }).then(done, done);
    });
  });

  after(function() {
    let getBrowser = htmltopdf.__get__("getBrowser");
    getBrowser().then(function (browser) {
      browser.close();
    })
  });
});
