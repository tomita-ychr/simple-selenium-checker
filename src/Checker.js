import webdriver from 'selenium-webdriver';
import util from 'util';
import * as checks from './checks'
import * as actions from './actions'
import * as errors from './errors'
const until = webdriver.until;
const By = webdriver.By;
const Key = webdriver.Key;

export default class Checker
{
  constructor(driver){
    this.driver = driver
    this.debug = Checker.Debug
  }

  assembleFromElements(elems, values){
    let promise = webdriver.promise.map(elems, elem => ({elem: elem}))

    Object.keys(values).forEach(key => {
      const func = values[key]
      promise = promise.then(composits => webdriver.promise.map(composits, composit => func(composit.elem).then(value => {
        composit[key] = value
        return composit
      })))
    })

    return promise
  }

  waitFor(message, action, timeout){
    if(timeout === undefined) timeout = Checker.DefaultTimeout
    return this.driver
      .wait(new webdriver.Condition(message, () => action()), timeout)
      .catch(err => {
        if(err.name == 'TimeoutError'){
          throw new errors.NotMatchError(err.message)
        }
      })
  }

  waitDissapearElements(locator, timeout){
    if(timeout === undefined) timeout = Checker.DefaultTimeout;
    const cond = new webdriver.Condition(locator + ' disappear from the screen.', () => {
      return this.driver.findElements(locator).then(elems => elems.length === 0)
    })
    return this.driver.wait(cond, timeout).catch(err => {
      if(err.name == 'TimeoutError'){
        throw new errors.ElementExistsError(err.message)
      }
    })
  }

  waitElementsIn(element, locator, count, timeout){
    if(count === undefined) count = 1
    if(timeout === undefined) timeout = Checker.DefaultTimeout
    const cond = new webdriver.Condition(util.format('for %s to be located %s in specified element', count > 1 ? count + " elements" : 'element', locator), () => {
      return element.findElements(locator).then(elems => {
        if(elems.length >= count){
          return elems
        }

        return false
      })
    })

    return this.driver.wait(cond, timeout).catch(err => {
      if(err.name == 'TimeoutError'){
        throw new errors.NotSuchElementError(err.message)
      }
    })
  }

  waitElements(locator, count, timeout){
    if(count === undefined) count = 1
    if(timeout === undefined) timeout = Checker.DefaultTimeout
    const cond = new webdriver.Condition(util.format('for %s to be located %s', count > 1 ? count + " elements" : 'element', locator), () => {
      return this.driver.findElements(locator).then(elems => {
        if(elems.length >= count){
          return elems
        }

        return false
      })
    })

    return this.driver.wait(cond, timeout).catch(err => {
      if(err.name == 'TimeoutError'){
        throw new errors.NotSuchElementError(err.message)
      }
    })
  }

  waitElement(locator, timeout){
    if(timeout === undefined) timeout = Checker.DefaultTimeout;
    return this.driver
      .wait(until.elementLocated(locator), timeout)
      .then(elem => this.driver.wait(until.elementIsVisible(elem), timeout))
  }

  _detectFunction(functions, obj){
    const keys = []
    let func = undefined
    for(let key in functions){
      if(obj.hasOwnProperty(key)){
        keys.push(key)
        if(func) throw new Error("Found two identify keys. " + keys.join(','))
        func = functions[key]
      }
    }

    if(!func){
      throw new Error("Missing supported directive in " + JSON.stringify(obj))
    }

    return func
  }

  _testItem(condition){
    if(condition.exists){
      return this.waitElement(condition.exists, condition.wait)
        .then(() => true)
        .catch(() => false)
    } else if(condition.notExists){
      return this.waitElement(condition.notExists, condition.wait)
        .then(() => false)
        .catch(() => true)
    } else if(condition.bool !== undefined){
      return Promise.resolve(condition.bool)
    } else {
      throw new Error("Invalid execif condition " + JSON.stringify(condition))
    }
  }

  _testGroup(conditions){
    let promise = Promise.resolve(false)
    conditions.forEach(item => {
      promise = promise.then(res => {
        if(res === true) return true//OR
        return this._testItem(item)
      })
    })

    return promise
  }

  _testExecif(conditions){
    let promise = Promise.resolve(true)
    if(conditions){
      conditions.forEach(group => {
        promise = promise.then(res => {
          if(res === false) return false//AND
          return this._testGroup(group)
        })
      })
    }

    return promise
  }

