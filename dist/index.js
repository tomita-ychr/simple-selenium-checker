(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("selenium-webdriver"));
	else if(typeof define === 'function' && define.amd)
		define(["selenium-webdriver"], factory);
	else if(typeof exports === 'object')
		exports["SimpleSeleniumChecker"] = factory(require("selenium-webdriver"));
	else
		root["SimpleSeleniumChecker"] = factory(root["WebDriver"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.placeholder = exports.Checker = undefined;

var _Checker = __webpack_require__(2);

var _Checker2 = _interopRequireDefault(_Checker);

var _placeholder = __webpack_require__(5);

var _placeholder2 = _interopRequireDefault(_placeholder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Checker2.default;
exports.Checker = _Checker2.default;
exports.placeholder = _placeholder2.default;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _seleniumWebdriver = __webpack_require__(0);

var _seleniumWebdriver2 = _interopRequireDefault(_seleniumWebdriver);

var _checks = __webpack_require__(3);

var checks = _interopRequireWildcard(_checks);

var _actions = __webpack_require__(4);

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
    key: 'waitDissapearElements',
    value: function waitDissapearElements(locator, timeout) {
      var _this = this;

      if (timeout === undefined) timeout = Checker.DefaultTimeout;
      var cond = new _seleniumWebdriver2.default.Condition(locator + ' disappear from the screen.', function () {
        return _this.driver.findElements(locator).then(function (elems) {
          return elems.length === 0;
        });
      });
      return this.driver.wait(cond, timeout);
    }
  }, {
    key: 'waitElements',
    value: function waitElements(locator, count, timeout) {
      var _this2 = this;

      if (count === undefined) count = 1;
      if (timeout === undefined) timeout = Checker.DefaultTimeout;
      var cond = new _seleniumWebdriver2.default.Condition(count + ' ' + locator + ' ' + count === 1 ? 'is' : 'are' + ' found.', function () {
        return _this2.driver.findElements(locator).then(function (elems) {
          if (elems.length >= count) {
            return elems;
          }

          return false;
        });
      });
      return this.driver.wait(cond, timeout);
    }
  }, {
    key: 'waitElement',
    value: function waitElement(locator, timeout) {
      var _this3 = this;

      if (timeout === undefined) timeout = Checker.DefaultTimeout;
      return this.driver.wait(until.elementLocated(locator), timeout).then(function (elem) {
        return _this3.driver.wait(until.elementIsVisible(elem), timeout);
      });
    }
  }, {
    key: '_detectFunction',
    value: function _detectFunction(functions, obj) {
      var keys = [];
      var func = undefined;
      for (var key in functions) {
        if (obj.hasOwnProperty(key)) {
          keys.push(key);
          if (func) throw new Error("Found two identify keys. " + keys.join(','));
          func = functions[key];
        }
      }

      if (!func) {
        throw new Error("Missing supported directive in " + JSON.stringify(obj));
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
      } else if (condition.notExists) {
        return this.waitElement(condition.notExists, condition.wait).then(function () {
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
      var _this4 = this;

      var promise = Promise.resolve(false);
      conditions.forEach(function (item) {
        promise = promise.then(function (res) {
          if (res === true) return true; //OR
          return _this4._testItem(item);
        });
      });

      return promise;
    }
  }, {
    key: '_testExecif',
    value: function _testExecif(conditions) {
      var _this5 = this;

      var promise = Promise.resolve(true);
      if (conditions) {
        conditions.forEach(function (group) {
          promise = promise.then(function (res) {
            if (res === false) return false; //AND
            return _this5._testGroup(group);
          });
        });
      }

      return promise;
    }
  }, {
    key: 'run',
    value: function run(scenario, promise) {
      var _this6 = this;

      if (!promise) {
        promise = Promise.resolve();
      }

      scenario.forEach(function (item) {
        if (item.scenario) {
          promise = _this6.run(item.scenario, promise);
        } else {
          //directive count check.
          var directives = Object.keys(item);
          if (directives.length !== 1) {
            throw new Error('Only one directive can be placed in one scenario item.');
          }

          //check supported directives
          if (['execif', 'url', 'actions', 'checks'].indexOf(directives[0]) === -1) {
            throw new Error("Illegal directive object. " + JSON.stringify(item));
          }

          item = _this6._applyPlaceholder(item);

          //execif
          if (item.execif) {
            promise = promise.then(function () {
              return _this6._testExecif(item.execif);
            });
          } else if (item.url) {
            promise = promise.then(function (res) {
              if (res === false) return false;
              return _this6.driver.get(item.url);
            });
          } else if (item.actions) {
            item.actions.forEach(function (action) {
              promise = promise.then(function (res) {
                if (res === false) return false;
                return _this6._detectFunction(actions, action)(_this6, action);
              });
            });
          } else if (item.checks) {
            item.checks.forEach(function (check) {
              promise = promise.then(function (res) {
                if (res === false) return false;
                return _this6._detectFunction(checks, check)(_this6, check);
              });
            });
          }

          //Check javascript and response errors using browser logs.
          promise = promise.then(function (res) {
            if (res === false) return false;
            return _this6.driver.getCurrentUrl().then(function (url) {
              return new Promise(function (resolve) {
                _this6.driver.manage().logs().get('browser').then(function (logs) {
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
          if (_this6.debug === false) {
            promise = promise.catch(function (err) {
              return _this6.driver.findElement(By.css('html')).then(function (elem) {
                return elem.getAttribute('outerHTML');
              }).then(function (html) {
                return _this6.driver.getCurrentUrl().then(function (url) {
                  var data = Object.assign({}, _this6.data);
                  delete data.next;
                  throw new Error(url + "\n" + "JSON: " + JSON.stringify(item) + "\n" + "Message: " + err.message + "\n" + html);
                });
              });
            });
          }
        }
      });

      return promise.then(function () {
        return undefined;
      });
    }
  }, {
    key: '_applyPlaceholderToValue',
    value: function _applyPlaceholderToValue(value) {
      if (value.placeholderKey) {
        if (this.placeholder.hasOwnProperty(value.placeholderKey)) {
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
      var _this7 = this;

      var newElems = [];
      elems.forEach(function (elem) {
        if (elem.forEach) {
          newElems.push(_this7._applyPlaceholderToArray(elem));
        } else {
          var newElem = {};
          for (var elemKey in elem) {
            newElem[elemKey] = _this7._applyPlaceholderToValue(elem[elemKey]);
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

Checker.DefaultTimeout = 12000;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exists = exists;
exports.notExists = notExists;
exports.likes = likes;
exports.equals = equals;
exports.notEquals = notEquals;
exports.notLikes = notLikes;

var _seleniumWebdriver = __webpack_require__(0);

var _seleniumWebdriver2 = _interopRequireDefault(_seleniumWebdriver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var By = _seleniumWebdriver2.default.By;
var Promise = _seleniumWebdriver2.default.promise;

function exists(checker, check) {
  return checker.waitElement(check.exists, check.timeout);
}

function notExists(checker, check) {
  return checker.waitDissapearElement(check.notExists, check.timeout);
}

function deletectType(checker, check) {
  var promise = void 0;
  var message = void 0;
  if (check.type === undefined && check.by) {
    message = "Text in " + check.by;
    promise = checker.waitElement(check.by, check.timeout).then(function (elem) {
      return elem.getText();
    });
  } else if (check.type === undefined) {
    message = "Response body";
    promise = checker.driver.findElement(By.css('html')).then(function (elem) {
      return elem.getAttribute('outerHTML');
    });
  } else if (check.type == 'checkbox') {
    message = "Checkbox " + check.by;
    promise = checker.waitElements(check.by, check.count, check.timeout).then(function (elems) {
      return Promise.map(elems, function (elem) {
        return elem.isSelected().then(function (selected) {
          return { elem: elem, selected: selected };
        });
      });
    }).then(function (composits) {
      return composits.filter(function (composit) {
        return composit.selected;
      }).map(function (composit) {
        return composit.elem;
      });
    }).then(function (elems) {
      return Promise.map(elems, function (elem) {
        return elem.getAttribute("value");
      });
    });
  } else if (check.type == 'url') {
    message = "Url";
    promise = checker.driver.getCurrentUrl();
  } else if (check.type.hasOwnProperty('attr')) {
    message = check.type.attr + " of " + check.by;
    promise = checker.waitElement(check.by, check.timeout).then(function (elem) {
      return elem.getAttribute(check.type.attr);
    });
  } else {
    throw new Error('Illegal checker directive type ' + JSON.stringify(check));
  }

  return { promise: promise, message: message };
}

function buildActualMessage(check, message, actual) {
  //for response body text
  if (check.type === undefined && check.by === undefined) {
    message += '.';
  } else {
    message += ' actual `' + actual + '`.';
  }

  return message;
}

function likes(checker, check) {
  var type = deletectType(checker, check);

  return type.promise.then(function (text) {
    if (text.indexOf(check.likes) === -1) {
      var message = type.message + ' dose not contain `' + check.likes + '`';
      throw new Error(buildActualMessage(check, message, text));
    }
  });
}

function equals(checker, check) {
  var type = deletectType(checker, check);

  return type.promise.then(function (text) {
    if (text !== check.equals) {
      var message = type.message + ' is not `' + check.equals + '`';
      throw new Error(buildActualMessage(check, message, text));
    }
  });
}

function notEquals(checker, check) {
  var type = deletectType(checker, check);

  return type.promise.then(function (text) {
    if (text === check.notEquals) {
      throw new Error(type.message + ' is `' + check.notEquals + '`.');
    }
  });
}

function notLikes(checker, check) {
  var type = deletectType(checker, check);

  return type.promise.then(function (text) {
    if (text.indexOf(check.notLikes) >= 0) {
      throw new Error(type.message + ' contains `' + check.notLikes + '`.');
    }
  });
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.click = click;
exports.sendKeys = sendKeys;
exports.clear = clear;
function click(checker, action) {
  return checker.waitElement(action.click, action.timeout).then(function (elem) {
    return elem.click();
  });
}

function sendKeys(checker, action) {
  return checker.waitElement(action.sendKeys, action.timeout).then(function (elem) {
    return elem.sendKeys(action.value);
  });
}

function clear(checker, action) {
  return checker.waitElement(action.clear, action.timeout).then(function (elem) {
    return elem.clear();
  });
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = placeholder;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Placeholder = function () {
  function Placeholder(key) {
    _classCallCheck(this, Placeholder);

    this.key = key;
    this.appendedTexts = [];
  }

  _createClass(Placeholder, [{
    key: 'append',
    value: function append(text) {
      this.appendedTexts.push(text);
      return this;
    }
  }, {
    key: 'apply',
    value: function apply(holderItem) {
      if (this.appendedTexts.length) {
        return holderItem + this.appendedTexts.join('');
      } else {
        return holderItem;
      }
    }
  }, {
    key: 'placeholderKey',
    get: function get() {
      return this.key;
    }
  }]);

  return Placeholder;
}();

function placeholder(key) {
  return new Placeholder(key);
}

/***/ })
/******/ ]);
});