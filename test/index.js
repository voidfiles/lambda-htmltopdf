var assert = require('assert');
var rewire = require("rewire");
var htmltopdf = rewire("../build.js");

describe('HTMLToPDF', function() {
  describe('getBrowser', function() {
    it('should return a browser object', function(done) {
      let getBrowser = htmltopdf.__get__("getBrowser");
      getBrowser().then(function (b) {
        assert.equal(b._eventsCount, 0);
        b.close();
        done();
      }).catch(function () {
        done();
      });

    });
  });
});
