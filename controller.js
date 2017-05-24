var bookshelf = require('./bookshelf');
var config = require('./config');

var randomstring = require('randomstring');
var _ = require('underscore');
var bcrypt = require('bcrypt');
var postmark = require('postmark');
var jwt = require('jsonwebtoken');

var client = new postmark.Client(config.apiKeyPostmarkapp);

var Users = bookshelf.Model.extend({
    tableName: 'users',
    initialize: function () {
        this.on('saving', this.assertEmailUnique); //sebelum melakukan saving melakukan assertEmailUnique
    },
    assertEmailUnique: function (model, attributes, options) {
        if (this.hasChanged('email')) { //bila ada perubahan pada password
            return Users
                .query('where', 'email', this.get('email'))
                .fetch(_.pick(options || {}, 'transacting')) //transacting mksudnya adalah run query in transaction
                .then(function (existing) {
                    if (existing) {
                        throw new Error('Email must unique');
                    }

                });
        }
    }
    //querying on this will constrain your query to the current record, you need to query from scratch, using plain User
});

exports.createNewUser = function (req, res) {
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

            var activationCode = randomstring.generate(20);
            var user = _.pick(req.body, 'firstName', 'lastName', 'email', 'password');
            var linkActivation = config.baseurl + '/user/activation' + "?code=" + activationCode + "&email=" + user.email;
            var hashPassword = bcrypt.hashSync(user.password, 10); //hash password
            new Users({
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                password: hashPassword,
                activaion_code: activationCode
            }).save()
                .then(function (model) {
                    client.sendEmail({
                        "From": config.postmarkappServiceSender,
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

}

exports.accountActivation = function (req, res) {
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
}

exports.login = function (req, res) {
    new Users().where({
        email: req.body.email,
        status: 1
    }).fetch()
        .then(function (model) {
            password = req.body.password;
            if (typeof password !== 'string' && typeof password !== 'undefined') {
                password = password.toString();
            } else if (req.password === 'undefined') {
                res.send({
                    messageError: "Password wrong"
                });
            }

            if (bcrypt.compareSync(password, model.attributes.password)) {
                var user = {
                    id: model.id,
                    email: model.attributes['email']
                };

                var token = jwt.sign(user, config.secret, {
                    expiresIn: '1d'
                });

                res.send({
                    token: token,
                    message: 'Berhasil login'
                });
            } else {
                res.send({
                    errorMessage: "Password do not match"
                })
            }

        }).catch(function (error) {
            res.send({
                errorMessage: "Authentication failed : " + error
            });
        });
}

exports.profile = function (req, res) {
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
}

exports.forgotPassword = function (req, res) {
    var email = req.body.email;
    var randomCode = randomstring.generate(20);
    if (email != undefined) {
        Users
            .forge({ //biar nanti kembaliannya adalah model yang tidak perlu "new"
                email: req.body.email
            }).fetch({ require: true })
            .then(function (user) { //user adalah model yang tidak perlu kata "new""
                user.save({
                    reset_password_code: randomCode
                }).then(function (model) {
                    client.sendEmail({
                        "From": config.postmarkappServiceSender,
                        "To": model.attributes.email,
                        "Subject": "Reset Password",
                        "TextBody": "To reset your password use this code : " + model.attributes.reset_password_code
                    });
                    res.send({
                        message: "Silahkan cek email untuk reset password"
                    })
                }).catch(function (error) {
                    res.send({
                        errorMessage: 'Error ' + error
                    });
                })

            }).catch(function (error) {
                res.send({
                    messageError: "Error " + error
                });
            });
    }

}

exports.resetPassword = function (req, res) {
    var user = _.pick(req.body, 'email', 'code', 'newPassword');

    if (user.email !== 'undefined' && user.code !== 'undefined' && user.newPassword !== 'undefined') {
        hasNewPassword = bcrypt.hashSync(user.newPassword, 10);
        Users
            .forge({
                email: user.email,
                reset_password_code: user.code
            }).fetch({ require: true })
            .then(function (model) {
                if (model.attributes.reset_password_code !== null) {
                    model.save({
                        password: hasNewPassword,
                        reset_password_code: null
                    }).then(function () {
                        res.send({
                            message: "Berhasil reset password"
                        });
                    }).catch(function (error) {
                        res.send({
                            messageError: "Error" + error
                        })
                    });
                } else {
                    return res.send({
                        messageError: "You didn't have reset code for password"
                    })
                }
            }).catch(function (error) {
                res.send({
                    messageError: "Error " + error
                });
            })
    }
}
