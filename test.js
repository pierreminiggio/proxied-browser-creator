const findBrowser = require('./main')

findBrowser().then(browser => {
    console.log(browser)
})