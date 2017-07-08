import {Checker, placeholder} from '../../../dist/'
import webdriver from 'selenium-webdriver'
const By = webdriver.By;

module.exports = [{
  title: 'test 1',
  scenario: [{
    url: "http://127.0.0.1:8080/"
  }]
},{
  title: 'test 2',
  scenario: [{
    url: "http://127.0.0.1:8080/foo.html"
  }]
}]
