import webdriver from 'selenium-webdriver';
const By = webdriver.By;
const Promise = webdriver.promise;

export function exists(checker, check){
  return checker.waitElement(check.exists, check.timeout)
}

export function notExists(checker, check){
  return checker.waitDissapearElement(check.notExists, check.timeout)
}

function deletectType(checker, check){
  let promise
  let message;
  if(check.type === undefined && check.by){
    message = "Text in " + check.by
    promise = checker.waitElement(check.by, check.timeout)
      .then(elem => elem.getText())
  } else if(check.type === undefined){
    message = "Response body"
    promise = checker.driver.findElement(By.css('html'))
      .then(elem => elem.getAttribute('outerHTML'))
  } else if(check.type == 'checkbox'){
    message = "Checkbox " + check.by
    promise = checker.waitElements(check.by, check.count, check.timeout)
      .then(elems => Promise.map(elems, elem => elem.isSelected().then(selected => {
        return {elem: elem, selected: selected}
      })))
      .then(composits => composits.filter(composit => composit.selected).map(composit => composit.elem))
      .then(elems => Promise.map(elems, elem => elem.getAttribute("value")))
  } else if(check.type == 'url'){
    message = "Url"
    promise = checker.driver.getCurrentUrl()
  } else if(check.type.hasOwnProperty('attr')) {
    message = check.type.attr + " of " + check.by
    promise = checker.waitElement(check.by, check.timeout)
      .then(elem => elem.getAttribute(check.type.attr))
  } else {
    throw new Error('Illegal checker directive type ' + JSON.stringify(check))
  }

  return {promise, message}
}

function buildActualMessage(check, message, actual){
  //for response body text
  if(check.type === undefined && check.by === undefined){
    message += '.'
  } else {
    message += ' actual `' + actual + '`.'
  }

  return message
}

export function likes(checker, check){
  const type = deletectType(checker, check)

  return type.promise.then(text => {
    if(text.indexOf(check.likes) === -1){
      let message = type.message + ' dose not contain `' + check.likes + '`'
      throw new Error(buildActualMessage(check, message, text))
    }
  })
}

export function equals(checker, check){
  const type = deletectType(checker, check)

  return type.promise.then(text => {
    if(text !== check.equals){
      let message = type.message + ' is not `' + check.equals + '`'
      throw new Error(buildActualMessage(check, message, text))
    }
  })
}

export function notEquals(checker, check){
  const type = deletectType(checker, check)

  return type.promise.then(text => {
    if(text === check.notEquals){
      throw new Error(type.message + ' is `' + check.notEquals + '`.')
    }
  })
}

export function notLikes(checker, check){
  const type = deletectType(checker, check)

  return type.promise.then(text => {
    if(text.indexOf(check.notLikes) >= 0){
      throw new Error(type.message + ' contains `' + check.notLikes + '`.')
    }
  })
}
