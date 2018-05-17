const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURL);
// promiseify the client.get function
client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function() {
    // Set in the query the useCache flag. This flag is going to be
    // only in the instances that calls the cache function.
    this.useCache = true;
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
    const cacheValue = await client.get(key);
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
    client.set(key, JSON.stringify(result), 'EX', 10);
    return result;
} 