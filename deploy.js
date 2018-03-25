/* eslint no-console: off */

const path = require('path')
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const program = require('commander')
const dotenv = require('dotenv')
dotenv.config()

/**
 * Parse command line
 */
program
  .usage('[options] <appname ...>')
  .option('-a, --all', 'deploy all')
  .parse(process.argv)
if (process.argv.length < 3) {
  program.help() // exit
}

/**
 * Set environment variables
 */
const mode = process.env.KINTONE_ENV === 'development' ? 'dev' : 'prod'
const env = require(`./env/${mode}.env.json`)

/**
 * Request to kintone
 */
const kintoneRequest = ({ method, url, data, headers }) => {
  return axios({
    method: method,
    baseURL: `https://${env.subdomain}.cybozu.com/`,
    url: url,
    headers: Object.assign(headers || {}, {
      'X-Cybozu-Authorization': env.auth
    }),
    data: data
  })
    .then(response => {
      return response.data
    })
    .catch(err => {
      if (err.response.data) {
        throw new Error(`Request error: ${JSON.stringify(err.response.data)}`)
      } else {
        throw Error(err.message)
      }
    })
}

/**
 * Upload a file
 */
const uploadFile = filePath => {
  const formData = new FormData()
  formData.append('file', fs.createReadStream(filePath))
  return kintoneRequest({
    method: 'post',
    url: '/k/v1/file.json',
    data: formData,
    headers: formData.getHeaders()
  }).then(results => {
    return results.fileKey
  })
}

/**
 * Send customize request
 */
const sendCustomize = customize => {
  return kintoneRequest({
    method: 'put',
    url: '/k/v1/preview/app/customize.json',
    data: customize
  }).then(response => {
    if (!response.revision) {
      throw new Error('Revision not applied by customize.')
    }
    return response.revision
  })
}

/**
 * Get customize values
 */
const getCustromizeValues = (contents, browser, ext) => {
  const values = []
  const contentsPath = env.contentsPath || path.resolve(__dirname, `./dist/${mode}`)

  return contents
    .reduce((promise, content) => {
      const type = content.match(/^(http|https):/) ? 'URL' : 'FILE'
      console.log(`- ${browser}/${ext} ${type}: ${content}`)

      if (type === 'URL') {
        values.push({ type: 'URL', url: content })
        return
      }

      const file = path.resolve(contentsPath, content)
      return uploadFile(file).then(key =>
        values.push({
          type: 'FILE',
          file: { fileKey: key }
        })
      )
    }, Promise.resolve())
    .then(() => {
      console.log('- customize: %s', JSON.stringify(values))
      return values
    })
}

/**
 * Deploy application contents
 */
const deployAppContents = (app, name, contents) => {
  const customize = {
    app: app,
    scope: 'ALL',
    desktop: { js: [], css: [] },
    mobile: { js: [] }
  }

  const settings = [{ browser: 'desktop', ext: 'js' }, { browser: 'desktop', ext: 'css' }, { browser: 'mobile', ext: 'js' }]

  return settings
    .reduce((promise, { browser, ext }) => {
      return promise.then(() => {
        const appContents = contents[browser] ? contents[browser][ext] : null
        if (!appContents || appContents.length === 0) return []

        return getCustromizeValues(appContents, browser, ext).then(values => {
          customize[browser][ext] = values
        })
      })
    }, Promise.resolve())
    .then(() => {
      return sendCustomize(customize)
    })
}

/**
 * Send request for deploying applications
 */
const deployApps = apps => {
  const params = {
    apps: apps.map(app => {
      return { app: app }
    })
  }
  return kintoneRequest({
    method: 'post',
    url: '/k/v1/preview/app/deploy.json',
    data: params
  })
}

/**
 * Main
 */
const names = program.all ? Object.keys(env.apps) : program.args
const appConfigs = []
names.forEach(name => {
  const app = env.apps[name]
  if (!app) throw new Error(`App "${name}" not configured.`)
  const contents = env.contents[name]
  if (contents) {
    appConfigs.push({ app, name, contents })
  }
})
if (appConfigs.length === 0) {
  throw new Error('No apps to deploy.')
}

Promise.resolve()
  .then(() => {
    console.log(`mode: ${mode}`)

    return appConfigs.reduce((promise, { app, name, contents }) => {
      console.log(`app: ${app}/${name}`)

      return promise.then(results => {
        results = results || []
        return deployAppContents(app, name, contents).then(revision => {
          console.log(`- revision: ${revision}`)
          results.push({ app, revision })
          return results
        })
      })
    }, Promise.resolve())
  })
  .then(results => {
    const apps = results.map(result => result.app)
    console.log(`deploy apps: ${apps}`)
    return deployApps(apps)
  })
  .then(result => {
    console.log(`all deployed.`)
  })
  .catch(err => {
    console.error(err)
  })
