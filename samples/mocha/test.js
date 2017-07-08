import webdriver from 'selenium-webdriver'
import test from 'selenium-webdriver/testing'
import {Checker, placeholder} from '../../dist/'
import glob from 'glob'
const By = webdriver.By;

let driver;
const files = glob.sync('./samples/mocha/scenarios/**/*.js', null)
test.describe(files.length + ' files found.', () => {
  test.before(() => {
    const chromeCapabilities = webdriver.Capabilities.chrome();
    const chromeOptions = {
      args: ["--window-size=1024,768", '--headless', '--disable-gpu']
    }

    chromeCapabilities.set('chromeOptions', chromeOptions);

    driver = new webdriver.Builder()
      .usingServer('http://localhost:4444/wd/hub')
      .withCapabilities(chromeCapabilities)
      .build()
  })

  test.after(() => {
    driver.quit()
  })

  files.forEach(file => {
    const scenarios = require("../../" + file)

    scenarios.forEach(item => {
      test.it(file + ' - ' + item.title, () => {
        const checker = new Checker(driver)
        return checker.run(item.scenario)
      })
    })
  })
})
