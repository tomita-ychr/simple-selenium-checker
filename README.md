## Simple selenium checker

[![npm version](https://badge.fury.io/js/simple-selenium-checker.svg)](https://badge.fury.io/js/simple-selenium-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

It is a tool to make it easy to write tests of web applications without knowledge of Selenium and difficult Promise.

## Installation

npm install simple-selenium-checker

## Usage

Initialize Checker object with WebDriver as argument.

```js
import webdriver from 'selenium-webdriver'
import Checker from '../src/Checker'
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

In the above scenario, first open `https: // www.google.com /` and check if there is a `# searchform` element on the page. Below are all the directives of the scenario.

```js
const scenario = [
  //Opens the specified page.
  {url: "https://www.google.com/"}

  //Check the elements and text on the page.
  {checks: [
    //Only the existence of the element.
    {by: By.css("#searchform")}
    //Compare the text contained in the element with exact match.
    {by: By.css(".main .col-sm-6:nth-child(2) h3"), text: "Home 002"},
    //Compare the text contained in the element with partial match.
    {by: By.css(".main .col-sm-6:nth-child(2) h3"), like: "Home 002"},
    //If the callback returns Promise with the resolved value true, it succeeds and fails if it returns Promise with false.
    {by: By.css(".main .col-sm-6:nth-child(3) img"), callback: elem => elem.getAttribute("alt").then(alt => alt == "Home alt 003")},
    //Search the entire body of the response with partial match.
    {text: "<title>Simple selenium checker - Home</title>"}
  ]},

  //Enter text in the form, click the button and link.
  {actions: [
    {by: By.css("form input[type=text].name"), type: Checker.ActionType.SendKeys,  value: "Tom Chandler"},
    {by: By.css(".nav li:nth-child(2) > a"), type: Checker.ActionType.Click},
  ]}
]
```

It is also possible to pass the url's host part to the second argument of run, without including it in the scenario.

```js
const scenario = [
  {url: "/"}
  {checks: [{by: By.css("#searchform")}]}
]

checker.run(scenario, 'https://www.google.com')
```

The `checks` option is implemented to wait until the specified element is visibled. So you can use it without worrying about elements added to the page with javascript.

You can change the timeout in ms by `Checker.WaitElementTimeout` static property (globaly) or `waitElementTimeout` instance property (locally). Default is 4000ms.

```js
const checker = new Checker(driver)
checker.waitElementTimeout = 1000
```

When Checker fails the test, it displays all sources of HTML in the message. If you set to true the debug property, only the original message is displayed.


```js
const checker = new Checker(driver)
checker.debug = true
```
