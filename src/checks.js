import webdriver from 'selenium-webdriver';
import util from 'util';
const By = webdriver.By;

function createPromise(checker, check){
  if(check.locator){
    return checker.waitElements(check.locator, check.count, check.timeout)
      .then(elems => checker.assembleFromElements(elems, {
        tag_name: elem => elem.getTagName(),
        type: elem => elem.getAttribute('type'),
        value: elem => elem.getAttribute('value'),
        multiple: elem => elem.getAttribute('multiple'),
        selected: elem => elem.isSelected(),
        inner_text: elem => elem.getText(),
        attr: elem => check.type && check.type.hasOwnProperty('attr') ? elem.getAttribute(check.type.attr) : Promise.resolve(false)
      }))
      .then(composits => {
        if(composits[0].tag_name == 'select'){
          return checker.waitElementsIn(composits[0].elem, By.css('option'), check.count, check.timeout)
            .then(elems => checker.assembleFromElements(elems, {
              value: elem => elem.getAttribute('value'),
              selected: elem => elem.isSelected()
            }))
            .then(sComposits => sComposits.filter(sComposit => sComposit.selected))
            .then(sComposits => sComposits.map(sComposit => sComposit.value))
        } else if(composits[0].attr !== false) {
          return composits.map(composit => composit.attr)
        } else if(composits[0].type == "checkbox" || composits[0].type == "radio"){
          return composits.filter(composit => composit.selected).map(composit => composit.value)
        } else if(composits[0].tag_name == "input"){
          return composits.map(composit => composit.value)
        } else {
          return composits.map(composit => composit.inner_text)
        }
      })
  } else if(check.type == 'html') {
    return checker.driver.findElement(By.css('html'))
      .then(elem => elem.getAttribute('outerHTML'))
      .then(html => [html])
  } else if(check.type == 'url') {
    return checker.driver.getCurrentUrl().then(url => [url])
  } else {
    throw Error("Illegal directive is specified " + JSON.stringify(check) + '.')
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

function compareArray(array1, array2){
  return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort())
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
  return checker.waitFor(
    createErrorMessage(check, 'contains'), 
    () => createPromise(checker, check).then(values => {
      if(check.values !== undefined) throw new Error('`likes` can only value.')
      if(values.length > 1) throw new Error('Multiple values were detected `' + values + '`.')
      return values[0].indexOf(check.value) >= 0
    }),
    check.timeout
  )
}

export function equals(checker, check){
  check = normalizeDirective(check, 'equals')
  return checker.waitFor(
    createErrorMessage(check, 'is'), 
    () => createPromise(checker, check).then(values => {
      if(check.hasOwnProperty('values')){
        return compareArray(values, check.values)
      } else if(check.hasOwnProperty('value')) {
        return values[0] === check.value
      } else {
        throw new Error("Missing value or values.")
      }
    }),
    check.timeout
  )
}

export function unchecked(checker, check){
  check = normalizeDirective(check, 'unchecked', 'checkbox')
  return checker.waitFor(
    createErrorMessage(check, 'dose not contain'), 
    () => createPromise(checker, check).then(values => {
      if(check.value === undefined && check.values === undefined) throw new Error("Missing value or values.")
      const expectedList = check.values ? check.values : [check.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(values.indexOf(expected) >= 0) return false
      }

      return true
    }),
    check.timeout
  )
}

export function checked(checker, check){
  check = normalizeDirective(check, 'checked', 'checkbox')
  return checker.waitFor(
    createErrorMessage(check, 'contains'), 
    () => createPromise(checker, check).then(values => {
      if(check.value === undefined && check.values === undefined) throw new Error("Missing value or values.")
      const expectedList = check.values ? check.values : [check.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(values.indexOf(expected) === -1) return false
      }

      return true
    }),
    check.timeout
  )
}

export function selected(checker, check){
  check = normalizeDirective(check, 'selected', 'select')
  return checker.waitFor(
    createErrorMessage(check, 'contains'), 
    () => createPromise(checker, check).then(values => {
      if(check.value === undefined && check.values === undefined) throw new Error("Missing value or values.")
      const expectedList = check.values ? check.values : [check.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(values.indexOf(expected) === -1) return false
      }

      return true
    }),
    check.timeout
  )
}

export function unselected(checker, check){
  check = normalizeDirective(check, 'unselected', 'select')
  return checker.waitFor(
    createErrorMessage(check, 'dose not contain'), 
    () => createPromise(checker, check).then(values => {
      if(check.value === undefined && check.values === undefined) throw new Error("Missing value or values.")
      const expectedList = check.values ? check.values : [check.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(values.indexOf(expected) >= 0) return false
      }

      return true
    }),
    check.timeout
  )
}

export function notEquals(checker, check){
  check = normalizeDirective(check, 'notEquals')
  return checker.waitFor(
    createErrorMessage(check, 'is not'), 
    () => createPromise(checker, check).then(values => {
      if(check.values){
        return !compareArray(values, check.values)
      } else if(check.value) {
        return values[0] !== check.value
      } else {
        throw new Error("Missing value or values.")
      }
    }),
    check.timeout
  )
}

export function notLikes(checker, check){
  check = normalizeDirective(check, 'notLikes')
    return checker.waitFor(
    createErrorMessage(check, 'dose not contains'), 
    () => createPromise(checker, check).then(values => {
      if(check.values !== undefined) throw new Error('`likes` can only value.')
      if(values.length > 1) throw new Error('Multiple values were detected `' + values + '`.')
      return values[0].indexOf(check.value) === -1
    }),
    check.timeout
  )
}
