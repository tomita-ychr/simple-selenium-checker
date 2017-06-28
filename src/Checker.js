import webdriver from 'selenium-webdriver';
import * as checks from './checks'
import * as actions from './actions'
const until = webdriver.until;
const By = webdriver.By;

export default class Checker
{
  constructor(driver){
    this.driver = driver
    this.waitElementTimeout = Checker.WaitElementTimeout
    this.debug = Checker.Debug;
  }

  waitElement(locator){
    return this.driver
      .wait(until.elementLocated(locator), this.waitElementTimeout)
      .then(elem => this.driver.wait(until.elementIsVisible(elem), this.waitElementTimeout));
  }

  detectFunction(functions, obj){
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

  run(scenario, host){
    let promise = Promise.resolve()
    scenario.forEach(item => {
      //url
      if(item.url) {
        promise = this.driver.get(host ? host + item.url : item.url)
      }

      //actions
      if(item.actions) {
        item.actions.forEach(action => {
          promise = promise.then(() => this.detectFunction(actions, action)(this, action))
        })
      }

      //Process checks
      if(item.checks) {
        item.checks.forEach(check => {
          promise = promise.then(() => this.detectFunction(checks, check)(this, check))
        })
      }

      //Check javascript and response errors using browser logs.
      promise = promise.then(() => {
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
}

Checker.WaitElementTimeout = 4000

Checker.JsErrorStrings = [
  "SyntaxError",
  "EvalError",
  "ReferenceError",
  "RangeError",
  "TypeError",
  "URIError"
]

Checker.Debug = false
