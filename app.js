const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const xray = require('aws-xray-sdk');
const cloudWatchLogger = require('./services/log/cloudwatch');

const indexRouter = require('./routes/index');
const tempRouter = require('./routes/temp');
const announcementsRouter = require('./routes/announcements');
const auditLogRouter = require('./routes/auditlog');

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

const app = express();
const port = process.env['NODE_PORT'] || 3000;

cloudWatchLogger.initializeLogger();

app.use(xray.express.openSegment("SMARTBARD"));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  cloudWatchLogger.logger.info(`Requesting ${req.method} ${req.originalUrl}`, {additionalInfo: { body: req.body, headers: req.headers }});
  next();
});

app.use('/', indexRouter);
app.use('/end', tempRouter);
app.use('/announcements', announcementsRouter);
app.use('/auditlog', auditLogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({message: err.message, error: req.app.get('env') === 'development' ? err : {}})
});

app.use(xray.express.closeSegment());

app.listen(port, () => {
  console.log('App started!');
})
