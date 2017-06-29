import webdriver from 'selenium-webdriver'
import test from 'selenium-webdriver/testing'
import assert from 'power-assert'
import pauser from 'selenium-pauser'
import Checker from '../src/Checker'
import placeholder from '../src/placeholder'
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
        {by: By.css(".delay-content")},
        {by: By.css(".main .col-sm-6:nth-child(2) h3"), equal: "Home 002"},
        {by: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => alt == "Home alt 003")},
        {body: "<title>Simple selenium checker - Home</title>"}
      ]
    },{
      actions:[
        {click: By.css(".nav > li:nth-child(2) > a")},
      ]
    },{
      checks: [
        {by: By.css(".delay-content")},
        {by: By.css(".main .col-sm-6:nth-child(2) h3"), equal: "Foo 002"},
        {by: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => alt == "Foo alt 003")},
        {body: "<title>Simple selenium checker - Foo"},
      ],
    }]

    const checker = new Checker(driver)
    checker.run(scenario)
  })

  test.it('should fail when you specify an element that is not on the page.', () => {
    let scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {by: By.css("#foo")},
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
        {click: By.css(".nav > li:nth-child(2) > a")},
      ],
      checks: [
        {by: By.css("#home")},
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
        {by: By.css(".main .col-sm-6:nth-child(2) h3"), equal: "Hoge 002"},
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
        {click: By.css(".nav > li:nth-child(2) > a")},
      ],
      checks: [
        {by: By.css(".main .col-sm-6:nth-child(3) h3"), equal: "Bar 003"},
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
        {by: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => false)},
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
        {click: By.css(".nav > li:nth-child(2) > a")},
      ],
      checks: [
        {by: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => false)},
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
        {body: "<title>Simple selenium checker - Hoge</title>"}
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
        {click: By.css(".nav > li:nth-child(2) > a")},
      ],
      checks: [
        {body: "<title>Simple selenium checker - Bar</title>"}
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
        {by: By.css(".input")},
      ],
    },{
      actions: [
        {sendKeys: By.css(".input"), value: "fooBarTest"},
        {click: By.css(".submit")},
      ],
      checks: [
        {by: By.css(".main .col-sm-6:nth-child(1) h3")},
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
        {by: By.css(".main .col-sm-6:nth-child(1) h3"), like: "ome 00"},
        {by: By.css(".main .col-sm-6:nth-child(2) h3"), like: "ome 00"},
        {by: By.css(".main .col-sm-6:nth-child(3) h3"), like: "ome 00"}
      ]
    }]

    let checker = new Checker(driver)
    checker.run(scenario)

    scenario = [{
      url: "http://127.0.0.1:8080/",
      checks: [
        {by: By.css(".main .col-sm-6:nth-child(1) h3"), like: "bar"},
      ]
    }]

    checker = new Checker(driver)
    checker.run(scenario).catch(err => err).then(err => {
      assert(err != undefined)
      assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(1) h3) dose not like `bar` actual `Home 001`") >= 0)
    })
  })

  test.it('should replace the value of the element of the scenario when the placeholder is specified.', () => {
    const scenario = [{
      url: placeholder('url').append('/'),
      actions: [
        {click: placeholder('actions_click')},
      ],
      checks: [
        {by: placeholder('checks_by')},
        {by: By.css(".main .col-sm-6:nth-child(1) h3"), equal: placeholder('checks_equal')},
        {by: By.css(".main .col-sm-6:nth-child(2) h3"), like: placeholder('checks_like')},
        {by: By.css(".main .col-sm-6:nth-child(3) h3"), callback: placeholder('checks_callback')}
      ],
    },{
      url: placeholder('url').append('/form.html'),
      actions: [
        {sendKeys: placeholder('actions_sendkey'), value: "fooBarTest"},
        {clear: By.css(".input")},
        {sendKeys: By.css(".input"), value: placeholder('actions_sendkey_value')},
      ]
    },{
      checks: [
        {by: By.css(".input"), callback: elem => elem.getAttribute("value").then(val => val == 'placeholdercheck')}
      ]
    }]

    const checker = new Checker(driver)
    checker.placeholder = {
      'url': 'http://127.0.0.1:8080',
      'checks_by': By.css(".main .col-sm-6:nth-child(2) h3"),
      'checks_equal': 'Foo 001',
      'checks_like': 'oo 00',
      'checks_callback': () => Promise.resolve(true),
      'actions_click': By.css(".nav > li:nth-child(2) > a"),
      'actions_sendkey': By.css(".input"),
      'actions_sendkey_value': 'placeholdercheck'
    }


    const resScenario = []
    scenario.forEach(scenarioItem => resScenario.push(checker._applyPlaceholder(scenarioItem)))
    assert(resScenario[0].url === 'http://127.0.0.1:8080/')
    assert(resScenario[0].checks[0].by.toString() === By.css(".main .col-sm-6:nth-child(2) h3").toString())
    assert(resScenario[0].checks[1].equal === 'Foo 001')
    assert(resScenario[0].checks[2].like === 'oo 00')
    // https://gist.github.com/gomo/474b14bbf8955e0a20d56902eafd0fb8
    assert(resScenario[0].checks[3].callback.toString() === checker.placeholder.checks_callback.toString())
    assert(resScenario[0].actions[0].click.toString() === By.css(".nav > li:nth-child(2) > a").toString())
    assert(resScenario[1].url === 'http://127.0.0.1:8080/form.html')
    assert(resScenario[1].actions[0].sendKeys.toString() === By.css(".input").toString())

    checker.run(scenario)
  })

  test.it('should when there is an execif directive, evaluate whether to execute that block.', () => {
    driver.get('http://127.0.0.1:8080')
    const checker = new Checker(driver)

    return Promise.resolve()
      .then(() => {
        // exists
        return checker._testExecif([
          [{exists: By.css('header')}]
        ]).then(res => assert(res === true))
      }).then(() => {
        //non exists
        return checker._testExecif([
          [{nonExists: By.css('header')}]
        ]).then(res => assert(res === false))
      }).then(() => {
        // bool true
        return checker._testExecif([
          [{bool: true}]
        ]).then(res => assert(res === true))
      }).then(() => {
        // bool false
        return checker._testExecif([
          [{bool: false}]
        ]).then(res => assert(res === false))
      }).then(() => {
        //or
        return checker._testExecif([
          [{exists: By.css('header')}, {nonExists: By.css('header')}]
        ]).then(res => assert(res === true))
      }).then(() => {
        //and
        return checker._testExecif([
          [{exists: By.css('header')}],
          [{nonExists: By.css('header')}]
        ]).then(res => assert(res === false))
      })
      // .then(() => {
      //   //checker run
      //   return checker.run([{
      //     execif: [[{exists: By.css('header')}]],
      //     checks: [
      //       {by: By.css(".non-exists")},
      //     ]
      //   }]).catch(err => err).then(err => assert(err !== undefined))
      // }).then(() => {
      //   return checker.run([{
      //     execif: [[{nonExists: By.css('header')}]],
      //     checks: [
      //       {by: By.css(".non-exists")},
      //     ]
      //   }])
      // })
  })
})
