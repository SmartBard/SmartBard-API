const express = require('express');
const router = express.Router();
const {
    getUserSettings,
    createUserSettings
} = require('../db/db-user-settings-interface');

const POST_BODY_FORMAT = {
    "text_size": "number",
    "brightness": "number",
    "contrast": "number",
    "volume": "number",
    "primary_color": "string"
}

// get endpoint for user settings
router.get('/', async function(req, res, next) {
    getUserSettings().then((query) => {
        res.status(200).send(query.rows);
    }).catch((err) => {
        res.status(400).send({ error: 'Unknown error.' });
    });
});

// post endpoint, will replace values with req.body.text_size, req.body.brightness etc. for dynamic query
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
    const fields = 'text_size, brightness, contrast, volume, primary_color';
    const values = `${req.body.text_size}, ${req.body.brightness}, ${req.body.contrast}, ${req.body.volume}, '${req.body.primary_color}'`;
    createUserSettings(fields, values).then((query) => {
        res.status(200).send({ command: query.command });
    }).catch((err) => {
        res.status(400).send({ error: 'Unknown error.' });
    });
})

// put endpoint

module.exports = router;