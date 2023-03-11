const express = require('express');

const router = express.Router();

const cloudWatchLogger = require('../services/log/cloudwatch');
const {getUserById, getUserByEmail} = require("../db/db-user-interface");

router.get('/', async function(req, res, next) {
    if (!req.query.hasOwnProperty("id") && !req.query.hasOwnProperty("email")) {
        res.status(400).send({ error: 'Missing one of required query params' });
        return;
    }
    let user = {};
    if (req.query.hasOwnProperty("id")) {
        user = await getUserById(req.query["id"]).then((query) => {
            return query.rows.length > 0 ? query.rows[0] : {};
        }).catch((err) => {
            cloudWatchLogger.logger.error(err);
            res.status(500).send({ error: 'Unknown error.' });
        });
    } else {
        user = await getUserByEmail(req.query["email"]).then((query) => {
            return query.rows.length > 0 ? query.rows[0] : {};
        }).catch((err) => {
            cloudWatchLogger.logger.error(err);
            res.status(500).send({ error: 'Unknown error.' });
        });
    }
    if (res.statusCode === 500) {
        return;
    }
    if (Object.keys(user).length !== 0) {
        res.status(200).send(user);
    } else {
        res.status(404).send({ error: 'User not found.' });
    }
});

module.exports = router;
