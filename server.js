var bookshelf = require('./bookshelf');
var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var _ = require('underscore');

var postmark = require('postmark');
var client = new postmark.client('61948b71-3cd3-42a5-aedb-5a3aca8d1053');
//var middleware = require('./middleware');//

var app = express();
app.use(bodyParser.json());
app.use(expressValidator());
//app.use(middleware.validation);//

var PORT = 3000;

var Users = bookshelf.Model.extend({
    tableName: 'users'
});

app.use(expressValidator());

app.post('/user', function (req, res) {
    var schema = {
        'firstName': {
            notEmpty: true,
            errorMessage: 'First name invalid'
        },
        'lastName': {
            notEmpty: true,
            errorMessage: 'Last name invalid'
        },
        'email': {
            notEmpty: true,
            isEmail: {
                errorMessage: 'Invalid email'
            }
        },
        'password': {
            notEmpty: true
        }
    }
    req.checkBody(schema);

    req.getValidationResult()
        .then(function (result) {
            if (!result.isEmpty()) {
                return res.status(400).send('Validasi error');
            }

            var user = _.pick(req.body, 'firstName', 'lastName', 'email', 'password');
            new Users({
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                password: user.password
            }).save()
                .then(function (model) {
                    
                    res.send(model.toJSON());
                }).catch(function (error) {
                    console.log(error);
                })
        });//akhir get validation

});



app.listen(PORT, function () {
    console.log('PORT : ' + PORT);
});


