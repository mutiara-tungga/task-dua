var config = require('./config');
var bookshelf = require('./bookshelf');
var middleware = require('./middleware');

var jwt = require('jsonwebtoken');
var randomstring = require('randomstring');
var _ = require('underscore');
var postmark = require('postmark');

var client = new postmark.Client(config.apiKeyPostmarkapp);

var Users = bookshelf.Model.extend({
    tableName: 'users'
});

module.exports = function (app) {
    //new user
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
                            messageError: 'Validasi error'
                        });
                }
                var activationCode = randomstring.generate(20);
                var user = _.pick(req.body, 'firstName', 'lastName', 'email', 'password');
                var linkActivation = config.baseurl + '/user/activation' + "?code=" + activationCode + "&email=" + user.email;
                new Users({
                    first_name: user.firstName,
                    last_name: user.lastName,
                    email: user.email,
                    password: user.password,
                    activaion_code: activationCode
                }).save()
                    .then(function (model) {
                        console.log(model);
                        client.sendEmail({
                            "From": "no-reply@skyshi.com",
                            "To": user.email,
                            "Subject": "Account Activation",
                            "TextBody": "Hello",
                            "HtmlBody": "<html><body><p> Your Account : <br> First Name : "
                            + user.firstName + "<br> - Last Name : "
                            + user.lastName + "<br> - Email : "
                            + user.email + "<br> - Password : "
                            + user.password + "<br>To activate your account visit link below : <a href='"
                            + linkActivation + "'>Activate my account</a></p></body></html>"
                        });
                        res.send({
                            first_name: model.attributes.first_name,
                            last_name: model.attributes.last_name,
                            email: model.attributes.email
                        });
                    }).catch(function (error) {
                        res.send({
                            errorMessage: "Error" + error
                        });
                    })
            });//akhir get validation

    });

    //aktivasi akun
    app.get('/user/activation', function (req, res) {
        var queryParams = req.query;

        if (queryParams.hasOwnProperty('code') & queryParams.hasOwnProperty('email')) {
            var code = queryParams.code;
            var email = queryParams.email;

            new Users().where({
                email: email,
                activaion_code: code
            }).save(
                { status: 1 },
                { patch: true }
                ).then(function (model) {
                    res.send({
                        message: 'Aktivasi akun berhasil silahkan login'
                    });
                }).catch(function (error) {
                    res.send({
                        errorMessage: "Aktivasi akun gagal : " + error
                    });
                });
        }
    });

    //login
    app.post('/user/login', function (req, res) {
        new Users().where({
            email: req.body.email,
            password: req.body.password,
            status: 1
        }).fetch()
            .then(function (model) {
                var user = {
                    id: model.id,
                    email: model.attributes['email']
                };

                var token = jwt.sign(user, config.secret, {
                    expiresIn: '1h'
                });

                res.send({
                    token: token,
                    message: 'Berhasil login'
                });
            }).catch(function (error) {
                res.send({
                    errorMessage: "Authentication failed : " + error
                });
            })
    });


    app.use(middleware.authentication);
    app.post('/user/profile', middleware.authentication, function (req, res) {
        var id = req.decoded.id;
        var email = req.decoded.email;

        new Users().where({
            id: id,
            email: email
        }).fetch()
            .then(function (model) {
                res.send({
                    firstName: model.attributes.first_name,
                    lastName: model.attributes.last_name,
                    email: model.attributes.email
                });
            }).catch(function (error) {
                res.send({
                    errorMessage: "Error " + error
                });
            });
    });
}