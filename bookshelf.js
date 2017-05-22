var dbConfig = {
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'task2',
        charset: 'utf8'
    }
};

var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);
module.exports = bookshelf;