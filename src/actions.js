export function click(checker, action){
  return checker.waitElement(action.click).then(elem => {
    return elem.click()
  })
}

export function sendKeys(checker, action){
  return checker.waitElement(action.sendKeys).then(elem => {
    return elem.sendKeys(action.value)
  })
}
