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

Pass the scenario as an array of objects to the run() method to launch the test.

```js
const checker = new Checker(driver)

const scenario = [
  {url: "https://www.google.com/"}
  {checks: [{by: By.css("#searchform")}]}
]

checker.run(scenario)
```

In the above scenario, first open `https: // www.google.com /` and check if there is a `#searchform` element on the page. Below are all the directives of the scenario.

```js
const scenario = [
  //Ignore that block if `execif` evaluates to false.
  {execif: [//Elements in this array evaluated in the AND.
    //Evaluate to true if the target element exists.
    [{exists: By.css('.foo')}, {exists: By.css('.bar')}], //Elements in this array evaluated in the OR.
    //Evaluate to true if the target element not exists.
    [{nonExists: By.css('.main')},
    //only `bool` is useful in the Placeholder described below.
    [{bool: true}],
  ]}

  //Opens the specified page.
  {url: "https://www.google.com/"}

  //Check the elements and text on the page.
  {checks: [
    //Only the existence of the element.
    {by: By.css("#searchform")}
    //Compare the text contained in the element with exact match.
    //When `timeout` is specified, it checks repeatedly for the specified milliseconds until the target element is visible.
    {by: By.css(".main .col-sm-6:nth-child(2) h3"), equal: "Home 002", timeout: 1000},
    //Compare the text contained in the element with partial match.
    {by: By.css(".main .col-sm-6:nth-child(2) h3"), like: "Home 002"},
    //If the callback returns Promise with the resolved value true, it succeeds and fails if it returns Promise with false.
    {by: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => alt == "Home alt 003")},
    //Search the entire body of the response with partial match.
    {body: "<title>Simple selenium checker - Home</title>"}
  ]},

  {actions: [
    //Enter text in the form element.
    {sendKey: By.css("form input[type=text].name"), value: "Tom Chandler"},
    //Click the button and link.
    {click: By.css(".nav li:nth-child(2) > a")},
  ]}
]
```

`timeout` has global scope setting and instance scope setting. the default is 3000ms.

```js
Checker.DefaultTimeout = 2000 //Global

const checker = new Checker(driver)
checker.defaultTimeout = 1000 //Instance
```

It is also possible to pass the URL's host part to the second argument of the run method, without including it in the scenario.

```js
const scenario = [
  {url: "/"}
  {checks: [{by: By.css("#searchform")}]}
]

checker.run(scenario, 'https://www.google.com')
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
  {url: 'https://www.google.com/form.html'}
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
