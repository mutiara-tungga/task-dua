var config = require('./config');
var dbConfig = config.database;
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);
module.exports = bookshelf;