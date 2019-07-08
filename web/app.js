// var express = require('express');
// var http = require('http');
// var path = require('path');
// var static = require('serve-static');

//var app = express();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs")


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


var server = app.listen(3000, function () {
    console.log("Express server has started on port 3000")
});


// app.use(static(path.join(__dirname, '/')))
// app.set('port', process.env.PORT || 8000);

app.use(express.static('public'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());

var router = require('./router/main')(app, fs);



// app.get('/', function (req, res) {
//     res.render('views/search.html');
// })

// app.get('/search', function (req, res) {
//     res.render('search.html');
// })

// http.createServer(app).listen(app.get('port'), function () {
//     console.log("Server Start..." + app.get('port'));
// })