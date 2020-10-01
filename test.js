const findBrowser = require('./main')

findBrowser().then(browser => {
    console.log('found !')
    browser.version().then(version => {
        console.log(version)
    })
})