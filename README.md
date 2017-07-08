## Simple selenium checker

[![npm version](https://badge.fury.io/js/simple-selenium-checker.svg)](https://badge.fury.io/js/simple-selenium-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

It is a tool to make it easy to write tests for web applications without knowledge of Selenium and difficult Promise.

## Installation

npm install simple-selenium-checker

## Usage

Initialize Checker object with WebDriver as the argument.

```js
import webdriver from 'selenium-webdriver'
import Checker from 'simple-selenium-checker'
const By = webdriver.By;

const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

const checker = new Checker(driver)
```

Call run() method with the scenario as an array of objects.

```js
const checker = new Checker(driver)

const scenario = [
  {url: "https://http://127.0.0.1:8080/"},
  {assertions: [
    {exists: By.css("header")},
    {equals: By.css("h2"), value: "Home"},
  ]},
  {actions:[{click: By.css(".nav > li:nth-child(2) > a")}]},
  {assertions: [
    {equals: By.css("h2"), value: "Foo"},
  ]},
]

checker.run(scenario)
```

In the above scenario, first, it opens `https://http://127.0.0.1:8080/`, and checks if there is a `header` element on the page, and checks if the inner text of `h2` tag is `Home`. And then it clicks second navigation menu link, after page loaded, checks if the inner text of `h2` tag is `Foo`.

Javascript error and response Status code problems are checked automatically, and if there is a problem an error is thrown. These functions are realized by checking the browser console log.

### assertions directive

```
{$name: locator|string $target [, value|values|attr_{attribute name}: string|string array $value] [, timeout: int $milliseconds]}
```

All checks directives wait for the element to be visible and wait until it is in the expected state. The wait time can change with a timeout. The default timeout is 1200 ms. You can change the default timeout globally with `Checker.DefaultTimeout` property.

#### $name

```
exsits|notExists|equals|notEquals|likes|notLikes|selected|unselected|checked|unchecked
```

exsits|notExists check only the existence of the element. `equals|notEquals` checks the inner text or value with exact match, `likes|notLikes` checks with partial match. `selected|unselected` is for select tag, `checked|unchecked` is for checkbox tag.

#### $target

```
[By instance](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html) or html|url
```

Specify the check target. If `html` is specified, the entire response body is targeted. `url` is specified, the current page URL is targeted.

#### $value

Specify the expected value. When the target is form element (except textarea), compare with value, otherwise with inner text. checkbox and radio can handle multiple elements together.

If you specify a value with the HTML attribute name as the key after the `attr_` prefix, it will be compared with the value of that attribute.

#### samples

```js
const scenario = [
  //Opens the specified page.
  {url: "https://http://127.0.0.1:8080/"}

  //Check the elements and text on the page.
  {assertions: [
    //Only the existence of the element.
    {exists: By.css("header")}
    {notExists: By.css("header .nav")}

    //Compare with the inner text of the element exactly.
    {equals: by: By.css(".main .col-sm-6:nth-child(2) h3"), value: "Home 002"},
    //When `timeout` is specified, it checks repeatedly for the specified milliseconds until the target element is visible.
    {notEquals: By.css(".main .col-sm-6:nth-child(2) h3"), , value: "Foo 002", timeout: 1000},
    
    //Compare with the inner text of the element partially.
    {likes: By.css(".main .col-sm-6:nth-child(2) h3"), value: "ome 00"},
    {notLikes: By.css(".main .col-sm-6:nth-child(2) h3"), value: "oo 00"},

    //Search with the entire body of the response partially.
    {likes: "html", value: "<title>Simple selenium checker - Home</title>"}

    //Compare with url.
    {equals: "url", value: "<https://http://127.0.0.1:8080/"}


    //Html attribute
    {equals: By.css('img#foobar'), attr_alt: "foobar"}

    //checkboxes
    {equals: By.css('input[type=checkbox][name=tag]'), values: ['tag1', 'tag2']}
    {checked: By.css('input[type=checkbox][name=tag]'), values: ['tag1']}
    {unchecked: By.css('input[type=checkbox][name=tag]'), values: ['tag3']}

    //radio

  ]},

  {actions: [
    //Enter text in the form element.
    {sendKey: By.css("form input[type=text].name"), value: "Tom Chandler"},
    //Click the button and link.
    {click: By.css(".nav li:nth-child(2) > a")},
  ]}
]
```


```js
const scenario = [
  //Opens the specified page.
  {url: "https://http://127.0.0.1:8080/"}

  //Scenarios can be nested.
  scenario: [
    //If `execif` evaluates to false, ignoring after directives.
    {execif: [//Elements in this array evaluated in the AND.
      //Evaluate to true if the target element exists.
      [{exists: By.css('.foo')}, {exists: By.css('.bar')}], //Elements in this array evaluated in the OR.
      //Evaluate to true if the target element not exists.
      [{nonExists: By.css('.main')},
      //only `bool` is useful in the Placeholder described below.
      [{bool: true}],
    ]}
  ]

  //Check the elements and text on the page.
  {assertions: [
    //Only the existence of the element.
    {exists: By.css("#searchform")}
    //Compare the text contained in the element with exact match.
    //When `timeout` is specified, it checks repeatedly for the specified milliseconds until the target element is visible.
    {equals: "Home 002", by: By.css(".main .col-sm-6:nth-child(2) h3"), timeout: 1000},
    //Compare the text contained in the element with partial match.
    {likes: "Home 002", by: By.css(".main .col-sm-6:nth-child(2) h3")},
    //Search the entire body of the response with partial match.
    {likes: "<title>Simple selenium checker - Home</title>", type: 'html'}
    //Html attribute
    {equals: "foobar", type: {attr: 'alt'}, by: By.css('img#foobar')}
  ]},

  {actions: [
    //Enter text in the form element.
    {sendKey: By.css("form input[type=text].name"), value: "Tom Chandler"},
    //Click the button and link.
    {click: By.css(".nav li:nth-child(2) > a")},
  ]}
]
```

With `placeholder` you can replace the elements in the scenario.

```js
import {placeholder} from 'simple-selenium-checker'

const scenario = [
  {url: placeholder('host_name').append('/form.html')}
  {checks: [
    {by: placeholder('checks_on_form')}
  ]}
]
checker.placeholder = {
  'host_name': 'http://www.example.com',
  'checks_on_form': By.css('.foo'),
}
checker.run(scenario, 'https://www.google.com')
```

This scenario is replaced as follows.

```js
[
  {url: 'https://http://127.0.0.1:8080/form.html'}
  {assertions: [
    {by: By.css('.foo')}
  ]}
]
```

When Checker fails the test, it displays all sources of HTML in the message. If you set to true the debug property, only the original message is displayed.


```js
const checker = new Checker(driver)
checker.debug = true
```
