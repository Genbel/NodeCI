const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    // Wait till the route handler has finished the work and 
    // after it will come back here
    await next();
    clearHash(req.user.id);
}