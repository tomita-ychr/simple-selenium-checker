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

In the above scenario, first open `https: // www.google.com /` and check if there is a `#searchform` element on the page.


Below are all the supported directives of the scenario.

```js
const scenario = [
  //Opens the specified page.
  {url: "https://www.google.com/"}

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
    //If the callback returns Promise with the resolved value true, it succeeds and fails if it returns Promise with false.
    {callback: elem => elem.getAttribute("alt").then(alt => alt == "Home alt 003"), by: By.css(".main .col-sm-6:nth-child(3) img")},
    //Search the entire body of the response with partial match.
    {likes: "<title>Simple selenium checker - Home</title>"}
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
