import webdriver from 'selenium-webdriver';
const By = webdriver.By;

export function loc(checker, check){
  return checker.waitElement(check.loc).then(elem => {
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
}

export function text(checker, check){
  return checker.driver.findElement(By.css('html'))
    .then(elem => elem.getAttribute('outerHTML'))
    .then(html => {
      if(html.indexOf(check.text) === -1) throw new Error("Missing text `" + check.text + "`")
    })
}

export function url(checker, check){
  return checker.driver.getCurrentUrl().then(url => {
    if(url.indexOf(check.url) === -1){
      throw new Error('The specified URL was not included in the actual URL')
    }
  })
}
