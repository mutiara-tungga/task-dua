var express = require('express');
expressValidator = require('express-validator');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(expressValidator());


var PORT = 3000;

app.post('/user', function (req, res) {
    var schema = {
        'firstName': {
            notEmpty: true,
            errorMessage : 'First name invalid'
        },
        'lastName': {
            notEmpty: true,
            errorMessage : 'Last name invalid'
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
    // req.checkBody('lastName', 'Invalid las name')
    //     .notEmpty();

    req.getValidationResult()
        .then(function (result) {
            if (!result.isEmpty()) {
                return res.status(400).send('Validasi error');
            }
            res.json({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password
            });
        })
});

app.listen(PORT, function () {
    console.log('PORT : ' + PORT);
});

