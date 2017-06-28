import webdriver from 'selenium-webdriver'
import test from 'selenium-webdriver/testing'
import assert from 'power-assert'
import pauser from 'selenium-pauser';
import Checker from '../src/Checker'
const By = webdriver.By;

const isDebug = process.execArgv.indexOf('--debug') > -1 || process.execArgv.indexOf('--debug-brk') > -1

let driver;
test.describe('SSM', () => {
  test.before(() => {
    Checker.WaitElementTimeout = 1000
    Checker.Debug = isDebug
    const chromeCapabilities = webdriver.Capabilities.chrome();
    chromeCapabilities.set('chromeOptions', {
      // 'args': ['--headless', '--disable-gpu']
    });
    driver = new webdriver.Builder()
      .usingServer('http://localhost:4444/wd/hub')
      .withCapabilities(chromeCapabilities)
      .build();
  });

  test.after(() => {
    if(isDebug){
      return pauser.pause().then(() => driver.quit())
    } else {
      return driver.quit()
    }
  });

  test.it('should succeed when giving correct page data.', () => {
    const scenario = [{
      url: "http://127.0.0.1:8080/",
    },{
      checks: [
        {loc: By.css(".delay-content")},
        {loc: By.css(".main .col-sm-6:nth-child(2) h3"), text: "Home 002"},
        {loc: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => alt == "Home alt 003")},
        {text: "<title>Simple selenium checker - Home</title>"}
      ]
    },{
      actions:[
        {loc: By.css(".nav > li:nth-child(2) > a"), type: Checker.ActionType.Click},
      ]
    },{
      checks: [
        {loc: By.css(".delay-content")},
        {loc: By.css(".main .col-sm-6:nth-child(2) h3"), text: "Foo 002"},
        {loc: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => alt == "Foo alt 003")},
        {text: "<title>Simple selenium checker - Foo"},
      ],
    }]

    const checker = new Checker(driver)
    checker.run(scenario)
  })

  test.it('should fail when you specify an element that is not on the page.', () => {
    let scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {loc: By.css("#foo")},
      ]
    }]

    let checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Waiting for element to be located By(css selector, #foo)") >= 0)
    })

    scenario = [{
      url: "http://127.0.0.1:8080/",
    },{
      actions:[
        {loc: By.css(".nav > li:nth-child(2) > a"), type: Checker.ActionType.Click},
      ],
      checks: [
        {loc: By.css("#home")},
      ],
    }]

    checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Waiting for element to be located By(css selector, #home)") >= 0)
    })
  })

  test.it('should fail when the inner text of the element does not match.', () => {
    let scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {loc: By.css(".main .col-sm-6:nth-child(2) h3"), text: "Hoge 002"},
      ]
    }]

    let checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(2) h3) is not `Hoge 002` actual `Home 002`") >= 0)
    })

    scenario = [{
      url: "http://127.0.0.1:8080/",
    },{
      actions:[
        {loc: By.css(".nav > li:nth-child(2) > a"), type: Checker.ActionType.Click},
      ],
      checks: [
        {loc: By.css(".main .col-sm-6:nth-child(3) h3"), text: "Bar 003"},
      ],
    }]

    checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(3) h3) is not `Bar 003` actual `Foo 003") >= 0)
    })
  })

  test.it('should fail when the callback returns false.', () => {
    let scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {loc: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => false)},
      ]
    }]

    let checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf(" is failed") >= 0)
    })

    scenario = [{
      url: "http://127.0.0.1:8080/",
    },{
      actions:[
        {loc: By.css(".nav > li:nth-child(2) > a"), type: Checker.ActionType.Click},
      ],
      checks: [
        {loc: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => false)},
      ],
    }]

    checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf(" is failed") >= 0)
    })
  })

  test.it('should fail when text that is not in the page is specified.', () => {
    let scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {text: "<title>Simple selenium checker - Hoge</title>"}
      ]
    }]

    let checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Missing text `<title>Simple selenium checker - Hoge</title>`") >= 0)
    })

    scenario = [{
      url: "http://127.0.0.1:8080/",
    },{
      actions:[
        {loc: By.css(".nav > li:nth-child(2) > a"), type: Checker.ActionType.Click},
      ],
      checks: [
        {text: "<title>Simple selenium checker - Bar</title>"}
      ],
    }]

    checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Missing text `<title>Simple selenium checker - Bar</title>`") >= 0)
    })
  })

  test.it('should fail when a javascript error was detected.', () => {
    const scenario = [{
      url: "http://127.0.0.1:8080/javascript-error.html",
    }]

    const checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Uncaught ReferenceError: foobar is not defined") >= 0)
    })
  })

  test.it('should fail when the server return a status code 400 to 599.', () => {
    const scenario = [{
      url: "http://127.0.0.1:8080/not-exists.html",
    }]

    const checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("the server responded with a status of 404 (Not Found)") >= 0)
    })
  })

  test.it('should be able to perform actions such as click and sendKyes with the actions option.', () => {
    const scenario = [{
      url: "http://127.0.0.1:8080/form.html",
      checks: [
        {loc: By.css(".input")},
      ],
    },{
      actions: [
        {loc: By.css(".input"), type: Checker.ActionType.SendKeys,  value: "fooBarTest"},
        {loc: By.css(".submit"), type: Checker.ActionType.Click},
      ],
      checks: [
        {loc: By.css(".main .col-sm-6:nth-child(1) h3")},
        {url: "http://127.0.0.1:8080/index.html?name=fooBarTest&send=send"},
      ],
    }]

    const checker = new Checker(driver)
    checker.run(scenario)
  })

  test.it('should fail when a URL different from the actual URL is specified.', () => {
    const scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {url: "http://127.0.0.1:8080/hoge.html"},
      ]
    }]

    const checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("The specified URL was not included in the actual URL") >= 0)
    })
  })

  test.it('should stop formatting the error when the debug property is true.', () => {
    const scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {url: "http://127.0.0.1:8080/hoge.html"},
      ]
    }]

    const checker = new Checker(driver)
    checker.debug = true;
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("The specified URL was not included in the actual URL") >= 0)
      assert(err.message.indexOf('<html lang="en">') === -1)
    })
  })

  test.it('should check partial match with the like keyword of checks option.', () => {
    let scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {loc: By.css(".main .col-sm-6:nth-child(1) h3"), like: "ome 00"},
        {loc: By.css(".main .col-sm-6:nth-child(2) h3"), like: "ome 00"},
        {loc: By.css(".main .col-sm-6:nth-child(3) h3"), like: "ome 00"}
      ]
    }]

    let checker = new Checker(driver)
    checker.run(scenario)

    scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {loc: By.css(".main .col-sm-6:nth-child(1) h3"), like: "bar"},
      ]
    }]

    checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(1) h3) dose not like `bar` actual `Home 001`") >= 0)
    })
  })
})
