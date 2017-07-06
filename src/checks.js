import webdriver from 'selenium-webdriver';
import util from 'util';
const By = webdriver.By;

function createPromise(checker, check){
  if(check.type === undefined){
    return checker.waitElement(check.locator, check.timeout)
      .then(elem => elem.getText())
  } else if(check.type === 'html'){
    return checker.driver.findElement(By.css('html'))
      .then(elem => elem.getAttribute('outerHTML'))
  } else if(check.type == 'checkbox' || check.type == 'radio'){
    return checker.waitElements(check.locator, check.count, check.timeout)
      .then(elems => checker.assembleFromElements(
        elems, {
          value: elem => elem.getAttribute('value'),
          selected: elem => elem.isSelected()
      }))
      .then(composits => composits.filter(composit => composit.selected).map(composit => composit.value))
  } else if(check.type == 'select'){
    return checker.waitElement(check.locator, check.timeout)
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
    return checker.waitElement(check.locator, check.timeout)
      .then(elem => elem.getAttribute(check.type.attr))
  } else {
    throw new Error('Illegal checker directive type ' + JSON.stringify(check))
  }
}

function createErrorMessage(check, predicate){
  if(check.type === undefined){
    return util.format("Text in %s %s `%s`.", check.locator, predicate, check.value||check.values)
  } else if(check.type === 'html'){
    return util.format("Response body %s `%s`.", predicate, check.value||check.values)
  } else if(check.type == 'checkbox' || check.type == 'radio'){
    return util.format("%s[%s] %s `%s`.", check.locator, check.type, predicate, check.value||check.values)
  } else if(check.type == 'url'){
    return util.format("Url %s `%s`.", predicate, check.value||check.values)
  } else if(check.type.hasOwnProperty('attr')) {
    return util.format("%s of %s %s `%s`.", check.type.attr, check.locator, predicate, check.value||check.values)
  } else if(check.type === 'select'){
    return util.format("%s[select] %s `%s`.", check.locator, predicate, check.value||check.values)
  } else {
    throw new Error('Illegal checker directive type ' + JSON.stringify(check))
  }
}

function compareArray(array1, array2){
  return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort())
}

function normalizeDirective(check, name, forceType){
  check = Object.assign({}, check)


  if(forceType !== undefined){
    check.type = forceType
  }

  if(typeof check[name] == 'string'){
    if(check.type !== undefined){
      throw new Error('When target is string, type must be undefined.')
    }
    check.type = check[name]
  }
  else
  {
    check.locator = check[name]
  }

  return check
}

export function exists(checker, check){
  check = normalizeDirective(check, 'exists')
  return checker.waitElements(check.exists, check.count, check.timeout)
}

export function notExists(checker, check){
  check = normalizeDirective(check, 'notExists')
  return checker.waitDissapearElements(check.notExists, check.timeout)
}

export function likes(checker, check){
  check = normalizeDirective(check, 'likes')
  return checker.waitFor(createErrorMessage(check, 'dose not contain'), () => {
    return createPromise(checker, check).then(text => text.indexOf(check.value) >= 0)
  }, check.timeout)
}


export function equals(checker, check){
  check = normalizeDirective(check, 'equals')
  if(check.values){
    return checker.waitFor(createErrorMessage(check, 'is'), () => {
      return createPromise(checker, check).then(values => compareArray(values, check.values))
    }, check.timeout)
  } else {
    return checker.waitFor(createErrorMessage(check, 'is'), () => {
      return createPromise(checker, check).then(text => {
        if(Array.isArray(text)){
          if(text.length > 1) throw new Error(util.format("%s has multiple values `%s`"), check.by, text)
          text = text[0]
        }
        return text === check.value
      })
    }, check.timeout)
  }
}

export function unchecked(checker, check){
  check = normalizeDirective(check, 'unchecked', 'checkbox')
  return checker.waitFor(createErrorMessage(check, 'is not checked'), () => {
    return createPromise(checker, check).then(values => {
      check.values.forEach(uncheckedValue => {
        if(values.indexOf(uncheckedValue) >= 0){
          return false
        }
      })
      return true
    })
  }, check.timeout)
}

export function checked(checker, check){
  check = normalizeDirective(check, 'checked', 'checkbox')
  return checker.waitFor(createErrorMessage(check, 'is not checked'), () => {
    return createPromise(checker, check).then(values => {
      check.values.forEach(checkedValue => {
        if(values.indexOf(checkedValue) === -1){
          return false
        }
      })

      return true
    })
  }, check.timeout)
}

export function selected(checker, check){
  check = normalizeDirective(check, 'selected', 'select')
  const expectedList = check.values || [check.value]
  return checker.waitFor(createErrorMessage(check, 'select'), () => {
    return createPromise(checker, check).then(values => {
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(values.indexOf(expected) >= 0){
          return true
        }
      }

      return false
    })
  }, check.timeout)
}

export function unselected(checker, check){
  check = normalizeDirective(check, 'unselected', 'select')
  const expectedList = check.values || [check.value]
  return checker.waitFor(createErrorMessage(check, 'dose not select'), () => {
    return createPromise(checker, check).then(values => {
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(values.indexOf(expected) >= 0){
          return false
        }
      }

      return true
    })
  }, check.timeout)
}

export function notEquals(checker, check){
  check = normalizeDirective(check, 'notEquals')
  return checker.waitFor(createErrorMessage(check, 'is not'), () => {
    return createPromise(checker, check).then(text => text !== check.value)
  }, check.timeout) 
}

export function notLikes(checker, check){
  check = normalizeDirective(check, 'notLikes')
  return checker.waitFor(createErrorMessage(check, 'dose not contains'), () => {
    return createPromise(checker, check).then(text => text.indexOf(check.value) === -1)
  }, check.timeout)
}
