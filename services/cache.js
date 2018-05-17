const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisURL);
// promiseify the client.get function
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    // Set the hashKey property for the cache
    this.hashKey = JSON.stringify(options.key || '');
    // Like this we can chain it the cache function like limit(10), sort,...
    return this;
}

// Do not use fat arrow function because we are editing prototype function
mongoose.Query.prototype.exec = async function () {
    // Check if we want to cache the query
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    // We do like that because it might happen that we edit the 'this'
    // object and the query will execute wrong
    // Set the key as an string
    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );
    // Pull out the info of a nested hash. Lecture 65, Advanced Node
    const cacheValue = await client.hget(this.hashKey, key);
    if (cacheValue) {
        // When we get the data from the cache, we get a raw object but in that case 
        // we need the mongo model object
        // Here we do same as new this.model({}) == new User({}) (Create new model with mongoose)
        const newDocument = JSON.parse(cacheValue);
        return Array.isArray(newDocument) 
        // If it is an array parse each element
        ? newDocument.map(doc => new this.model(doc))
        // If our new object is an object create the new model. It can be User case
        : new this.model(newDocument);
    }
    // Now execute the same prototype function of exec that we copy above.
    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
} 


module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}