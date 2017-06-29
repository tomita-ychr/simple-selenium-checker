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
exports.Checker = undefined;

var _Checker = __webpack_require__(3);

var _Checker2 = _interopRequireDefault(_Checker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Checker2.default;
exports.Checker = _Checker2.default;

/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _seleniumWebdriver = __webpack_require__(2);

var _seleniumWebdriver2 = _interopRequireDefault(_seleniumWebdriver);

var _checks = __webpack_require__(4);

var checks = _interopRequireWildcard(_checks);

var _actions = __webpack_require__(5);

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var until = _seleniumWebdriver2.default.until;
var By = _seleniumWebdriver2.default.By;

var Checker = function () {
  function Checker(driver) {
    _classCallCheck(this, Checker);

    this.driver = driver;
    this.debug = Checker.Debug;
  }

  _createClass(Checker, [{
    key: 'waitElement',
    value: function waitElement(locator, timeout) {
      var _this = this;

      if (timeout === undefined) timeout = 1;
      return this.driver.wait(until.elementLocated(locator), timeout).then(function (elem) {
        return _this.driver.wait(until.elementIsVisible(elem), timeout);
      });
    }
  }, {
    key: '_detectFunction',
    value: function _detectFunction(functions, obj) {
      var keys = [];
      var func = undefined;
      for (var key in functions) {
        if (obj[key]) {
          keys.push(key);
          if (func) throw new Error("Found two identify keys. " + keys.join(','));
          func = functions[key];
        }
      }

      if (!func) {
        throw new Error("Invalid checks object. " + JSON.stringify(obj));
      }

      return func;
    }
  }, {
    key: '_testItem',
    value: function _testItem(condition) {
      if (condition.exists) {
        return this.waitElement(condition.exists, condition.wait).then(function () {
          return true;
        }).catch(function () {
          return false;
        });
      } else if (condition.nonExists) {
        return this.waitElement(condition.nonExists, condition.wait).then(function () {
          return false;
        }).catch(function () {
          return true;
        });
      } else if (condition.bool !== undefined) {
        return Promise.resolve(condition.bool);
      } else {
        throw new Error("Invalid exexif condition " + JSON.stringify(condition));
      }
    }
  }, {
    key: '_testGroup',
    value: function _testGroup(conditions) {
      var _this2 = this;

      var promise = Promise.resolve(false);
      conditions.forEach(function (item) {
        promise = promise.then(function (res) {
          if (res === true) return true; //OR
          return _this2._testItem(item);
        });
      });

      return promise;
    }
  }, {
    key: '_testExecif',
    value: function _testExecif(conditions) {
      var _this3 = this;

      var promise = Promise.resolve(true);
      if (conditions) {
        conditions.forEach(function (group) {
          promise = promise.then(function (res) {
            if (res === false) return false; //AND
            return _this3._testGroup(group);
          });
        });
      }

      return promise;
    }
  }, {
    key: 'run',
    value: function run(scenario, host) {
      var _this4 = this;

      var promise = Promise.resolve();
      scenario.forEach(function (item) {
        item = _this4._applyPlaceholder(item);

        promise = promise.then(function () {
          return _this4._testExecif(item.execif);
        });

        //url
        if (item.url) {
          promise = promise.then(function (res) {
            if (res === false) return false;
            return _this4.driver.get(host ? host + item.url : item.url);
          });
        }

        //actions
        if (item.actions) {
          item.actions.forEach(function (action) {
            promise = promise.then(function (res) {
              if (res === false) return false;
              return _this4._detectFunction(actions, action)(_this4, action);
            });
          });
        }

        //Process checks
        if (item.checks) {
          item.checks.forEach(function (check) {
            promise = promise.then(function (res) {
              if (res === false) return false;
              return _this4._detectFunction(checks, check)(_this4, check);
            });
          });
        }

        //Check javascript and response errors using browser logs.
        promise = promise.then(function (res) {
          if (res === false) return false;
          return _this4.driver.getCurrentUrl().then(function (url) {
            return new Promise(function (resolve) {
              _this4.driver.manage().logs().get('browser').then(function (logs) {
                logs.forEach(function (log) {
                  //javascript
                  if (Checker.JsErrorStrings.some(function (err) {
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
        if (_this4.debug === false) {
          promise = promise.catch(function (err) {
            return _this4.driver.findElement(By.css('html')).then(function (elem) {
              return elem.getAttribute('outerHTML');
            }).then(function (html) {
              return _this4.driver.getCurrentUrl().then(function (url) {
                var data = Object.assign({}, _this4.data);
                delete data.next;
                throw new Error(url + "\n" + "JSON: " + JSON.stringify(data) + "\n" + "Message: " + err.message + "\n" + html);
              });
            });
          });
        }
      });

      return promise;
    }
  }, {
    key: '_applyPlaceholderToValue',
    value: function _applyPlaceholderToValue(value) {
      if (value.placeholderKey) {
        if (this.placeholder[value.placeholderKey]) {
          return value.apply(this.placeholder[value.placeholderKey]);
        } else {
          throw new Error('Missing ' + value.placeholderKey + ' key in placeholder.');
        }
      } else {
        return value;
      }
    }
  }, {
    key: '_applyPlaceholderToArray',
    value: function _applyPlaceholderToArray(elems) {
      var _this5 = this;

      var newElems = [];
      elems.forEach(function (elem) {
        if (elem.forEach) {
          newElems.push(_this5._applyPlaceholderToArray(elem));
        } else {
          var newElem = {};
          for (var elemKey in elem) {
            newElem[elemKey] = _this5._applyPlaceholderToValue(elem[elemKey]);
          }
          newElems.push(newElem);
        }
      });

      return newElems;
    }
  }, {
    key: '_applyPlaceholder',
    value: function _applyPlaceholder(scenarioItem) {
      if (this.placeholder === undefined) {
        return scenarioItem;
      }

      var newItem = {};
      for (var itemKey in scenarioItem) {
        var elem = scenarioItem[itemKey];
        if (elem.forEach) {
          newItem[itemKey] = this._applyPlaceholderToArray(elem);
        } else {
          newItem[itemKey] = this._applyPlaceholderToValue(elem);
        }
      }

      return newItem;
    }
  }]);

  return Checker;
}();

exports.default = Checker;


Checker.JsErrorStrings = ["SyntaxError", "EvalError", "ReferenceError", "RangeError", "TypeError", "URIError"];

Checker.Debug = false;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.by = by;
exports.body = body;
exports.url = url;

var _seleniumWebdriver = __webpack_require__(2);

var _seleniumWebdriver2 = _interopRequireDefault(_seleniumWebdriver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var By = _seleniumWebdriver2.default.By;

function by(checker, check) {
  return checker.waitElement(check.by, check.wait).then(function (elem) {
    if (check.equal) {
      return elem.getText().then(function (text) {
        if (text !== check.equal) throw new Error('Text in ' + check.by.toString() + ' is not `' + check.equal + '` actual `' + text + "`");
      });
    } else if (check.like) {
      return elem.getText().then(function (text) {
        if (text.indexOf(check.like) === -1) throw new Error('Text in ' + check.by.toString() + ' dose not like `' + check.like + '` actual `' + text + '`');
      });
    } else if (check.callback) {
      return check.callback(elem).then(function (res) {
        if (!res) throw new Error(check.callback.toString() + ' is failed');
      });
    }
  });
}

function body(checker, check) {
  return checker.driver.findElement(By.css('html')).then(function (elem) {
    return elem.getAttribute('outerHTML');
  }).then(function (html) {
    if (html.indexOf(check.body) === -1) throw new Error("Missing text `" + check.body + "`");
  });
}

function url(checker, check) {
  return checker.driver.getCurrentUrl().then(function (url) {
    if (url.indexOf(check.url) === -1) {
      throw new Error('The specified URL was not included in the actual URL');
    }
  });
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.click = click;
exports.sendKeys = sendKeys;
exports.clear = clear;
function click(checker, action) {
  return checker.waitElement(action.click, action.wait).then(function (elem) {
    return elem.click();
  });
}

function sendKeys(checker, action) {
  return checker.waitElement(action.sendKeys, action.wait).then(function (elem) {
    return elem.sendKeys(action.value);
  });
}

function clear(checker, action) {
  return checker.waitElement(action.clear, action.wait).then(function (elem) {
    return elem.clear();
  });
}

/***/ })
/******/ ]);
});