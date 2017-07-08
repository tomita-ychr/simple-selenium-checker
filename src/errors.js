export class NotMatchError extends Error
{
  constructor(message, error){
    super(message, error)
    this.name = "NotMatchError"
    if(error !== undefined){
      this.stack = error.stack
    }
  }
}

export class NotSuchElementError extends Error
{
  constructor(message, error){
    super(message, error)
    this.name = "NotSuchElementError"
    if(error !== undefined){
      this.stack = error.stack
    }
  }
}

export class ExistsError extends Error
{
  constructor(message, error){
    super(message, error)
    this.name = "ExistsError"
    if(error !== undefined){
      this.stack = error.stack
    }
  }
}

export class JavascriptError extends Error
{
  constructor(message, error){
    super(message, error)
    this.name = "JavascriptError"
    if(error !== undefined){
      this.stack = error.stack
    }
  }
}

export class StatusCodeError extends Error
{
  constructor(message, error){
    super(message, error)
    this.name = "StatusCodeError"
    if(error !== undefined){
      this.stack = error.stack
    }
  }
}

export class VerboseError extends Error
{
  constructor(message, error){
    super(message)
    this.name = error.name
    this.stack = error.stack
  }
}