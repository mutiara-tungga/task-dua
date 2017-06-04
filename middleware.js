var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./config');

var app = express();
// app.use(bodyParser.json());

module.exports = {
    authentication: function (req, res, next) {
        var token = req.headers['auth'];

        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.send({
                        messageError: 'Authentication failed : ' + err
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            return res.status(403)
                .send({
                    messageError: 'No token'
                });
        }
    },
    inputValidationForCreate: function (req, res, next) {
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
                notEmpty: true,
                errorMessage: 'Password Invalid'
            }
        }
        req.checkBody(schema);

        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    return res.status(400)
                        .send({
                            messageError: 'Validasi error' + result
                        });
                }

                next();
            }).catch(function (error) {
                res.send({
                    messageError: 'Error ' + error
                })
            });//akhir get validation
    }
}