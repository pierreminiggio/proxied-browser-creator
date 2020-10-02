const fetch = require('node-fetch')
const puppeteer = require('puppeteer')

let proxies = []

/**
 * @param {Object} launchParameters
 * 
 * @returns {Promise<import('puppeteer').Browser>}
 */
const findBrowser = async (launchParameters = {}) => {
    return new Promise(async resolve => {
        const browser = await letsGoWithProxies(launchParameters)
        resolve(browser)
    })
}

/**
 * @returns {Promise<string[]>}
 */
async function fetchProxies() {
    return new Promise(resolve => {
        fetch('https://api.proxyscrape.com/?request=getproxies&proxytype=socks5&timeout=10000&country=all')
            .then(response => response.text())
            .then(text => {
                resolve(text.split('\r\n'))
            })
    })
}

/**
 * @param {Object} launchParameters
 * @param {?string} proxy 
 * 
 * @returns {Promise<Browser>}
 */
async function createBrowser(launchParameters, proxy) {
    return new Promise(async (resolve, rejects) => {
        if (proxy) {
            launchParameters.args = ['--proxy-server=socks5://' + proxy]
        }
        puppeteer.launch(launchParameters).then(browser => {
            resolve(browser)
        }).catch(error => {
            rejects(error)
        })
    })  
}

/**
 * @param {Object} launchParameters
 * 
 * @returns {Promise<import('puppeteer').Browser>} 
 */
const letsGoWithProxies = async (launchParameters) => {
    if (! proxies.length) {
        proxies = await fetchProxies()
    }
    return new Promise(async resolve => {
        const id = Math.floor(Math.random() * proxies.length)
        const proxy = proxies[id]
        proxies.splice(id, 1)
        console.log('Trying ' + proxy + ' ...')
        const browser = await createBrowser(launchParameters, proxy)
        const ipCheckerPage = await browser.newPage()
        try {
            await ipCheckerPage.goto('https://api.myip.com')
            const bodyHTML = await ipCheckerPage.evaluate(() => document.body.innerHTML)
            console.log(JSON.parse(bodyHTML))
            console.log(proxy + ' works !!!')
            resolve(browser)
        } catch(e) {
            console.log('Proxy ' + proxy + ' not working :\'(')
            browser.close()
            const newBrowser = await letsGoWithProxies(launchParameters)
            resolve(newBrowser)
        }
    })
}

module.exports = findBrowser
