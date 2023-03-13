const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const xray = require('aws-xray-sdk');
const cors = require('cors');
const cloudWatchLogger = require('./services/log/cloudwatch');
const tokenValidator = require('./services/auth/token-validation');

const indexRouter = require('./routes/index');
const userSettingsRouter = require('./routes/user-settings');
const tempRouter = require('./routes/temp');
const announcementsRouter = require('./routes/announcements');
const auditLogRouter = require('./routes/auditlog');
const assetsRouter = require('./routes/assets');
const usersRouter = require('./routes/users');

const app = express();
const port = process.env['NODE_PORT'] || 3000;

cloudWatchLogger.initializeLogger();

app.use(async (req, res, next) => {
  if (req.method !== "OPTIONS") {
    if (await tokenValidator.isValidToken(req.header('Authorization') ? req.header('Authorization') : "")) {
      next();
    } else {
      res.status(401).send({ error: 'Unauthorized.' });
      return;
    }
  } else {
    next();
  }
});
app.use(cors({
  origin: ['http://localhost:3000', 'https://dev.smartbard.durkin.app', 'https://prod.smartbard.durkin.app', 'https://smartbard.durkin.app', 'https://smbd-test.smartbard.durkin.app', 'https://smbd-test.smartbard.durkin.app/*'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
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
app.use('/user-settings', userSettingsRouter);
app.use('/announcements', announcementsRouter);
app.use('/auditlog', auditLogRouter);
app.use('/assets', assetsRouter);
app.use('/users', usersRouter);
app.use('/end', tempRouter);


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
