const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const announcementsRouter = require('./routes/announcements');

const app = express();
const port = process.env['NODE_PORT'] || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/announcements', announcementsRouter);

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
