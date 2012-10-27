// Default response handlers 
// for non-200 status codes

var fs = require('fs');
var path = require('path');

module.exports = function Responses() {

  var pubPath = path.join.bind(this, __dirname, '../public');
  var exists = fs.existsSync || path.existsSync;

  var createPageHandler = function createPageHandler(status, page) {
    page = page || pubPath(status + '.html');
    var pageExists = exists(page);

    function pageHandler(fp, req, res) {
      var servePages = this.get('error_pages');
      if (servePages && pageExists) {
        var now = new Date().getTime();
        var cached = this.getCache(page);
        this.complete(page, req, res, status, cached, now);
      } else {
        res.writeHead(status);
        res.end();
        this.ev(status, fp, req);
      };
    };

    return pageHandler.bind(this);
  }.bind(this);

  this._304 = function _304Handler(fp, req, res) {
    var status = 304;
    res.writeHead(status);
    res.end();
    this.ev(status, fp, req);
  };

  var __404 = createPageHandler(404);

  this._404 = function _404Handler(fp, req, res) {
    var handler = this.get('not_found');
    var status = 404;
    switch(typeof(handler)) {
      case 'string':
        createPageHandler(status, handler)(fp, req, res);
        break;
      case 'function':
        handler.call(this, req, res);
        this.ev(status, fp, req);
      default:
        __404(fp, req, res);
        break;
    };
  };

  this._400 = createPageHandler(400);
  this._403 = createPageHandler(403);
  this._405 = createPageHandler(405);
  this._500 = createPageHandler(500);

};