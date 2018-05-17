const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {

    // static functions can call without creating the object
    static async build() {
        // Create a new chromium window
        const browser = await puppeteer.launch({
            // Open the chromium window with the UI. Like this we can see what
            // it does inside of the application
            // This is for the local machine
            //headless: false
            // To make in travis
            headless: true,
            // Decrease the time to run
            args: ['--no-sandbox']
        });
        // Create new tab of the chromium page
        // By default it shows a tab. Because we create a new page, in that case,
        // it will show two tabs and the second one is going to be our
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        // With the proxy we can access to all the properties of all the objects with out
        // need to create a object extending a class or monkey patch (prototype)
        return new Proxy(customPage, {
            get: function(target, property) {
                // We have to check first browser for close purpouses
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page) {
        this.page = page
    }

    // Login one user in the tab
    async login() {
        const user = await userFactory();
        const { session, signature } = sessionFactory(user);

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: signature });
        // Simulate that it was log in to check the cookies 
        await this.page.goto('http://localhost:3000/blogs');
        // Sometimes react is not going to render as fast as we need to select
        // the anchor element.
        await this.page.waitFor('a[href="/auth/logout"]');
    }
    
    async getContentsOf(selector) {
        return await this.page.$eval(selector, elem => elem.innerHTML);
    }
}

module.exports = CustomPage;