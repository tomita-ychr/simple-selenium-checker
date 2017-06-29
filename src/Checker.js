import webdriver from 'selenium-webdriver';
import * as checks from './checks'
import * as actions from './actions'
const until = webdriver.until;
const By = webdriver.By;

export default class Checker
{
  constructor(driver){
    this.driver = driver
    this.debug = Checker.Debug
    this.defaultTimeout = Checker.DefaultTimeout
  }

  waitElement(locator, timeout){
    if(timeout === undefined) timeout = this.defaultTimeout;
    return this.driver
      .wait(until.elementLocated(locator), timeout)
      .then(elem => this.driver.wait(until.elementIsVisible(elem), timeout));
  }

  _detectFunction(functions, obj){
    const keys = []
    let func = undefined
    for(let key in functions){
      if(obj[key]){
        keys.push(key)
        if(func) throw new Error("Found two identify keys. " + keys.join(','))
        func = functions[key]
      }
    }

    if(!func){
      throw new Error("Invalid checks object. " + JSON.stringify(obj))
    }

    return func
  }

  _testItem(condition){
    if(condition.exists){
      return this.waitElement(condition.exists, condition.wait)
        .then(() => true)
        .catch(() => false)
    } else if(condition.nonExists){
      return this.waitElement(condition.nonExists, condition.wait)
        .then(() => false)
        .catch(() => true)
    } else if(condition.bool !== undefined){
      return Promise.resolve(condition.bool)
    } else {
      throw new Error("Invalid exexif condition " + JSON.stringify(condition))
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

  run(scenario, host){
    let promise = Promise.resolve()
    scenario.forEach(item => {
      item = this._applyPlaceholder(item)

      promise = promise.then(() => this._testExecif(item.execif))

      //url
      if(item.url) {
        promise = promise.then(res => {
          if(res === false) return false
          return this.driver.get(host ? host + item.url : item.url)
        })
      }

      //actions
      if(item.actions) {
        item.actions.forEach(action => {
          promise = promise.then(res => {
            if(res === false) return false
            return this._detectFunction(actions, action)(this, action)
          })
        })
      }

      //Process checks
      if(item.checks) {
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
                  throw new Error("Javascript error was detected: " + log.message)
                }

                //response
                if(log.message.indexOf(url + " - ") === 0){
                  const msg = log.message.split(url).join("")
                  for(let i = 400;i <= 599; i++){
                    if(msg.indexOf(" " + i + " ") >= 0){
                      throw new Error("The response error was detected: " + log.message)
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
                throw new Error(
                  url + "\n" +
                  "JSON: " + JSON.stringify(data) + "\n" +
                  "Message: " + err.message + "\n" +
                  html
                )
              })
            })
        })
      }
    })

    return promise;
  }

  _applyPlaceholderToValue(value){
    if(value.placeholderKey){
      if(this.placeholder[value.placeholderKey]){
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

Checker.DefaultTimeout = 3000

Checker.JsErrorStrings = [
  "SyntaxError",
  "EvalError",
  "ReferenceError",
  "RangeError",
  "TypeError",
  "URIError"
]

Checker.Debug = false
