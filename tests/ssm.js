import webdriver from 'selenium-webdriver'
import test from 'selenium-webdriver/testing'
import assert from 'power-assert'
import Page from '../src/Page'

const By = webdriver.By;

let driver;
test.describe('SSM', () => {
  test.before(() => {
    Page.WaitElementTimeout = 1000
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
    // driver.quit();
  });

  test.it('should succeed when giving correct page data.', () => {
    const pageData = {
      url: "http://127.0.0.1:8080/",
      checks: [
        {loc: By.css(".delay-content")},
        {loc: By.css(".main .col-sm-6:nth-child(2) h3"), text: "Home 002"},
        {loc: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => alt == "Home alt 003")},
        {text: "<title>Simple selenium checker - Home</title>"}
      ],
      next: {
        link: By.css(".nav > li:nth-child(2) > a"),
        checks: [
          {loc: By.css(".delay-content")},
          {loc: By.css(".main .col-sm-6:nth-child(2) h3"), text: "Foo 002"},
          {loc: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => alt == "Foo alt 003")},
          {text: "<title>Simple selenium checker - Foo"},
        ],
      }
    }

    const page = new Page(driver, pageData)
    page.run()
  })

  test.it('should fail when you specify an element that is not on the page.', () => {
    let pageData = {
      url: "http://127.0.0.1:8080/",
      checks: [
        {loc: By.css(".not-exists-element")},
      ]
    }

    let page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Waiting for element to be located By(css selector, .not-exists-element)") >= 0)
    })

    pageData = {
      url: "http://127.0.0.1:8080/",
      next: {
        link: By.css(".nav > li:nth-child(2) > a"),
        checks: [
          {loc: By.css(".not-exists-element-next")},
        ],
      }
    }

    page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Waiting for element to be located By(css selector, .not-exists-element-next)") >= 0)
    })
  })

  test.it('should fail when the inner text of the element does not match.', () => {
    let pageData = {
      url: "http://127.0.0.1:8080/",
      checks: [
        {loc: By.css(".main .col-sm-6:nth-child(2) h3"), text: "Hoge 002"},
      ]
    }

    let page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(2) h3) is not `Hoge 002` but `Home 002`") >= 0)
    })

    pageData = {
      url: "http://127.0.0.1:8080/",
      next: {
        link: By.css(".nav > li:nth-child(2) > a"),
        checks: [
          {loc: By.css(".main .col-sm-6:nth-child(3) h3"), text: "Bar 003"},
        ],
      }
    }

    page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(3) h3) is not `Bar 003` but `Foo 003") >= 0)
    })
  })

  test.it('should fail when the callback returns false.', () => {
    let pageData = {
      url: "http://127.0.0.1:8080/",
      checks: [
        {loc: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => false)},
      ]
    }

    let page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf(" is failed") >= 0)
    })

    pageData = {
      url: "http://127.0.0.1:8080/",
      next: {
        link: By.css(".nav > li:nth-child(2) > a"),
        checks: [
          {loc: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => false)},
        ],
      }
    }

    page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf(" is failed") >= 0)
    })
  })

  test.it('should fail when text that is not in the page is specified.', () => {
    let pageData = {
      url: "http://127.0.0.1:8080/",
      checks: [
        {text: "<title>Simple selenium checker - Hoge</title>"}
      ]
    }

    let page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Missing text `<title>Simple selenium checker - Hoge</title>`") >= 0)
    })

    pageData = {
      url: "http://127.0.0.1:8080/",
      next: {
        link: By.css(".nav > li:nth-child(2) > a"),
        checks: [
          {text: "<title>Simple selenium checker - Bar</title>"}
        ],
      }
    }

    page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Missing text `<title>Simple selenium checker - Bar</title>`") >= 0)
    })
  })

  test.it('should fail when a javascript error was detected.', () => {
    const pageData = {
      url: "http://127.0.0.1:8080/javascript-error.html",
    }

    const page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Uncaught ReferenceError: foobar is not defined") >= 0)
    })
  })

  test.it('should fail when the server return a status code 400 to 599.', () => {
    const pageData = {
      url: "http://127.0.0.1:8080/not-exists.html",
    }

    const page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("the server responded with a status of 404 (Not Found)") >= 0)
    })
  })

  test.it('should be able to perform actions such as click and sendKyes with the actions option.', () => {
    const pageData = {
      url: "http://127.0.0.1:8080/form.html",
      checks: [
        {loc: By.css(".input")},
      ],
      next: {
        actions: [
          {loc: By.css(".input"), type: Page.ActionType.SendKeys,  value: "fooBarTest"},
          {loc: By.css(".submit"), type: Page.ActionType.Click},
        ],
        checks: [
          {loc: By.css(".main .col-sm-6:nth-child(1) h3")},
          {url: "http://127.0.0.1:8080/index.html?name=fooBarTest&send=send"},
        ],
      }
    }

    const page = new Page(driver, pageData)
    page.run()
  })

  test.it('should fail when a URL different from the actual URL is specified.', () => {
    const pageData = {
      url: "http://127.0.0.1:8080/",
      checks: [
        {url: "http://127.0.0.1:8080/hoge.html"},
      ]
    }

    const page = new Page(driver, pageData)
    page.run().catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("The specified URL was not included in the actual URL") >= 0)
    })
  })
})
