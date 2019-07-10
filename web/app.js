// [LOAD PACKAGES]
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));

var connection = mysql.createConnection({
    host: '203.250.148.108',
    user: 'guest',
    password: 'ssg@)!(',
    port: 53306,
    database: 'price'
});


// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// [CONFIGURE SERVER PORT]
var port = process.env.PORT || 3000;

// [CONFIGURE ROUTER]
var router = require('./routes/main')(app, connection)

// [RUN SERVER]
var server = app.listen(port, function () {
    console.log("Express server has started on port " + port)
});