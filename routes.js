var config = require('./config');
var middleware = require('./middleware');
var controller = require('./controller');

var bodyParser = require('body-parser');
var expressValidator = require('express-validator');


module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(expressValidator());

    app.post('/user', controller.createNewUser);
    app.get('/user/activation', controller.accountActivation);
    app.post('/user/login', controller.login);

    app.post('/user/profile', middleware.authentication, controller.profile);
    app.post('/user/forgotPassword', controller.forgotPassword);
    app.post('/user/resetPassword', controller.resetPassword);
}