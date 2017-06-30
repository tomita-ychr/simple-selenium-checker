import webdriver from 'selenium-webdriver'
import test from 'selenium-webdriver/testing'
import assert from 'power-assert'
import pauser from 'selenium-pauser'
import {Checker, placeholder} from '../dist/'
const By = webdriver.By;

const isDebug = process.execArgv.indexOf('--debug') > -1 || process.execArgv.indexOf('--debug-brk') > -1

let driver;
test.describe('SSM', () => {
  test.before(() => {
    Checker.Debug = isDebug
    Checker.DefaultTimeout = 1
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
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {exists: By.css(".delay-content"), timeout: 8000},
          {equals: "Home 002", by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {callback: elem => elem.getAttribute("alt").then(alt => alt == "Home alt 003"), by: By.css(".main .col-sm-6:nth-child(3) img")},
          {body: "<title>Simple selenium checker - Home</title>"}
        ]
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ]
      },{
        checks: [
          {exists: By.css(".delay-content"), timeout: 8000},
          {equals: "Foo 002", by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {callback: elem => elem.getAttribute("alt").then(alt => alt == "Foo alt 003"), by: By.css(".main .col-sm-6:nth-child(3) img")},
          {body: "<title>Simple selenium checker - Foo"},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    })
  })

  test.it('should fail when you specify an element that is not on the page.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
        checks: [
          {exists: By.css("#foo")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #foo)") >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
        checks: [
          {exists: By.css("#home")},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #home)") >= 0)
      })
    })
  })

  test.it('should fail when the inner text of the element does not match.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
        checks: [
          {equals: "Hoge 002", by: By.css(".main .col-sm-6:nth-child(2) h3")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(2) h3) is not `Hoge 002` actual `Home 002`") >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
        checks: [
          {equals: "Bar 003", by: By.css(".main .col-sm-6:nth-child(3) h3")},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(3) h3) is not `Bar 003` actual `Foo 003") >= 0)
      })
    })
  })

  test.it('should fail when the callback returns false.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
        checks: [
          {callback: elem => elem.getAttribute("alt").then(alt => false), by: By.css(".main .col-sm-6:nth-child(3) img")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf(" is failed") >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
        checks: [
          {callback: elem => elem.getAttribute("alt").then(alt => false), by: By.css(".main .col-sm-6:nth-child(3) img")},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf(" is failed") >= 0)
      })
    })
  })

  test.it('should fail when text that is not in the page is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
        checks: [
          {body: "<title>Simple selenium checker - Hoge</title>"}
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Missing text `<title>Simple selenium checker - Hoge</title>`") >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
        checks: [
          {body: "<title>Simple selenium checker - Bar</title>"}
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Missing text `<title>Simple selenium checker - Bar</title>`") >= 0)
      })
    })
  })

  test.it('should fail when a javascript error was detected.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/javascript-error.html",
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Uncaught ReferenceError: foobar is not defined") >= 0)
      })
    })
  })

  test.it('should fail when the server return a status code 400 to 599.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/not-exists.html",
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("the server responded with a status of 404 (Not Found)") >= 0)
      })
    })
  })

  test.it('should be able to perform actions such as click and sendKyes with the actions option.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/form.html",
        checks: [
          {exists: By.css(".input")},
        ],
      },{
        actions: [
          {sendKeys: By.css(".input"), value: "fooBarTest"},
          {click: By.css(".submit")},
        ],
        checks: [
          {exists: By.css(".main .col-sm-6:nth-child(1) h3")},
          {url: "http://127.0.0.1:8080/index.html?name=fooBarTest&send=send"},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    })
  })

  test.it('should fail when a URL different from the actual URL is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
        checks: [
          {url: "http://127.0.0.1:8080/hoge.html"},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("The specified URL was not included in the actual URL") >= 0)
      })
    })
  })

  test.it('should stop formatting the error when the debug property is true.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
        checks: [
          {url: "http://127.0.0.1:8080/hoge.html"},
        ]
      }]

      const checker = new Checker(driver)
      checker.debug = true;
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("The specified URL was not included in the actual URL") >= 0)
        assert(err.message.indexOf('<html lang="en">') === -1)
      })
    })
  })

  test.it('should check partial match with the like keyword of checks option.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
        checks: [
          {likes: "ome 00", by: By.css(".main .col-sm-6:nth-child(1) h3")},
          {likes: "ome 00", by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {likes: "ome 00", by: By.css(".main .col-sm-6:nth-child(3) h3")}
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
        checks: [
          {likes: "bar", by: By.css(".main .col-sm-6:nth-child(1) h3")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(1) h3) dose not like `bar` actual `Home 001`") >= 0)
      })
    })
  })

  test.it('should replace the value of the element of the scenario when the placeholder is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: placeholder('url').append('/'),
        actions: [
          {click: placeholder('actions_click')},
        ],
        checks: [
          {exists: placeholder('checks_by')},
          {equals: placeholder('checks_equals'), by: By.css(".main .col-sm-6:nth-child(1) h3")},
          {likes: placeholder('checks_likes'), by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {callback: placeholder('checks_callback'), by: By.css(".main .col-sm-6:nth-child(3) h3")}
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
          {callback: elem => elem.getAttribute("value").then(val => val == 'placeholdercheck'), by: By.css(".input")}
        ]
      }]

      const checker = new Checker(driver)
      checker.placeholder = {
        'url': 'http://127.0.0.1:8080',
        'checks_by': By.css(".main .col-sm-6:nth-child(2) h3"),
        'checks_equals': 'Foo 001',
        'checks_likes': 'oo 00',
        'checks_callback': () => Promise.resolve(true),
        'actions_click': By.css(".nav > li:nth-child(2) > a"),
        'actions_sendkey': By.css(".input"),
        'actions_sendkey_value': 'placeholdercheck'
      }

      const resScenario = []
      scenario.forEach(scenarioItem => resScenario.push(checker._applyPlaceholder(scenarioItem)))
      assert(resScenario[0].url === 'http://127.0.0.1:8080/')
      assert(resScenario[0].checks[0].exists.toString() === By.css(".main .col-sm-6:nth-child(2) h3").toString())
      assert(resScenario[0].checks[1].equals === 'Foo 001')
      assert(resScenario[0].checks[2].likes === 'oo 00')
      // https://gist.github.com/gomo/474b14bbf8955e0a20d56902eafd0fb8
      assert(resScenario[0].checks[3].callback.toString() === checker.placeholder.checks_callback.toString())
      assert(resScenario[0].actions[0].click.toString() === By.css(".nav > li:nth-child(2) > a").toString())
      assert(resScenario[1].url === 'http://127.0.0.1:8080/form.html')
      assert(resScenario[1].actions[0].sendKeys.toString() === By.css(".input").toString())

      return checker.run(scenario)
    })
  })

  test.it('should when there is an execif directive, evaluate whether to execute that block.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return driver.get('http://127.0.0.1:8080')
    }).then(() => {
      // exists
      return checker._testExecif([
        [{exists: By.css('header')}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //non exists
      return checker._testExecif([
        [{notExists: By.css('header')}]
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
        [{exists: By.css('header')}, {notExists: By.css('header')}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //and
      return checker._testExecif([
        [{exists: By.css('header')}],
        [{notExists: By.css('header')}]
      ]).then(res => assert(res === false))
    }).then(() => {//From here down is checker.run
      // execute checks
      return checker.run([{
        execif: [[{exists: By.css('header')}]],
        checks: [
          {exists: By.css(".non-exists")},
        ]
      }]).catch(err => err).then(err => assert(err !== undefined))
    }).then(() => {
      // ignore checks
      return checker.run([{
        execif: [[{notExists: By.css('header')}]],
        checks: [
          {exists: By.css(".non-exists")},
          {exists: By.css(".non-exists2")},
        ]
      }])
    }).then(() => {
      // execute url
      return checker.run([{
        execif: [[{exists: By.css('header')}]],
        url: "http://127.0.0.1:8080/foo.html",
      },{
        checks: [
          {exists: By.css("#foo")},
        ]
      }])
    }).then(() => {
      // ignore url
      return checker.run([{
        execif: [[{notExists: By.css('header')}]],
        url: "http://127.0.0.1:8080/form.html",
      },{
        checks: [
          {exists: By.css("#foo")},
        ]
      }])
    }).then(() => {
      // execute action
      return checker.run([{
        execif: [[{exists: By.css('header')}]],
        actions: [
          {click: By.css(".nav > li:nth-child(1) > a")},
        ],
      },{
        checks: [
          {exists: By.css("#home")},
        ]
      }])
    }).then(() => {
      // ignore action
      return checker.run([{
        execif: [[{notExists: By.css('header')}]],
        actions: [
          {click: By.css(".non-exists")},
          {click: By.css(".non-exists2")},
        ],
      }])
    })
  })
})
