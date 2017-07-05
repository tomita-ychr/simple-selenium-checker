import webdriver from 'selenium-webdriver';
import util from 'util';
const By = webdriver.By;

function createPromise(checker, check){
  if(check.type === undefined){
    return checker.waitElement(check.by, check.timeout)
      .then(elem => elem.getText())
  } else if(check.type === 'html'){
    return checker.driver.findElement(By.css('html'))
      .then(elem => elem.getAttribute('outerHTML'))
  } else if(check.type == 'checkbox' || check.type == 'radio'){
    return checker.waitElements(check.by, check.count, check.timeout)
      .then(elems => checker.assembleFromElements(
        elems, {
          value: elem => elem.getAttribute('value'),
          selected: elem => elem.isSelected()
      }))
      .then(composits => composits.filter(composit => composit.selected).map(composit => composit.value))
  } else if(check.type == 'select'){
    return checker.waitElement(check.by, check.timeout)
      .then(elem => checker.waitElementsIn(elem, By.css("option")))
      .then(elems => checker.assembleFromElements(
        elems, {
          value: elem => elem.getAttribute('value'),
          isSelected: elem => elem.isSelected()
      }))
      .then(composits => composits.filter(composit => composit.isSelected).map(composit => composit.value))
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
  } else if(check.type == 'checkbox' || check.type == 'radio'){
    return util.format("%s %s %s `%s`%s.", check.type, check.by, predicate, expect, actual ? util.format(' actual `%s`', actual) : '')
  } else if(check.type == 'url'){
    return util.format("Url %s `%s`%s.", predicate, expect, actual ? util.format(' actual `%s`', actual) : '')
  } else if(check.type.hasOwnProperty('attr')) {
    return util.format("%s of %s %s `%s`%s.", check.type.attr, check.by, predicate, expect, actual ? util.format(' actual `%s`', actual) : '')
  } else if(check.type === 'select'){
    return util.format("select %s %s `%s`%s.", check.by, predicate, expect, actual ? util.format(' actual `%s`', actual) : '')
  } else {
    throw new Error('Illegal checker directive type ' + JSON.stringify(check))
  }
}

function compareArray(array1, array2){
  return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort())
}

export function exists(checker, check){
  return checker.waitElements(check.exists, check.count, check.timeout)
}

export function notExists(checker, check){
  return checker.waitDissapearElements(check.notExists, check.timeout)
}

export function likes(checker, check){
  return createPromise(checker, check).then(text => {
    if(text.indexOf(check.likes) === -1){
      throw new Error(createErrorMessage(check, 'dose not contain', check.likes, text))
    }
  })
}


export function equals(checker, check){
  if(Array.isArray(check.equals)){
    return createPromise(checker, check).then(values => {
      // const expects = Array.isArray(check.equals) ? check.equals : [check.equals]
      if(!compareArray(values, check.equals)){
        throw new Error(createErrorMessage(check, 'is not', check.equals, values))
      }
    })
  } else {
    return createPromise(checker, check).then(text => {
      if(Array.isArray(text)){
        if(text.length > 1) throw new Error(util.format("%s has multiple values `%s`"), check.by, text)
        text = text[0]
      }
      if(text !== check.equals){
        throw new Error(createErrorMessage(check, 'is not', check.equals, text))
      }
    })
  }
}

export function unchecked(checker, check){
  //unchecked use only for checkbox. use equals for radio.
  check = Object.assign(check, {type: 'checkbox'})
  return createPromise(checker, check).then(values => {
    check.unchecked.forEach(uncheckedValue => {
      if(values.indexOf(uncheckedValue) >= 0){
        throw new Error(createErrorMessage(check, 'is checked', check.unchecked))
      }
    })
  })
}

export function checked(checker, check){
  //checked use only for checkbox. use equals for radio.
  check = Object.assign(check, {type: 'checkbox'})
  return createPromise(checker, check).then(values => {
    check.checked.forEach(checkedValue => {
      if(values.indexOf(checkedValue) === -1){
        throw new Error(createErrorMessage(check, 'is not checked', check.checked, values))
      }
    })
  })
}

export function notEquals(checker, check){
  return createPromise(checker, check).then(text => {
    if(text === check.notEquals){
      throw new Error(createErrorMessage(check, 'is', check.notEquals))
    }
  })
}

export function notLikes(checker, check){
  return createPromise(checker, check).then(text => {
    if(text.indexOf(check.notLikes) >= 0){
      throw new Error(createErrorMessage(check, 'contains', check.notLikes))
    }
  })
}
