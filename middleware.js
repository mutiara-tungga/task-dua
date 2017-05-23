module.exports = {

}

// //{first_name, last_name, email, password}
// var express = require('express');
// var validate = require("validate.js");
// var bodyParser = require('body-parser');

// var app = express();
// app.use(bodyParser.json());

// var constraints = {
//     first_name: {
//         presence: true
//     },
//     last_name: {
//         presence: true
//     },
//     email: {
//         presence: true,
//         email: true
//     },
//     password: {
//         presence: true
//     }
// }

// module.exports = {
//     validation: function (req, res, next) {
//         var body = req.body;
//         console.log(req.method);
//         console.log(body);
//         var first_name = req.body.first_name;

//         validate({ first_name: first_name }, constraints);
//         validate.isString(first_name);
//         next();
//     }
// };