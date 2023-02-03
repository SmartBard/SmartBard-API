var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tempRouter = require('./routes/temp');
const {
  getUsers,
  getUserById
} = require('./db/db-user-interface');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  getUserActivity
} = require('./db/db-announcements-interface');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/end', tempRouter)

// SOME EXAMPLES OF USING DB INTERFACE FUNCTIONS
getUsers().then((res) => {
  console.log(res.rows);
});

// var fields = 'title, body, date_from, date_to, status, priority, creation_time';
// var values = "'Sports Day', 'Fridays sport will be volleyball', TIMESTAMP '2023-02-03 07:00:00', TIMESTAMP '2023-02-10 07:00:00', 'REQUESTED', 'true', TIMESTAMP '2023-02-02 10:00:00'"
// createAnnouncement(fields, values).then((res) => {
//   console.log(res.command);
// });

// var col = 'status';
// var newValue = "'APPROVED'";
// var announceID = 2;
// updateAnnouncement(col, newValue, announceID).then((res) => {
//   console.log(res.command);
// })
  
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
