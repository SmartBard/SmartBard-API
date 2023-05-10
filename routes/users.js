const express = require('express');

const router = express.Router();

const cloudWatchLogger = require('../services/log/cloudwatch');
const {getUserById, getUserByEmail} = require("../db/db-user-interface");
const tokenValidator = require('../services/auth/token-validation');

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

router.get('/self', async function (req, res, next) {
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

    const user = await getUserById(userId).then((query) => {
        return query.rows.length > 0 ? query.rows[0] : {};
    });
    if (Object.keys(user).length !== 0) {
        res.status(200).send(user);
    } else {
        res.status(404).send({ error: 'User not found.' });
    }
});

router.get('/:userId', async function (req, res, next) {
    const user = await getUserById(req.params.userId).then((query) => {
        return query.rows.length > 0 ? query.rows[0] : {};
    });
    if (Object.keys(user).length !== 0) {
        res.status(200).send(user);
    } else {
        res.status(404).send({ error: 'User not found.' });
    }
});

module.exports = router;
