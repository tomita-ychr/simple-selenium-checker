import webdriver from 'selenium-webdriver'
import test from 'selenium-webdriver/testing'
import assert from 'power-assert'
import pauser from 'selenium-pauser'
import Checker from '../src/Checker'
import placeholder from '../src/placeholder'
const By = webdriver.By;

const isDebug = process.execArgv.indexOf('--debug') > -1 || process.execArgv.indexOf('--debug-brk') > -1

let driver;
test.describe('SSC', () => {
  test.before(() => {
    Checker.Debug = isDebug
    Checker.DefaultTimeout = 1
    const chromeCapabilities = webdriver.Capabilities.chrome();
    const args = ["--window-size=1024,768"]
    if(!isDebug){
      // args.push('--headless', '--disable-gpu')
    }
    chromeCapabilities.set('chromeOptions', {
      'args': args
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
          {equals: "Home alt 003", type: {attr: 'alt'}, by: By.css(".main .col-sm-6:nth-child(3) img")},
          {likes: "<title>Simple selenium checker - Home</title>", type: "html"}
        ]
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ]
      },{
        checks: [
          {exists: By.css(".delay-content"), timeout: 8000},
          {equals: "Foo 002", by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {equals: "Foo alt 003", type: {attr: "alt"}, by: By.css(".main .col-sm-6:nth-child(3) img")},
          {likes: "<title>Simple selenium checker - Foo", type: "html"},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    })
  })

  test.it('should fail when you specify an element that is not on the page.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/"
      },{
        checks: [
          {exists: By.css("#foo")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotSuchElementError")
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ]
      },{
        checks: [
          {exists: By.css("#home")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotSuchElementError")
      })
    })
  })

  test.it('should fail when the inner text of the element does not match.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      }, {
        checks: [
          {equals: "Hoge 002", by: By.css(".main .col-sm-6:nth-child(2) h3")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Hoge 002') >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
      },{
        checks: [
          {equals: "Bar 003", by: By.css(".main .col-sm-6:nth-child(3) h3")},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Bar 003') >= 0)
      })
    })
  })

  test.it('should fail when text that is not in the page is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/"
      },{
        checks: [
          {likes: "<title>Simple selenium checker - Hoge</title>" , type: "html"}
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('<title>Simple selenium checker - Hoge</title>') >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
      },{
        checks: [ 
          {likes: "<title>Simple selenium checker - Bar</title>", type: "html"}
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('<title>Simple selenium checker - Bar</title>') >= 0)
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
        assert(err.name == "JavascriptError")
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
        assert(err.name == "StatusCodeError")
      })
    })
  })

  test.it('should be able to perform actions such as click and sendKyes with the actions option.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/form.html",
      },{
        checks: [
          {exists: By.css(".input")},
        ],
      },{
        actions: [
          {sendKeys: By.css(".input"), value: "fooBarTest"},
          {click: By.css(".submit")},
        ],
      },{
        checks: [
          {exists: By.css(".main .col-sm-6:nth-child(1) h3")},
          {equals: "http://127.0.0.1:8080/index.html?name=fooBarTest&send=send", type: "url"},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    })
  })

  test.it('should be able to check url.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {equals: "http://127.0.0.1:8080/", type: 'url'},
          {likes: "127.0.0.1", type: 'url'},
          {notEquals: "http://127.0.0.1:8080/foobar.html", type: 'url'},
          {notLikes: "foobar", type: 'url'},
        ]
      }]

      return checker.run(scenario)
    }).then(() => {
      return checker.run([{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {equals: "http://127.0.0.1:8080/hoge.html", type: 'url'},
        ]
      }]).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('http://127.0.0.1:8080/hoge.html') >= 0)
      })
    }).then(() => {
      return checker.run([{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {likes: "hoge.html", type: 'url'},
        ]
      }]).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('hoge.html') >= 0)
      })
    }).then(() => {
      return checker.run([{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {notEquals: "http://127.0.0.1:8080/", type: 'url'},
        ]
      }]).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('http://127.0.0.1:8080/') >= 0)
      })
    }).then(() => {
      return checker.run([{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {notLikes: "127.0.0.1", type: 'url'},
        ]
      }]).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('127.0.0.1') >= 0)
      })
    })
  })

  test.it('should stop formatting the error when the debug property is true.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {equals: "http://127.0.0.1:8080/hoge.html", type: 'url'},
        ]
      }]

      const checker = new Checker(driver)
      checker.debug = true;
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('http://127.0.0.1:8080/hoge.html') >= 0)
      })
    })
  })

  test.it('should check partial match with the like keyword of checks option.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
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
      },{
        checks: [
          {likes: "bar", by: By.css(".main .col-sm-6:nth-child(1) h3")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('bar') >= 0)
      })
    })
  })

  test.it('should replace the value of the element of the scenario when the placeholder is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: placeholder('url').append('/'),
      },{
        actions: [
          {click: placeholder('actions_click')},
        ],
      },{
        checks: [
          {exists: placeholder('checks_by')},
          {equals: placeholder('checks_equals'), by: By.css(".main .col-sm-6:nth-child(1) h3")},
          {likes: placeholder('checks_likes'), by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {equals: placeholder('checks_attr_value'), type: {attr:"value"}, by: By.css(".main .col-sm-6:nth-child(3) h3")}
        ],
      },{
        url: placeholder('url').append('/form.html'),
      },{
        actions: [
          {sendKeys: placeholder('actions_sendkey'), value: "fooBarTest"},
          {clear: By.css(".input")},
          {sendKeys: By.css(".input"), value: placeholder('actions_sendkey_value')},
        ]
      },{
        checks: [
          {equals: 'placeholdercheck', type: {attr: 'value'}, by: By.css(".input")}
        ]
      }]

      const checker = new Checker(driver)
      checker.placeholder = {
        'url': 'http://127.0.0.1:8080',
        'checks_by': By.css(".main .col-sm-6:nth-child(2) h3"),
        'checks_equals': 'Foo 001',
        'checks_likes': 'oo 00',
        'checks_attr_value': null,
        'actions_click': By.css(".nav > li:nth-child(2) > a"),
        'actions_sendkey': By.css(".input"),
        'actions_sendkey_value': 'placeholdercheck'
      }

      const resScenario = []
      scenario.forEach(scenarioItem => resScenario.push(checker._applyPlaceholder(scenarioItem)))
      assert(resScenario[0].url === 'http://127.0.0.1:8080/')
      assert(resScenario[1].actions[0].click.toString() === By.css(".nav > li:nth-child(2) > a").toString())
      assert(resScenario[2].checks[0].exists.toString() === By.css(".main .col-sm-6:nth-child(2) h3").toString())
      assert(resScenario[2].checks[1].equals === 'Foo 001')
      assert(resScenario[2].checks[2].likes === 'oo 00')
      // https://gist.github.com/gomo/474b14bbf8955e0a20d56902eafd0fb8
      assert(resScenario[2].checks[3].equals === null)
      assert(resScenario[3].url === 'http://127.0.0.1:8080/form.html')
      assert(resScenario[4].actions[0].sendKeys.toString() === By.css(".input").toString())

      return checker.run(scenario)
    })
  })

  test.it('should when there is an execif directive, evaluate whether to execute that block.', () => {
    const checker = new Checker(driver)
    let promise =  Promise.resolve().then(() => {
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
    })

    //From here down is checker.run tests.
    promise = promise.then(() => {
      // execute checks
      return checker.run([{
        url: 'http://127.0.0.1:8080/'
      },{
        scenario: [{
          execif: [[{exists: By.css('header')}]],
        },{
          checks: [
            {exists: By.css(".non-exists")},
          ]
        }]
      }]).catch(err => err).then(err => assert(err !== undefined))
    }).then(() => {
      //ignore checks
      return checker.run([{
        url: 'http://127.0.0.1:8080/'
      },{
        scenario: [{
          execif: [[{notExists: By.css('header')}]],
        },{
          checks: [
            {exists: By.css(".non-exists")},
            {exists: By.css(".non-exists2")},
          ]
        }]
      }])
    })
    .then(() => {
      // execute url
      return checker.run([{
        url: 'http://127.0.0.1:8080/'
      },{
        scenario: [{
          execif: [[{exists: By.css('header')}]]
        },{
          url: "http://127.0.0.1:8080/foo.html"
        }]
      },{
        checks: [
          {exists: By.css("#foo")},
          {exists: By.css("#fail-on-execute-url")},
        ]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotSuchElementError")
      })
    }).then(() => {
      // ignore url
      return checker.run([{
        url: 'http://127.0.0.1:8080/foo.html'
      },{
        scenario: [{
          execif: [[{notExists: By.css('header')}]]
        },{
          url: "http://127.0.0.1:8080/form.html"
        }]
      },{
        checks: [
          {exists: By.css("#foo")},
          {exists: By.css("#fail-on-ignore-url")},
        ]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotSuchElementError")
      })
    }).then(() => {
      // execute action
      return checker.run([{
        url: 'http://127.0.0.1:8080/foo.html'
      },{
        scenario: [{
          execif: [[{exists: By.css('header')}]]
        },{
          actions: [
            {click: By.css(".nav > li:nth-child(1) > a")},
          ]
        }]
      },{
        checks: [
          {exists: By.css("#home")},
          {exists: By.css("#fail-on-execute-action")},
        ]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotSuchElementError")
      })
    }).then(() => {
      // ignore action
      return checker.run([{
        url: 'http://127.0.0.1:8080/'
      },{
        scenario: [
          {execif: [[{notExists: By.css('header')}]]
        },{
          actions: [
            {click: By.css(".non-exists")},
            {click: By.css(".non-exists2")},
          ]
        }]
      },{
        checks: [
          {exists: By.css("#home")},
          {exists: By.css("#fail-on-ignore-action")},
        ]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotSuchElementError")
      })
    })

    return promise
  })

  test.it('should be able to handle nested scenarios.', () => {
    const checker = new Checker(driver)

    return Promise.resolve().then(() => {
      // second level
      return checker.run([{
        url: "http://127.0.0.1:8080/"
      },{
        scenario: [{
          url: "http://127.0.0.1:8080/foo.html"
        },{
          checks: [
            {exists: By.css("#foo")},
            {exists: By.css("#nothing2")}
          ]
        }]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotSuchElementError")
      })
    }).then(() => {
      // third level
      return checker.run([{
        url: "http://127.0.0.1:8080/"
      },{
        scenario: [{
          url: "http://127.0.0.1:8080/foo.html"
        },{
          checks: [{exists: By.css("#foo")}]
        },{
          scenario: [{
            url: "http://127.0.0.1:8080/form.html"
          },{
            checks: [
              {exists: By.css(".input[name=name]")},
              {exists: By.css("#nothing3")}
            ]
          }]
        }]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotSuchElementError")
      })
    }).then(() => {
      //execif third level
      return checker.run([{
        url: "http://127.0.0.1:8080/"
      },{
        scenario: [{
          url: "http://127.0.0.1:8080/foo.html"
        },{
          checks: [{exists: By.css("#foo")}]
        },{
          scenario: [{
            url: "http://127.0.0.1:8080/form.html"
          },{
            execif: [[{exists: By.css('#home')}]]
          },{
            checks: [
              {exists: By.css("#home")}
            ]
          }]
        }]
      },{
        url: "http://127.0.0.1:8080/"
      },{
        checks: [{exists: By.css("#foo")}]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotSuchElementError")
      })
    })
  })

  test.it('should be able to check HTML attributes.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {equals: 'http://127.0.0.1:8080/foo.html', type: {attr: "href"}, by: By.css(".nav > li:nth-child(2) > a")},
          {equals: 'page-header', type: {attr: "class"}, by: By.css("header")},
          {equals: 'nav nav-pills', type: {attr: "class"}, by: By.css(".nav")},
          {equals: 'nav', type: {attr: "class"}, by: By.css(".nav")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('`nav`') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {likes: '/foo.html', type: {attr: "href"}, by: By.css(".nav > li:nth-child(2) > a")},
          {likes: 'ge-head', type: {attr: "class"}, by: By.css("header")},
          {likes: 'nav-pil', type: {attr: "class"}, by: By.css(".nav")},
          {likes: 'foooo', type: {attr: "class"}, by: By.css(".nav")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('foooo') >= 0)
      })
    })
  })

  test.it('should be able to do a negative check.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notEquals: 'Bar', by: By.css(".nav > li:nth-child(1) > a")},
          {notEquals: 'Bar', by: By.css(".nav > li:nth-child(2) > a")},
          {notEquals: 'http://127.0.0.1:8080/bar.html', type: {attr: "href"}, by: By.css(".nav > li:nth-child(2) > a")},
          {notEquals: 'page-footer', type: {attr: "class"}, by: By.css("header")},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notEquals: 'Home', by: By.css(".nav > li:nth-child(1) > a")}
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Home') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notEquals: 'http://127.0.0.1:8080/foo.html', type: {attr: "href"}, by: By.css(".nav > li:nth-child(2) > a")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('http://127.0.0.1:8080/foo.html') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notLikes: 'Bar', by: By.css(".nav > li:nth-child(1) > a")},
          {notLikes: 'Bar', by: By.css(".nav > li:nth-child(2) > a")},
          {notLikes: 'http://127.0.0.1:8080/bar.html', type: {attr: "href"}, by: By.css(".nav > li:nth-child(2) > a")},
          {notLikes: 'page-footer', type: {attr: "class"}, by: By.css("header")},
          {notLikes: 'foobarfoobar', type: 'html'}
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notLikes: 'Foo', by: By.css(".nav > li:nth-child(2) > a")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Foo') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notLikes: 'page-header', type: {attr: "class"}, by: By.css("header")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('page-header') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notLikes: 'Simple selenium checker', type: 'html'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Simple selenium checker') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notExists: By.css(".not-exists")},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notExists: By.css("body")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "ElementExistsError")
      })
    })
  })

  test.it('should be able to handle checkboxes.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: ['checkbox2'], type: 'checkbox', by: By.css(".checkbox-inline input[name=checkbox]")},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: ['checkbox1', 'checkbox2'], type: 'checkbox', by: By.css(".checkbox-inline input[name=checkbox]")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('checkbox1,checkbox2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
        ]},
        {checks: [
          {equals: [], type: 'checkbox', by: By.css(".checkbox-inline input[name=checkbox]")},
          {unchecked: ['checkbox1'], by: By.css(".checkbox-inline input[name=checkbox]")}
        ]},
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox3']},
        ]},
        {checks: [
          {equals: ['checkbox1', 'checkbox3'], type: 'checkbox', by: By.css(".checkbox-inline input[name=checkbox]")},
          {checked: ['checkbox1'], by: By.css(".checkbox-inline input[name=checkbox]")},
          {checked: ['checkbox3'], by: By.css(".checkbox-inline input[name=checkbox]")}
        ]}
        ,
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox2']},
        ]},
        {checks: [
          {equals: ['checkbox1', 'checkbox2', 'checkbox3'], type: 'checkbox', by: By.css(".checkbox-inline input[name=checkbox]")},
        ]},
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']},
        ]},
        {checks: [
          {equals: ['checkbox1', 'checkbox2', 'checkbox3'], type: 'checkbox', by: By.css(".checkbox-inline input[name=checkbox]")},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
        ]},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']},
        ]},
        {checks: [
          {unchecked: ['checkbox1'], by: By.css(".checkbox-inline input[name=checkbox]")}
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('checkbox1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
        ]},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']},
        ]},
        {checks: [
          {checked: ['checkbox2'], by: By.css(".checkbox-inline input[name=checkbox]")}
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('checkbox2') >= 0)
      })
    })
  })

  test.it('should be able to handle radio buttons.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: 'radio2', type: 'radio', by: By.css(".radio-inline input[name=radio]")},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: 'radio1', type: 'radio', by: By.css(".radio-inline input[name=radio]")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('radio1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {check: By.css(".radio-inline input[name=radio]"), value: 'radio1'},
        ]},
        {checks: [
          {equals: 'radio1', type: 'radio', by: By.css(".radio-inline input[name=radio]")},
        ]},
        {actions: [
          {check: By.css(".radio-inline input[name=radio]"), value: 'radio99'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotSuchElementError")
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {check: By.css(".radio-inline input[name=radio]"), value: 'radio1'},
        ]},
        {checks: [
          {notEquals: 'radio2', type: 'radio', by: By.css(".radio-inline input[name=radio]")},
          {notEquals: 'radio1', type: 'radio', by: By.css(".radio-inline input[name=radio]")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('radio1') >= 0)
      })
    })
  })

  test.it('should be able to handle non multiple select tag.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: 'option1', type: 'select', by: By.css(".select-single")},
          {equals: 'option2', type: 'select', by: By.css(".select-single")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {select: By.css(".select-single"), value: 'option3'},
        ]},
        {checks: [
          {equals: 'option3', type: 'select', by: By.css(".select-single")},
          {equals: 'option2', type: 'select', by: By.css(".select-single")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {selected: ['option1'], by: By.css(".select-single")},
          {selected: ['option2'], by: By.css(".select-single")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option2') >= 0)
      })
    })
    .then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {unselected: ['option2'], by: By.css(".select-single")},
          {unselected: ['option3'], by: By.css(".select-single")},
          {unselected: ['option1'], by: By.css(".select-single")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option1') >= 0)
      })
    })
  })

  test.it('should be able to handle multiple select tag.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: ['option2', 'option3'], type: 'select', by: By.css(".select-multiple")},
          {equals: ['option1'], type: 'select', by: By.css(".select-multiple")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {selected: ['option2'], by: By.css(".select-multiple")},
          {selected: ['option3'], by: By.css(".select-multiple")},
          {selected: ['option1'], by: By.css(".select-multiple")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".select-multiple"), type: 'select'},
          {select: By.css(".select-multiple"), values: ['option2']},
        ]},
        {checks: [
          {unselected: ['option1'], by: By.css(".select-multiple")},
          {unselected: ['option3'], by: By.css(".select-multiple")},
          {unselected: ['option2'], by: By.css(".select-multiple")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".select-multiple"), type: 'select'},
        ]},
        {checks: [
          {equals: [], type: 'select', by: By.css(".select-multiple")},
        ]},
        {actions: [
          {select: By.css(".select-multiple"), values: ['option1', 'option3']},
        ]},
        {checks: [
          {equals: ['option1', 'option3'], type: 'select', by: By.css(".select-multiple")},
        ]},
        {actions: [
          {select: By.css(".select-multiple"), values: ['option2', 'option3']},
        ]},
        {checks: [
          {equals: ['option1', 'option2', 'option3'], type: 'select', by: By.css(".select-multiple")},
        ]},
        {actions: [
          {unselect: By.css(".select-multiple"), values: ['option3']},
        ]},
        {checks: [
          {equals: ['option1', 'option2'], type: 'select', by: By.css(".select-multiple")},
        ]},
        {actions: [
          {unselect: By.css(".select-multiple"), values: ['option3']},
        ]},
        {checks: [
          {equals: ['option1', 'option2'], type: 'select', by: By.css(".select-multiple")},
        ]},
        {actions: [
          {unselect: By.css(".select-multiple"), values: ['option1', 'option2']},
        ]},
        {checks: [
          {equals: [], type: 'select', by: By.css(".select-multiple")},
        ]},
      ])
    })
  })

  test.it('should be able to handle alert and confirm.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
       return checker.run([
        {url: "http://127.0.0.1:8080/alert.html"},
        {actions: [
          {click: By.css("#alert")},
          {alert: "accept", timeout: 3000}
        ]},
        {checks: [
          {equals: "Alert", by: By.css("#display"), timeout: 3000},
        ]},
       ])
    }).then(() => {
       return checker.run([
        {url: "http://127.0.0.1:8080/alert.html"},
        {actions: [
          {click: By.css("#confirm")},
          {alert: "accept", timeout: 3000}
        ]},
        {checks: [
          {equals: "Confirm OK", by: By.css("#display"), timeout: 3000},
        ]},
       ])
    }).then(() => {
       return checker.run([
        {url: "http://127.0.0.1:8080/alert.html"},
        {actions: [
          {click: By.css("#confirm")},
          {alert: "dismiss", timeout: 3000}
        ]},
        {checks: [
          {equals: "Confirm Cancel", by: By.css("#display"), timeout: 3000},
        ]},
       ])
    })
  })

  test.it('should be able to handle frame.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/frame.html"},
        {actions: [
          {switchTo: By.css("#index_frame")},
        ]},
        {checks: [
          {equals: "Home", by: By.css("h2")},
          {equals: "FooBar", by: By.css("h2")},
        ]},
       ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf("FooBar") >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/frame.html"},
        {actions: [
          {switchTo: By.css("#index_frame")},
        ]},
        {checks: [
          {equals: "Home", by: By.css("h2")},
        ]},
        {actions: [
          {switchTo: 'default'},
        ]},
        {checks: [
          {equals: "Frame", by: By.css("h2")},
          {equals: "FooBar", by: By.css("h2")},
        ]},
       ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf("FooBar") >= 0)
      })
    })
  })
})
