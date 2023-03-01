const express = require('express');
const router = express.Router();
const {
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  deleteUserSettings,
} = require('../db/db-user-settings-interface');

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
router.get('/:userId', async function(req, res, next) {
  getUserSettings(req.params.userId).then((query) => {
    if (query.rows.length > 0) {
      res.status(200).send(query.rows[0]);
    } else {
      res.status(404).send({ error: `Did not find user settings for user ${req.params.userId}`});
    }
  }).catch((err) => {
    res.status(500).send({ error: 'Unknown error.' });
  });
});

// post endpoint
router.post('/', async function(req, res, next) {
  for (const prop in POST_BODY_FORMAT) {
    if (!(prop in req.body)) {
      res.status(400).send({ error: `Did not find required property: ${prop}` });
      return;
    }
    if (typeof req.body[prop] !== POST_BODY_FORMAT[prop]) {
      res.status(400).send({ error: `Invalid type for property: ${prop}. Expected type: ${POST_BODY_FORMAT[prop]}` });
      return;
    }
  }
  const userId = `1`; // hardcoded for now
  const fields = 'userid, textsize, brightness, contrast, volume, delay, primarycolor, secondarycolor';
  const values = `'${userId}', ${req.body.textsize}, ${req.body.brightness}, ${req.body.contrast}, ${req.body.volume}, ${req.body.delay}, '${req.body.primarycolor}', '${req.body.secondarycolor}'`;
  getUserSettings(userId).then((query) => {
    if (query.rows.length > 0) {
      res.status(400).send({ error: `Settings already exist for user ${userId}` });
    } else {
      createUserSettings(fields, values).then((query) => {
        res.status(200).send({ settingsid: query.rows[0].settingsid });
      }).catch((err) => {
        res.status(500).send({ error: 'Unknown error.' });
      });
    }
  }).catch((err) => {
    res.status(500).send({ error: 'Unknown error.' });
  });
})

// put endpoint
router.put('/:settingsId', async function(req, res, next) {
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
        await updateUserSettings(prop, newValue, req.params.settingsId)
        .catch((err) => {
          res.status(500).send({ error: 'Unknown error.' });
        });
        if (res.statusCode === 500) {
          return;
        }
      }
    }
  }
  getUserSettings(`settingsid = ${req.params.settingsId}`).then((query) => {
    res.status(200).send({ settings_id: query.rows[0].settingsid, update: "success" });
  }).catch((err) => {
    res.status(500).send({ error: 'Unknown error.' });
  });
});

// delete endpoint
router.delete('/:userId', async function(req, res, next) {
  deleteUserSettings(req.params.userId).then((query) => {
    // console.log(query.rows);
    if (query.rows.length < 1) {
      res.status(404).send({ error: `User with id ${req.params.userId} not found` });
    } else {
      res.status(200).send({});
    }
  }).catch((err) => {
    res.status(500).send({ error: 'Unknown error.'});
  });
});

module.exports = router;