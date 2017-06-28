export function click(checker, action){
  return checker.waitElement(action.loc).then(elem => {
    return elem.click()
  })
}

export function sendKeys(checker, action){
  return checker.waitElement(action.loc).then(elem => {
    return elem.sendKeys(action.value)
  })
}
