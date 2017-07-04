import webdriver from 'selenium-webdriver';
import util from 'util';
const By = webdriver.By;
const Promise = webdriver.promise;

export function exists(checker, check){
  return checker.waitElement(check.exists, check.timeout)
}

export function notExists(checker, check){
  return checker.waitDissapearElements(check.notExists, check.timeout)
}

function createPromise(checker, check){
  if(check.type === undefined){
    return checker.waitElement(check.by, check.timeout)
      .then(elem => elem.getText())
  } else if(check.type === 'html'){
    return checker.driver.findElement(By.css('html'))
      .then(elem => elem.getAttribute('outerHTML'))
  } else if(check.type == 'checkbox'){
    return checker.waitElements(check.by, check.count, check.timeout)
      .then(elems => Promise.map(elems, elem => elem.isSelected().then(selected => {
        return {elem: elem, selected: selected}
      })))
      .then(composits => composits.filter(composit => composit.selected).map(composit => composit.elem))
      .then(elems => Promise.map(elems, elem => elem.getAttribute("value")))
  } else if(check.type == 'url'){
    return checker.driver.getCurrentUrl()
  } else if(check.type.hasOwnProperty('attr')) {
    return checker.waitElement(check.by, check.timeout)
      .then(elem => elem.getAttribute(check.type.attr))
  } else {
    throw new Error('Illegal checker directive type ' + JSON.stringify(check))
  }
}

function createErrorMessage(check, predicate, expect, actual){
  if(check.type === undefined){
    return util.format("Text in %s %s `%s`%s.", check.by, predicate, expect, actual ? util.format(' actual `%s`', actual) : '')
  } else if(check.type === 'html'){
    return util.format("Response body %s `%s`.", predicate, expect)
  } else if(check.type == 'checkbox'){
    return util.format("Checkbox %s %s `%s`%s.", check.by, predicate, expect, actual ? util.format(' actual `%s`', actual) : '')
  } else if(check.type == 'url'){
    return util.format("Url %s `%s`%s.", predicate, expect, actual ? util.format(' actual `%s`', actual) : '')
  } else if(check.type.hasOwnProperty('attr')) {
    return util.format("%s of %s %s `%s`%s.", check.type.attr, check.by, predicate, expect, actual ? util.format(' actual `%s`', actual) : '')
  } else {
    throw new Error('Illegal checker directive type ' + JSON.stringify(check))
  }
}

export function likes(checker, check){
  const promise = createPromise(checker, check)

  return promise.then(text => {
    if(text.indexOf(check.likes) === -1){
      throw new Error(createErrorMessage(check, 'dose not contain', check.likes, text))
    }
  })
}

export function equals(checker, check){
  const promise = createPromise(checker, check)

  return promise.then(text => {
    if(text !== check.equals){
      throw new Error(createErrorMessage(check, 'is not', check.equals, text))
    }
  })
}

export function notEquals(checker, check){
  const promise = createPromise(checker, check)

  return promise.then(text => {
    if(text === check.notEquals){
      throw new Error(createErrorMessage(check, 'is', check.notEquals))
    }
  })
}

export function notLikes(checker, check){
  const promise = createPromise(checker, check)

  return promise.then(text => {
    if(text.indexOf(check.notLikes) >= 0){
      throw new Error(createErrorMessage(check, 'contains', check.notLikes))
    }
  })
}
