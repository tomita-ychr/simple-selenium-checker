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

    //https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/141
    //Selenium can not check the status code, because it can not access the response header.
    //I wrote the code to get only the header separately, but unnecessary access occurs, so I commented it out.
    // promise = promise.then(() => {
    //   return this.driver.getCurrentUrl().then(url => {
    //     return request(url, {method: 'HEAD'}, function (err, res, body){
    //       const code = parseInt(res.statusCode, 10)
    //       if(code < 100 || code > 399){
    //         throw new Error('Response code is ' + res.statusCode)
    //       }
    //     })
    //   })
    // })


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

    //Check javascript errors
    promise = promise.then(() => {
      return this.driver.manage().logs().get('browser').then(logs => {
        logs.forEach(log => {
          if(Page.JsErrorStrings.some(err => log.message.indexOf(err) >= 0)){
            throw new Error("Javascript error was detected: " + log.message)
          }
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
