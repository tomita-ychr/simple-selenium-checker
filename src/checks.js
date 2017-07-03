import webdriver from 'selenium-webdriver';
const By = webdriver.By;

export function exists(checker, check){
  return checker.waitElement(check.exists, check.timeout)
}

export function notExists(checker, check){
  return checker.waitDissapearElement(check.notExists, check.timeout)
}

export function likes(checker, check){
  if(check.by){
    return checker.waitElement(check.by, check.timeout)
      .then(elem => {
        if(check.attr){
          return elem.getAttribute(check.attr)
        } else {
          return elem.getText()
        }
      })
      .then(text => {
        if(text.indexOf(check.likes) === -1){
          const target = check.attr ? check.attr + ' of ' : 'Text in '
          throw new Error(target + check.by.toString() + ' dose not like `' + check.likes + '` actual `' + text + '`')
        }
      })
  } else {
    return checker.driver.findElement(By.css('html'))
      .then(elem => elem.getAttribute('outerHTML'))
      .then(html => {
        if(html.indexOf(check.likes) === -1) throw new Error("Missing text `" + check.likes + "`")
      })
  }
}

export function equals(checker, check){
  return checker.waitElement(check.by, check.timeout)
    .then(elem => {
      if(check.attr){
        return elem.getAttribute(check.attr)
      } else {
        return elem.getText()
      }
    })
    .then(text => {
      if(text !== check.equals){
        const target = check.attr ? check.attr + ' of ' : 'Text in '
        throw new Error(target + check.by.toString() + ' is not `' + check.equals + '` actual `' + text + '`')
      }
    })
}

export function notEquals(checker, check){
  return checker.waitElement(check.by, check.timeout)
    .then(elem => {
      if(check.attr){
        return elem.getAttribute(check.attr)
      } else {
        return elem.getText()
      }
    })
    .then(text => {
      if(text === check.notEquals){
        const target = check.attr ? check.attr + ' of ' : 'Text in '
        throw new Error(target + check.by.toString() + ' is `' + check.notEquals + '`.')
      }
    })
}

export function notLikes(checker, check){
  if(check.by){
    return checker.waitElement(check.by, check.timeout)
      .then(elem => {
        if(check.attr){
          return elem.getAttribute(check.attr)
        } else {
          return elem.getText()
        }
      })
      .then(text => {
        if(text.indexOf(check.notLikes) >= 0){
          const target = check.attr ? check.attr + ' of ' : 'Text in '
          throw new Error(target + check.by.toString() + ' contains `' + check.notLikes + '`.')
        }
      })
  } else {
    return checker.driver.findElement(By.css('html'))
      .then(elem => elem.getAttribute('outerHTML'))
      .then(html => {
        if(html.indexOf(check.notLikes) >= 0) throw new Error("The response contains `" + check.notLikes + "`.")
      })
  }
}

export function url(checker, check){
  return checker.driver.getCurrentUrl().then(url => {
    if(url.indexOf(check.url) === -1){
      throw new Error('The specified URL was not included in the actual URL')
    }
  })
}
