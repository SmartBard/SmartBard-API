var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
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
  res.status(err.status || 500);
  res.send({message: err.message, error: req.app.get('env') === 'development' ? err : {}})
});

app.listen(port, () => {
  console.log('App started!');
})
