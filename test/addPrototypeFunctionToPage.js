// This call monkey patching, in that case we will not use
const Page = require('pupperteer/lib/Page');

Page.prototype.login = async function() {
    const user = await userFactory();
    const { session, signature } = sessionFactory(user);

    await page.setCookie({ name: 'session', value: session });
    await page.setCookie({ name: 'session.sig', value: signature });
    // Simulate that it was log in to check the cookies 
    await page.goto('localhost:3000');
    // Sometimes react is not going to render as fast as we need to select
    // the anchor element.
    await page.waitFor('a[href="/auth/logout"]');
}