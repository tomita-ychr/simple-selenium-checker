var webpack = require("webpack");

module.exports = {
  entry: __dirname + '/src/index.js',
  output: {
      path: __dirname + '/dist/',
      filename: 'index.js',
      libraryTarget: 'umd',
      library: 'SimpleSeleniumChecker',
  },
  resolve: {
    extensions: [".js", ".es6"]
  },
  externals: [
    {
      'selenium-webdriver': {
        root: 'WebDriver',
        commonjs2: 'selenium-webdriver',
        commonjs: 'selenium-webdriver',
        amd: 'selenium-webdriver'
      }
    }
  ],
  watch: true,
  module: {
    rules: [{
      test: /(\.js$|\.es6?$)/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['es2015']
        }
      }
    }]
  },
  plugins: []
}
