import webdriver from 'selenium-webdriver';
import request from 'request'
const until = webdriver.until;
const By = webdriver.By;

export default class Page
{
  constructor(driver, data){
    this.driver = driver
    this.data = data;
    this.waitElementTimeout = Page.WaitElementTimeout
  }

  waitElement(locator){
    return this.driver
      .wait(until.elementLocated(locator), this.waitElementTimeout)
      .then(elem => this.driver.wait(until.elementIsVisible(elem)), this.waitElementTimeout);
  }

  run(){
    let promise = Promise.resolve()
    if(this.data.url) {
      promise = this.driver.get(this.data.url)
    } else if(this.data.link) {
      promise = this.waitElement(this.data.link).then(elem => elem.click())
    }

    //Process checkes
    if(this.data.checks) {
      this.data.checks.forEach(check => {
        promise = promise.then(() => {
          if(check.loc){
            return this.waitElement(check.loc).then(elem => {
              if(check.text){
                return elem.getText().then(text => {
                  if(text !== check.text) throw new Error('Text in ' + check.loc.toString() + ' is not `' + check.text + '` but `' + text + "`")
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
              if(Page.JsErrorStrings.some(err => log.message.indexOf(err) >= 0)){
                throw new Error("Javascript error was detected: " + log.message)
              }

              //response
              if(log.message.indexOf(url) >= 0){
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

    //Process next
    if(this.data.next){
      var child = new Page(this.driver, this.data.next)
      promise = promise.then(() => child.run())
    }

    return promise;
  }
}

Page.WaitElementTimeout = 4000

Page.JsErrorStrings = [
  "SyntaxError",
  "EvalError",
  "ReferenceError",
  "RangeError",
  "TypeError",
  "URIError"
]
