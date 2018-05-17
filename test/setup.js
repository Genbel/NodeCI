// WE ADD IN PACKAGE.JSON, A SET UP FOR TEST FRAMEWORK(JEST) THAT IT WILL LOAD
// THAT FILE WHEN EVER WE START UP. THIS FILE IS GOING TO BE EXECUTED FOR EVERY TEST

// Set up a longer timer to execute each test before ending. By default are 5000ms and after that
// time the test will fail
jest.setTimeout(6000);
// With that mongoose will not which is User model
require('../models/User');

const mongoose = require('mongoose');

const keys = require('../config/keys');

// By default mongoose does not want to use its built in promise implementation 
// and it wants you to tell it what implementation of promises we should use. 
// In that case we will use node global promise object
mongoose.Promise = global.Promise;
// To avoid deprecation message
mongoose.connect(keys.mongoURI, { useMongoClient: true });