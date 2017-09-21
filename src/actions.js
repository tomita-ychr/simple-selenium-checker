import webdriver from 'selenium-webdriver';
import util from 'util';
import Checker from './Checker'
import * as errors from './errors'
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
          throw new errors.NoSuchElementError(util.format("Radio button with `%s` were not found in %s.", action.value, action.check))
        }

        return composits[0].elem.click()
      })
  } else {
    throw new Error("value or values is required.")
  }
}

export function uncheck(checker, action){
  return checker.waitElements(action.uncheck, action.count, action.timeout)
    .then(elems => checker.assembleFromElements(elems, {
      value: elem => elem.getAttribute('value'),
      selected: elem => elem.isSelected()
    }))
    .then(composits => composits.filter(composit => composit.selected && action.values.indexOf(composit.value) >= 0))
    .then(composits => webdriver.promise.map(
      composits,
      composit => composit.elem.click()
    ))
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
  return checker.waitElements(action.clear, action.count, action.timeout)
    .then(elems => checker.assembleFromElements(elems, {
      tag_name: elem => elem.getTagName(),
      type: elem => elem.getAttribute('type'),
      selected: elem => elem.isSelected(),
    }))
    .then(composits => {
      if(composits[0].tag_name == 'select'){
        return checker.waitElementsIn(composits[0].elem, By.css('option'), check.count, check.timeout)
          .then(elems => checker.assembleFromElements(elems, {
            tag_name: elem => elem.getTagName(),
            type: elem => elem.getAttribute('type'),
            selected: elem => elem.isSelected(),
          }))
      } else {
        return composits
      }
    })
    .then(composits => {
      if(composits[0].tag_name == 'option' || (composits[0].type == 'checkbox' || composits[0].type == 'radio')){
        composits.filter(composit => composit.selected).forEach(composit => composit.elem.click())
      } else {
        composits.forEach(composit => composit.elem.clear())
      }
    })
}

export function alert(checker, action){
  return checker.handleAlert(action.alert, action.timeout)
}

export function switchTo(checker, action){
  if(action.switchTo === 'default' || !action.switchTo){
    return checker.driver.switchTo().frame(null)
  } else {
    return checker.waitElement(action.switchTo, action.timeout)
      .then(elem => checker.driver.switchTo().frame(elem))
  }

}

export function authenticateAs(checker, action){
  //TODO change to driver.switchTo().alert().authenticateAs().
  // return checker.waitAlert(action.timeout).then(alert => {
  //   return alert.authenticateAs(action.authenticateAs, action.password)
  // })
  return Promise.resolve().then(() => {
    const reg = /(https?):\/\/([^/]+)(\/?.*)/
    const res = reg.exec(checker.lastUrl)
    if(res === null){
      throw new Error()
    }
    const authUrl = util.format("%s://%s:%s@%s%s", res[1], action.authenticateAs, action.password, res[2], res[3])
    return checker.driver.get(authUrl)
      .then(() => checker.driver.get(checker.lastUrl))
  })
}

export function scrollTo(checker, action){
  const xcoord = action.scrollTo.hasOwnProperty("x") ? action.scrollTo.x : 0;
  const ycoord = action.scrollTo.hasOwnProperty("y") ? action.scrollTo.y : 0;
  checker.driver.executeScript("window.scrollTo(" + xcoord + "," + ycoord + ")");
}
