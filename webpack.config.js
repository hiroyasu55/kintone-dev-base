const webpack = require('webpack')
const path = require('path')
require('dotenv').config()

process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.KINTONE_ENV = process.env.KINTONE_ENV || 'production'
const mode = process.env.KINTONE_ENV === 'development' ? 'dev' : 'prod'
const env = require(`./env/${mode}.env.json`)

const kintoneEnv = {
  apps: env.apps
}
if (env.props) {
  kintoneEnv.props = {}
  Object.keys(env.props).forEach(key => {
    kintoneEnv.props[key] = JSON.stringify(env.props[key])
  })
}

const types = ['desktop', 'mobile']
const entries = {}
Object.keys(env.contents).forEach(name => {
  const contents = env.contents[name]
  types.forEach(type => {
    if (contents[type] && contents[type].js) {
      contents[type].js.forEach(file => {
        if (file.match(/^(http|https):/)) return
        const entryName = file
          .split('/')
          .slice(-1)[0]
          .replace(/\.js$/, '')
        entries[entryName] = ['./' + entryName + '.js']
      })
    }
  })
})

module.exports = {
  context: path.resolve(__dirname, './src/apps'),
  mode: 'production',
  entry: entries,
  output: {
    path: path.resolve(__dirname, `./dist/${mode}`),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        loader: ['style-loader/useable', 'css-loader']
      },
      {
        test: /\.scss$/,
        loader: ['style-loader/useable', 'css-loader', 'sass-loader']
      },
      {
        test: path.resolve(__dirname, './node_modules/kintone-utility/docs/kintoneUtility'),
        loader: 'exports-loader?kintoneUtility'
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      },
      kintoneEnv: kintoneEnv
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}
