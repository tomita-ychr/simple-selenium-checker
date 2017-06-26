(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("selenium-webdriver"));
	else if(typeof define === 'function' && define.amd)
		define(["selenium-webdriver"], factory);
	else if(typeof exports === 'object')
		exports["SimpleSeleniumChecker"] = factory(require("selenium-webdriver"));
	else
		root["SimpleSeleniumChecker"] = factory(root["WebDriver"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Page = undefined;

var _Page = __webpack_require__(1);

var _Page2 = _interopRequireDefault(_Page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Page = _Page2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _seleniumWebdriver = __webpack_require__(2);

var _seleniumWebdriver2 = _interopRequireDefault(_seleniumWebdriver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var until = _seleniumWebdriver2.default.until;
var By = _seleniumWebdriver2.default.By;

var Page = function () {
  function Page(driver, data) {
    _classCallCheck(this, Page);

    this.driver = driver;
    this.data = data;
    this.waitElementTimeout = Page.WaitElementTimeout;
  }

  _createClass(Page, [{
    key: "waitElement",
    value: function waitElement(locator) {
      var _this = this;

      return this.driver.wait(until.elementLocated(locator), this.waitElementTimeout).then(function (elem) {
        return _this.driver.wait(until.elementIsVisible(elem));
      }, this.waitElementTimeout);
    }
  }, {
    key: "run",
    value: function run() {
      var _this2 = this;

      var promise = Promise.resolve();
      if (this.data.url) {
        promise = this.driver.get(this.data.url);
      } else if (this.data.link) {
        promise = this.waitElement(this.data.link).then(function (elem) {
          return elem.click();
        });
      }

      //actions
      if (this.data.actions) {
        this.data.actions.forEach(function (action) {
          promise = promise.then(function () {
            return _this2.waitElement(action.loc).then(function (elem) {
              switch (action.type) {
                case Page.ActionType.Click:
                  return elem.click();
                case Page.ActionType.SendKeys:
                  return elem.sendKeys(action.value);
                default:
                  throw new Error("Unknown action type " + action.type + " is specified.");
              }
            });
          });
        });
      }

      //Process checkes
      if (this.data.checks) {
        this.data.checks.forEach(function (check) {
          promise = promise.then(function () {
            if (check.loc) {
              return _this2.waitElement(check.loc).then(function (elem) {
                if (check.text) {
                  return elem.getText().then(function (text) {
                    if (text !== check.text) throw new Error('Text in ' + check.loc.toString() + ' is not `' + check.text + '` but `' + text + "`");
                  });
                } else if (check.callback) {
                  return check.callback(elem).then(function (res) {
                    if (!res) throw new Error(check.callback.toString() + ' is failed');
                  });
                }
              });
            } else if (check.text) {
              return _this2.driver.findElement(By.css('html')).then(function (elem) {
                return elem.getAttribute('outerHTML');
              }).then(function (html) {
                if (html.indexOf(check.text) === -1) throw new Error("Missing text `" + check.text + "`");
              });
            } else if (check.url) {
              return _this2.driver.getCurrentUrl().then(function (url) {
                if (url.indexOf(check.url) === -1) {
                  throw new Error('The specified URL was not included in the actual URL');
                }
              });
            }
          });
        });
      }

      //Check javascript and response errors using browser logs.
      promise = promise.then(function () {
        return _this2.driver.getCurrentUrl().then(function (url) {
          return new Promise(function (resolve) {
            _this2.driver.manage().logs().get('browser').then(function (logs) {
              logs.forEach(function (log) {
                //javascript
                if (Page.JsErrorStrings.some(function (err) {
                  return log.message.indexOf(err) >= 0;
                })) {
                  throw new Error("Javascript error was detected: " + log.message);
                }

                //response
                if (log.message.indexOf(url + " - ") === 0) {
                  var msg = log.message.split(url).join("");
                  for (var i = 400; i <= 599; i++) {
                    if (msg.indexOf(" " + i + " ") >= 0) {
                      throw new Error("The response error was detected: " + log.message);
                    }
                  }
                }
              });
              resolve();
            });
          });
        });
      });

      //Format the error.
      promise = promise.catch(function (err) {
        return _this2.driver.findElement(By.css('html')).then(function (elem) {
          return elem.getAttribute('outerHTML');
        }).then(function (html) {
          return _this2.driver.getCurrentUrl().then(function (url) {
            var data = Object.assign({}, _this2.data);
            delete data.next;
            throw new Error(url + "\n" + "JSON: " + JSON.stringify(data) + "\n" + "Message: " + err.message + "\n" + html);
          });
        });
      });

      //Process next
      if (this.data.next) {
        var child = new Page(this.driver, this.data.next);
        promise = promise.then(function () {
          return child.run();
        });
      }

      return promise;
    }
  }]);

  return Page;
}();

exports.default = Page;


Page.WaitElementTimeout = 4000;

Page.JsErrorStrings = ["SyntaxError", "EvalError", "ReferenceError", "RangeError", "TypeError", "URIError"];

Page.ActionType = {
  Click: 'Click',
  SendKeys: 'SendKeys'
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ })
/******/ ]);
});