import webdriver from 'selenium-webdriver'
import test from 'selenium-webdriver/testing'
import assert from 'power-assert'

let driver;
test.describe('Test', () => {
  test.before(() => {
    const chromeCapabilities = webdriver.Capabilities.chrome();
    chromeCapabilities.set('chromeOptions', {
      'args': ['--headless']
    });
    driver = new webdriver.Builder()
      .usingServer('http://localhost:4444/wd/hub')
      .withCapabilities(chromeCapabilities)
      .build();

    driver.get('http://www.google.com/');
  });

  test.after(() => {
    driver.quit();
  });

  test.it('foo bar.', () => {
    // assert('hoge' == 'fuge')
  })
})
