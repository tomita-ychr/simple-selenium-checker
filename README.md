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
  {checks: [
    {exists: By.css("header")},
    {equals: By.css("h2"), value: "Home"},
  ]},
  {actions:[{click: By.css(".nav > li:nth-child(2) > a")}]},
  {checks: [
    {equals: By.css("h2"), value: "Foo"},
  ]},
]

checker.run(scenario)
```

In the above scenario, first, it opens `https://http://127.0.0.1:8080/`, and checks if there is a `header` element on the page, and checks if the inner text of `h2` tag is `Home`. And then it clicks second navigation menu link, after page loaded, checks if the inner text of `h2` tag is `Foo`.

Javascript error and response Status code problems are checked automatically, and if there is a problem an error is thrown. These functions are realized by checking the browser console log.

### checks directive

```
{$name: locator|string $target [, value|values: string|string array $value] [, type: string $type] [, timeout: int $milliseconds]}
```

All checks directives wait for the element to be visible and wait until it is in the expected state. The wait time can change with timeout. The default timeout is 1200 ms.

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

Specify the expected value. When checkbox and multiple select tag, specify an array of strings.

#### $type

```
{attr: $attribute_name}|checkbox|select
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
  {checks: [
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
  {checks: [
    {by: By.css('.foo')}
  ]}
]
```

When Checker fails the test, it displays all sources of HTML in the message. If you set to true the debug property, only the original message is displayed.


```js
const checker = new Checker(driver)
checker.debug = true
```
