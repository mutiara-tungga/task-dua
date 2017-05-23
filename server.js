var config = require('./config');

var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var app = express();
app.use(bodyParser.json());
app.use(expressValidator());

var PORT = process.env.PORT || 3000; // used to create, sign, and verify tokens


app.use(expressValidator());

require('./routes')(app);

app.listen(PORT);