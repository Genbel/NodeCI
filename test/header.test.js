// Test our application header

const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    // That close function is browser.close() function, this is because the proxy of 
    // page helper
    await page.close();
});

test('The header has the correct text', async () => {
    // All the puppeteer call are async so get the text
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
});

test('Clicking login start oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
});

// If we do test.only will only this test run in that page
test('When signed in, shows logout button', async () => {
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
});