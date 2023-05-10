const express = require('express');
const router = express.Router();
const {
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  deleteUserSettings,
} = require('../db/db-user-settings-interface');
const cloudWatchLogger = require('../services/log/cloudwatch');
const tokenValidator = require('../services/auth/token-validation');
const {getUserByEmail} = require("../db/db-user-interface");

const POST_BODY_FORMAT = {
  "textsize": "number",
  "brightness": "number",
  "contrast": "number",
  "volume": "number",
  "delay": "number",
  "primarycolor": "string",
  "secondarycolor": "string"
}

// get endpoint for user settings
router.get('/', async function(req, res, next) {
  const email = await tokenValidator.getUserEmailFromToken(req.header('Authorization').split(' ')[1]); // hardcoded but should be valid due to middleware
  let userId = await getUserByEmail(email).then((query) => {
      if (query.rows.length > 0) {
          return query.rows[0].userid;
      } else {
          return "";
      }
  }).catch((err) => {
      res.status(500).send({ error: 'Unknown error' });
      cloudWatchLogger.logger.error(err);
      console.log(err);
      return "";
  });
  if (res.statusCode === 500) {
      return;
  }
  getUserSettings(userId).then(async (query) => {
    if (query.rows.length > 0) {
      res.status(200).send(query.rows[0]);
    } else {
      const settings = await initializeUserSettings(userId);
      if (settings != null) {
        res.status(200).send(settings);
      } else {
        res.status(500).send({ error: 'Unknown error.' });
      }
    }
  }).catch((err) => {
    cloudWatchLogger.logger.error(err);
    res.status(500).send({ error: 'Unknown error.' });
  });
});

// put endpoint for creating or modifying
router.put('/', async function(req, res, next) {
  const email = await tokenValidator.getUserEmailFromToken(req.header('Authorization').split(' ')[1]); // hardcoded but should be valid due to middleware
  let userId = await getUserByEmail(email).then((query) => {
      if (query.rows.length > 0) {
          return query.rows[0].userid;
      } else {
          return "";
      }
  }).catch((err) => {
      res.status(500).send({ error: 'Unknown error' });
      cloudWatchLogger.logger.error(err);
      console.log(err);
      return "";
  });
  if (res.statusCode === 500) {
      return;
  }
  for (const prop in req.body) {
    if (req.body.hasOwnProperty(prop)) {
      if (!(prop in POST_BODY_FORMAT)) {
        res.status(400).send({ error: `Invalid body property: ${prop}`});
        return;
      } else {
        // If req.body[prop] is string and not encased in quotes, error will return..
        let newValue = req.body[prop];
        if (typeof req.body[prop] === 'string') {
          newValue = `'${req.body[prop]}'`;
        }
        await updateUserSettings(prop, newValue, userId)
        .catch((err) => {
          cloudWatchLogger.logger.error(err);
          res.status(500).send({ error: 'Unknown error.' });
        });
        if (res.statusCode === 500) {
          return;
        }
      }
    }
  }
  res.status(200).send({ userid: req.params.userId, update: "success" });
});

async function initializeUserSettings(userId) {
  return await createUserSettings([userId, 12, 100, 50, 10, 0, "#ABC123", "#123ABC"]).then((query) => {
    return query.rows[0];
  }).catch((err) => {
    cloudWatchLogger.logger.error(err);
    return null;
  });
}

module.exports = router;