import webdriver from 'selenium-webdriver';
import util from 'util';
import * as errors from './errors'
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
            .then(sComposits => ({
              values: sComposits.map(sComposit => sComposit.value),
              type: 'select value'
            }))
        } else if(composits[0].attr !== false) {
          return {
            values: composits.map(composit => composit.attr),
            type: check.type.attr + ' attribute'
          }
        } else if(composits[0].type == "checkbox" || composits[0].type == "radio"){
          return {
            values: composits.filter(composit => composit.selected).map(composit => composit.value),
            type: composits[0].type + ' value'
          }
        } else if(composits[0].tag_name == "input"){
          return {
            values: composits.map(composit => composit.value),
            type: 'input value'
          }
        } else {
          return {
            values: composits.map(composit => composit.inner_text),
            type: 'inner text'
          }
        }
      })
  } else if(check.type == 'html') {
    return checker.driver.findElement(By.css('html'))
      .then(elem => elem.getAttribute('outerHTML'))
      .then(html => ({
        values: [html],
        type: check.type,
      }))
  } else if(check.type == 'url') {
    return checker.driver.getCurrentUrl().then(url => ({
      values: [url],
      type: check.type,
    }))
  } else {
    throw Error("Illegal directive is specified " + JSON.stringify(check) + '.')
  }
}

function normalizeDirective(check, name){
  check = Object.assign({}, check)

  check.name = name

  if(check.hasOwnProperty('type')){
    throw Error("`type` key is not supported " + JSON.stringify(check) + '.')
  }

  if(typeof check[name] == 'string'){
    check.type = check[name]
  } else {
    check.locator = check[name]
  }

  //attr
  const attr_keys = Object.keys(check).filter(key => key.indexOf('attr_') === 0)
  if(attr_keys.length > 1) throw new Error("2 or more attr_ key found " + JSON.stringify(check) + '.')
  if(attr_keys.length > 0){
    check.type = {attr: attr_keys[0].substr('attr_'.length)}
    check.value = check[attr_keys[0]]
  } else if(['exists', 'notExists'].indexOf(check.name) === -1){
    if(!check.hasOwnProperty('value') && !check.hasOwnProperty('values')){
      throw new Error("Require value or values key " + JSON.stringify(check) + '.')
    }
  }

  return check
}

function compareArray(array1, array2){
  return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort())
}

export function exists(checker, check){
  check = normalizeDirective(check, 'exists')
  return checker.waitElements(check.exists, check.count, check.timeout)
    .catch(err => {
      if(err.name == 'TimeoutError'){
        throw new errors.NotSuchElementError(util.format("%s: %s", check.name, check.locator), err)
      }
      throw err
    })
}

export function notExists(checker, check){
  check = normalizeDirective(check, 'notExists')
  return checker.waitDissapearElements(check.notExists, check.timeout)
    .catch(err => {
      if(err.name == 'TimeoutError'){
        throw new errors.ExistsError(util.format("%s: %s", check.name, check.locator), err)
      }
      throw err
    })
}

export function likes(checker, check){
  check = normalizeDirective(check, 'likes')
  return checker.waitForValueCheck(
    check,
    () => createPromise(checker, check).then(data => {
      check.actual_values = data.values
      check.type = data.type
      if(check.values !== undefined) throw new Error('`likes` can only value.')
      if(data.values.length > 1) throw new Error('Multiple values were detected `' + data.values + '`.')
      return data.values[0].indexOf(check.value) >= 0
    })
  )
}

export function equals(checker, check){
  check = normalizeDirective(check, 'equals')
  return checker.waitForValueCheck(
    check,
    () => createPromise(checker, check).then(data => {
      check.type = data.type
      check.actual_values = data.values
      if(check.hasOwnProperty('values')){
        return compareArray(data.values, check.values)
      } else if(check.hasOwnProperty('value')) {
        return data.values[0] === check.value
      }
    })
  )
}

export function unchecked(checker, check){
  check = normalizeDirective(check, 'unchecked')
  return checker.waitForValueCheck(
    check,
    () => createPromise(checker, check).then(data => {
      check.type = data.type
      check.actual_values = data.values
      if(check.value === undefined && check.values === undefined) throw new Error("Missing value or values.")
      const expectedList = check.values ? check.values : [check.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(data.values.indexOf(expected) >= 0) return false
      }

      return true
    })
  )
}

export function checked(checker, check){
  check = normalizeDirective(check, 'checked')
  return checker.waitForValueCheck(
    check,
    () => createPromise(checker, check).then(data => {
      check.actual_values = data.values
      check.type = data.type
      if(check.value === undefined && check.values === undefined) throw new Error("Missing value or values.")
      const expectedList = check.values ? check.values : [check.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(data.values.indexOf(expected) === -1) return false
      }

      return true
    })
  )
}

export function selected(checker, check){
  check = normalizeDirective(check, 'selected')
  return checker.waitForValueCheck(
    check,
    () => createPromise(checker, check).then(data => {
      check.actual_values = data.values
      check.type = data.type
      if(check.value === undefined && check.values === undefined) throw new Error("Missing value or values.")
      const expectedList = check.values ? check.values : [check.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(data.values.indexOf(expected) === -1) return false
      }

      return true
    })
  )
}

export function unselected(checker, check){
  check = normalizeDirective(check, 'unselected')
  return checker.waitForValueCheck(
    check,
    () => createPromise(checker, check).then(data => {
      check.actual_values = data.values
      check.type = data.type
      if(check.value === undefined && check.values === undefined) throw new Error("Missing value or values.")
      const expectedList = check.values ? check.values : [check.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(data.values.indexOf(expected) >= 0) return false
      }

      return true
    })
  )
}

export function notEquals(checker, check){
  check = normalizeDirective(check, 'notEquals')
  return checker.waitForValueCheck(
    check,
    () => createPromise(checker, check).then(data => {
      check.actual_values = data.values
      check.type = data.type
      if(check.values){
        return !compareArray(data.values, check.values)
      } else if(check.value) {
        return data.values[0] !== check.value
      }
    })
  )
}

export function notLikes(checker, check){
  check = normalizeDirective(check, 'notLikes')
    return checker.waitForValueCheck(
    check,
    () => createPromise(checker, check).then(data => {
      check.type = data.type
      check.actual_values = data.values
      if(check.values !== undefined) throw new Error('`likes` can only value.')
      if(data.values.length > 1) throw new Error('Multiple values were detected `' + data.values + '`.')
      return data.values[0].indexOf(check.value) === -1
    })
  )
}
