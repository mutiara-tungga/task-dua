var randomstring = require('randomstring');
var randomKeySecret = randomstring.generate(5);

module.exports = {
    database: {
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'task2',
            charset: 'utf8'
        }
    },
    baseurl: "http://localhost:3000",
    apiKeyPostmarkapp: "61948b71-3cd3-42a5-aedb-5a3aca8d1053",
    secret : randomKeySecret
}