import webdriver from 'selenium-webdriver';
import util from 'util';
import Checker from './Checker'
const By = webdriver.By;

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
      .then(elems => checker.assembleFromElements(
        elems, {
          value: elem => elem.getAttribute('value'),
          isSelected: elem => elem.isSelected()
      }))
      .then(composits => composits.filter(composit => !composit.isSelected && action.values.indexOf(composit.value) >= 0))
      .then(composits => webdriver.promise.map(
        composits,
        composit => composit.elem.click()
      ))
  } else if(action.hasOwnProperty('value')){//radio
    return checker.waitElements(action.check, action.count, action.timeout)
      .then(elems => checker.assembleFromElements(
        elems,
        {value: elem => elem.getAttribute('value')}
      ))
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
    .then(elem => checker.waitElementsIn(elem, By.css('option')))
    .then(elems => checker.assembleFromElements(
      elems, {
        value: elem => elem.getAttribute('value'),
        isSelected: elem => elem.isSelected()
    }))
    .then(composits => composits.filter(composit => !composit.isSelected && values.indexOf(composit.value) >= 0).map(composit => composit.elem))
    .then(elems => webdriver.promise.map(
      elems,
      elem => elem.click()
    ))
}

export function unselect(checker, action){
  return checker.waitElement(action.unselect, action.timeout)
    .then(elem => checker.waitElementsIn(elem, By.css('option')))
    .then(elems => checker.assembleFromElements(
      elems, {
        value: elem => elem.getAttribute('value'),
        isSelected: elem => elem.isSelected()
    }))
    .then(composits => composits.filter(composit => composit.isSelected && action.values.indexOf(composit.value) >= 0).map(composit => composit.elem))
    .then(elems => webdriver.promise.map(
      elems,
      elem => elem.click()
    ))
}

export function clear(checker, action){
  if(action.type == 'checkbox'){
    return checker.waitElements(action.clear, action.count, action.timeout)
    .then(elems => checker.assembleFromElements(
      elems,
      {isSelected: elem => elem.isSelected()}
    ))
    .then(composits => composits.filter(composit => composit.isSelected))
    .then(composits => webdriver.promise.map(composits, composit => composit.elem.click()))
  } else if(action.type == 'select'){
    return checker.waitElement(action.clear, check.timeout)
      .then(elem => checker.waitElementsIn(elem, By.css("option")))
      .then(elems => checker.assembleFromElements(
        elems,
        {isSelected: elem => elem.isSelected()}
      ))
      .then(composits => composits.filter(composit => composit.isSelected).map(composit => composit.elem))
      .then(elems => webdriver.promise.map(
        elems,
        elem => elem.click()
      ))
  } else {
    return checker.waitElement(action.clear, action.timeout).then(elem => {
      return elem.clear()
    })
  }
}
