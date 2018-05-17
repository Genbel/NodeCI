const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
    // We do not need google attributes so empty object
    // It will return a promise so we do not need to do await
    return new User({}).save();
}