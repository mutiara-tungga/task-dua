var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./config');

var app = express();
app.use(bodyParser.json());

module.exports = {
    authentication: function (req, res, next) {
        var token = req.headers['auth'];

        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.send({
                        messageError: 'Authentication failed'
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            return res.status(403)
                .send({ 
                    messageError:'No token'
                });
        }
    }
}