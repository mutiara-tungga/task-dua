var config = require('./config');

var express = require('express');

var app = express();

var PORT = process.env.PORT || 3000; // used to create, sign, and verify tokens

require('./routes')(app);

app.listen(PORT);