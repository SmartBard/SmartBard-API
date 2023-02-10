const express = require('express');
const router = express.Router();
const {
    getUserSettings,
    createUserSettings
} = require('../db/db-user-settings-interface');

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
    const fields = 'text_size, brightness, contrast, volume, primary_color';
    const values = "11, 10, 7, 3, 'dark mode'";
    createUserSettings(fields, values).then((query) => {
        // res.status(200).send({ settingId: query.rows[0].setting_id });
        res.status(200).send(query.rows);
    }).catch((err) => {
        res.status(400).send({ error: 'Unknown error.' });
    });
})

// put endpoint

module.exports = router;