export class Placeholder
{
  constructor(key){
    this.key = key
    this.appendedTexts = []
  }

  append(text){
    this.appendedTexts.push(text)
    return this
  }

  apply(holderItem){
    if(this.appendedTexts.length){
      return holderItem + this.appendedTexts.join('')
    } else {
      return holderItem
    }
  }

  get placeholderKey(){
    return this.key
  }
}

export default function placeholder(key){
  return new Placeholder(key)
}
