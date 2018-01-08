var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(Server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

server.listen(3001, function() {
    console.log('Listening on ' + server.address().port);
});