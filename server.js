var config = require('./config');

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var PORT = process.env.PORT || 3000; // used to create, sign, and verify tokens

require('./routes')(app);

app.listen(PORT);