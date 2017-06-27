import webdriver from 'selenium-webdriver';
const until = webdriver.until;
const By = webdriver.By;

export default class Checker
{
  constructor(driver, host){
    this.driver = driver
    this.host = host;
    this.waitElementTimeout = Checker.WaitElementTimeout
    this.debug = Checker.Debug;
  }

  waitElement(locator){
    return this.driver
      .wait(until.elementLocated(locator), this.waitElementTimeout)
      .then(elem => this.driver.wait(until.elementIsVisible(elem), this.waitElementTimeout));
  }

  run(scenario){
    let promise = Promise.resolve()
    scenario.forEach(item => {
      //url
      if(item.url) {
        promise = this.driver.get(this.host ? this.host + item.url : item.url)
      }

      //actions
      if(item.actions) {
        item.actions.forEach(action => {
          promise = promise.then(() => {
            return this.waitElement(action.loc).then(elem => {
              switch (action.type) {
                case Checker.ActionType.Click:
                  return elem.click()
                case Checker.ActionType.SendKeys:
                  return elem.sendKeys(action.value)
                default:
                  throw new Error("Unknown action type " + action.type + " is specified.")
              }
            })
          })
        })
      }

      //Process checkes
      if(item.checks) {
        item.checks.forEach(check => {
          promise = promise.then(() => {
            if(check.loc){
              return this.waitElement(check.loc).then(elem => {
                if(check.text){
                  return elem.getText().then(text => {
                    if(text !== check.text) throw new Error('Text in ' + check.loc.toString() + ' is not `' + check.text + '` actual `' + text + "`")
                  })
                } else if(check.like){
                  return elem.getText().then(text => {
                    if(text.indexOf(check.like) === -1) throw new Error('Text in ' + check.loc.toString() + ' dose not like `' + check.like + '` actual `' + text + '`')
                  })
                } else if(check.callback) {
                  return check.callback(elem).then(res => {
                    if(!res) throw new Error(check.callback.toString() + ' is failed')
                  })
                }
              })
            } else if(check.text){
              return this.driver.findElement(By.css('html'))
                .then(elem => elem.getAttribute('outerHTML'))
                .then(html => {
                  if(html.indexOf(check.text) === -1) throw new Error("Missing text `" + check.text + "`")
                })
            } else if(check.url){
              return this.driver.getCurrentUrl().then(url => {
                if(url.indexOf(check.url) === -1){
                  throw new Error('The specified URL was not included in the actual URL')
                }
              })
            }
          })
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

Checker.ActionType = {
  Click: 'Click',
  SendKeys: 'SendKeys'
}

Checker.Debug = false
