const express = require('express');

const router = express.Router();

const cloudWatchLogger = require('../services/log/cloudwatch');
const {getUserById, getUserByEmail, createNewUser} = require("../db/db-user-interface");

const POST_BODY_FORMAT = {
    "cognitoid": "string",
    "firstname": "string",
    "lastname": "string",
    "email": "string",
    "admin": "boolean"
}

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

router.post('/', async function(req, res, next) {
    for (const prop in req.body) {
        if (req.body.hasOwnProperty(prop)) {
            if (!(prop in POST_BODY_FORMAT)) {
                res.status(400).send({ error: `Invalid body property: ${prop}` });
                return;
            }
        }
    }
    for (const prop in POST_BODY_FORMAT) {
        if (!(prop in req.body)) {
            res.status(400).send({error: `Did not find required property: ${prop}`});
            return;
        }
        if (typeof req.body[prop] !== POST_BODY_FORMAT[prop]) {
            res.status(400).send({error: `Invalid type for property: ${prop}. Expected type: ${POST_BODY_FORMAT[prop]}`});
            return;
        }
    }
    // check if user exists already, if so we do nothing
    await getUserByEmail(req.body.email).then((query) => {
        if (query.rows.length > 0) {
            res.status(204).send();
        }
    }).catch((err) => {
        cloudWatchLogger.logger.error(err);
        console.log(err);
        res.status(500).send({ error: 'Unknown error.' });
    });
    if (res.statusCode === 204) {
        return;
    }
    await createNewUser([req.body.cognitoid, req.body.firstname, req.body.lastname, req.body.email, req.body.admin]).then((query) => {
        res.status(200).send({ userid: query.rows[0].userid, status: 'CREATED' });
    }).catch((err) => {
        cloudWatchLogger.logger.error(err);
        console.log(err);
        res.status(500).send({ error: 'Unknown error.' });
    });
});

module.exports = router;
