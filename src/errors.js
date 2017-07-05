export class NotMatchError extends Error
{
  constructor(message, fileName, lineNumber){
    super(message, fileName, lineNumber)
    this.name = "NotMatchError"
  }
}

export class NotSuchElementError extends Error
{
  constructor(message, fileName, lineNumber){
    super(message, fileName, lineNumber)
    this.name = "NotSuchElementError"
  }
}

export class ElementExistsError extends Error
{
  constructor(message, fileName, lineNumber){
    super(message, fileName, lineNumber)
    this.name = "ElementExistsError"
  }
}

export class JavascriptError extends Error
{
  constructor(message, fileName, lineNumber){
    super(message, fileName, lineNumber)
    this.name = "JavascriptError"
  }
}

export class StatusCodeError extends Error
{
  constructor(message, fileName, lineNumber){
    super(message, fileName, lineNumber)
    this.name = "StatusCodeError"
  }
}

export class VerboseError extends Error
{
  constructor(message, error){
    super(message)
    this.name = error.name
  }
}