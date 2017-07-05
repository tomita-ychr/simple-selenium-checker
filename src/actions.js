import webdriver from 'selenium-webdriver';
import util from 'util';
const By = webdriver.By;
const Promise = webdriver.promise;

export function click(checker, action){
  return checker.waitElement(action.click, action.timeout).then(elem => {
    return elem.click()
  })
}

export function sendKeys(checker, action){
  return checker.waitElement(action.sendKeys, action.timeout).then(elem => {
    return elem.sendKeys(action.value)
  })
}

export function check(checker, action){
  if(action.hasOwnProperty('values')){//checkbox
    return checker.waitElements(action.check, action.count, action.timeout)
      .then(elems => Promise.map(
        elems, 
        elem => elem.getAttribute('value').then(value => ({elem: elem, value: value})))
      )
      .then(composits => Promise.map(
        composits,
        composit => composit.elem.isSelected().then(isSelected => ({elem: composit.elem, value: composit.value, isSelected: isSelected})))
      )
      .then(composits => composits.filter(composit => !composit.isSelected && action.values.indexOf(composit.value) >= 0))
      .then(composits => Promise.map(
        composits,
        composit => composit.elem.click())
      )
  } else if(action.hasOwnProperty('value')){//radio
    return checker.waitElements(action.check, action.count, action.timeout)
      .then(elems => Promise.map(
        elems, 
        elem => elem.getAttribute('value').then(value => ({elem: elem, value: value})))
      )
      .then(composits => composits.filter(composit => composit.value == action.value))
      .then(composits => {
        if(composits.length == 0){
          throw new Error(util.format("Radio button with `%s` were not found in %s.", action.value, action.check))
        }

        return composits[0].elem.click()
      })
  } else {
    throw new Error("value or values is required.")
  }
}

export function select(checker, action){
  const values = action.value ? [action.value] : action.values
  return checker.waitElement(action.select, action.timeout)
    .then(elem => elem.findElements(By.css('option')))
    .then(elems => {
      if(elems.length === 0){
        throw new Error("Missing option in " + action.select)
      }

      return elems
    })
    .then(elems => Promise.map(
      elems,
      elem => elem.getAttribute('value').then(value => ({elem: elem, value: value})))
    )
    .then(composits => composits.filter(composit => values.indexOf(composit.value) >= 0).map(composit => composit.elem))
    .then(elems => Promise.map(
      elems,
      elem => elem.click())
    )
}

export function clear(checker, action){
  if(action.type == 'checkbox'){
    return checker.waitElements(action.clear, action.count, action.timeout)
    .then(elems => Promise.map(
      elems,
      elem => elem.isSelected().then(isSelected => ({elem: elem, isSelected: isSelected})))
    )
    .then(composits => composits.filter(composit => composit.isSelected))
    .then(composits => Promise.map(composits, composit => composit.elem.click()))
  } else {
    return checker.waitElement(action.clear, action.timeout).then(elem => {
      return elem.clear()
    })
  }
}