  run(scenario, promise){
    if(!promise){
      promise = Promise.resolve()
    }

    scenario.forEach(item => {
      if(item.scenario){
        promise = this.run(item.scenario, promise)
      } else {
        //directive count check.
        const directives = Object.keys(item)
        if(directives.length !== 1){
          throw new Error('Only one directive can be placed in one scenario item.')
        }

        //check supported directives
        if(['execif', 'url', 'actions', 'checks'].indexOf(directives[0]) === -1){
          throw new Error("Illegal directive object. " + JSON.stringify(item))
        }

        item = this._applyPlaceholder(item)

        //execif
        if(item.execif){
          promise = promise.then(() => this._testExecif(item.execif))
        }else if(item.url) {
          promise = promise.then(res => {
            if(res === false) return false
            return this.driver.get(item.url)
          })
        } else if(item.actions) {
          item.actions.forEach(action => {
            promise = promise.then(res => {
              if(res === false) return false
              return this._detectFunction(actions, action)(this, action)
            })
          })
        } else if(item.checks) {
          item.checks.forEach(check => {
            promise = promise.then(res => {
              if(res === false) return false
              return this._detectFunction(checks, check)(this, check)
            })
          })
        }

        //Check javascript and response errors using browser logs.
        promise = promise.then(res => {
          if(res === false) return false
          return this.driver.getCurrentUrl().then(url => {
            return new Promise(resolve => {
              this.driver.manage().logs().get('browser').then(logs => {
                logs.forEach(log => {
                  //javascript
                  if(Checker.JsErrorStrings.some(err => log.message.indexOf(err) >= 0)){
                    throw new errors.JavascriptError(log.message)
                  }

                  //response
                  if(log.message.indexOf(url + " - ") === 0){
                    const msg = log.message.split(url).join("")
                    for(let i = 400;i <= 599; i++){
                      if(msg.indexOf(" " + i + " ") >= 0){
                        throw new errors.StatusCodeError(log.message)
                      }
                    }
                  }
                })
                resolve()
              })
            })
          })
        })

        //Format the error.
        if(this.debug === false){
          promise = promise.catch(err => {
            return this.driver.findElement(By.css('html'))
              .then(elem => elem.getAttribute('outerHTML'))
              .then(html => {
                return this.driver.getCurrentUrl().then(url => {
                  const data = Object.assign({}, this.data)
                  delete data.next
                  const message = url + "\n" +
                    "JSON: " + JSON.stringify(item) + "\n" +
                    "Name: " + err.name + "\n" +
                    "Message: " + err.message + "\n" +
                    html
                  throw new errors.VerboseError(message, err)
                })
              })
          })
        }
      }
    })

    return promise.then(() => undefined);
  }

  _applyPlaceholderToValue(value){
    if(value.placeholderKey){
      if(this.placeholder.hasOwnProperty(value.placeholderKey)){
        return value.apply(this.placeholder[value.placeholderKey])
      } else {
        throw new Error('Missing ' + value.placeholderKey + ' key in placeholder.')
      }
    } else {
      return value
    }
  }

  _applyPlaceholderToArray(elems){
    const newElems = []
    elems.forEach(elem => {
      if(elem.forEach){
        newElems.push(this._applyPlaceholderToArray(elem))
      } else {
        const newElem = {}
        for(let elemKey in elem){
          newElem[elemKey] = this._applyPlaceholderToValue(elem[elemKey])
        }
        newElems.push(newElem)
      }
    })

    return newElems
  }

  _applyPlaceholder(scenarioItem){
    if(this.placeholder === undefined){
      return scenarioItem
    }

    const newItem = {}
    for(let itemKey in scenarioItem){
      const elem = scenarioItem[itemKey]
      if(elem.forEach){
        newItem[itemKey] = this._applyPlaceholderToArray(elem)
      } else {
        newItem[itemKey] = this._applyPlaceholderToValue(elem)
      }
    }

    return newItem
  }
}

Checker.JsErrorStrings = [
  "SyntaxError",
  "EvalError",
  "ReferenceError",
  "RangeError",
  "TypeError",
  "URIError"
]

Checker.Debug = false

Checker.DefaultTimeout = 12000