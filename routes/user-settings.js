const express = require('express');
const router = express.Router();
const {
    getUserSettings
} = require('../db/db-user-settings');

// get endpoint for user settings
router.get('/', async function(req, res, next) {
    getUserSettings().then((query) => {
        res.status(200).send(query.rows);
    }).catch((err) => {
        res.status(400).send({ error: 'Unknown error.' });
    })
});

// post endpoint

// put endpoint

module.exports = router;