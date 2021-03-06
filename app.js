var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
//var server = require('http').Server(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//var port = process.env.PORT || '3000';
//var io = require('socket.io').listen(server);
//
//server.listen(port);
//
//console.log((new Date()) + " Server is listening on port " + port);
//
////設定
//// io.configure(function () {
////    //HerokuではWebSocketがまだサポートされていない？ので、以下の設定が必要
////     io.set("transports", ["xhr-polling"]);
////     io.set("polling duration", 10);
////
////     // socket.ioのログ出力を抑制する
////     io.set('log level', 1);
//// });
//
//io.on('connection', function(socket) {
//  // 入室
//  socket.on('enter', function(roomname) {
//      socket.roomname = roomname;
//      //socket.set('roomname', roomname);
//      socket.join(roomname);
//  });
//
//  socket.on('message', function(message) {
//    emitMessage('message', message);
//  });
//
//  socket.on('disconnect', function() {
//    emitMessage('user disconnected');
//  });
//
//  // 会議室名が指定されていたら、室内だけに通知
//  function emitMessage(type, message) {
//    //var roomname;
//    //socket.get('roomname', function(err, _room) {  roomname = _room;  });
//
//    if (socket.roomname) {
//      socket.broadcast.to(socket.roomname).emit(type, message);
//      console.log("room:" + socket.roomname);
//    } else {
//      socket.broadcast.emit(type, message);
//      console.log("no room");
//    }
//  }
//});

module.exports = app;
