const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
    const sessionObject = {
        passport: {
            // We do that because the mongoose _id property is an object
            // If we do stringify it will parse all the object to string
            // and that I do not want
            user: user._id.toString()
        }
    }
    const session = Buffer.from(
        JSON.stringify(sessionObject)
    ).toString('base64');
    
    const signature = keygrip.sign('session=' + session);

    return { session, signature };
}