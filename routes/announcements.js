const express = require('express');
const router = express.Router();

const GET_QUERY_PARAMS = ["id", "category", "datefrom", "dateto", "status"];
const POST_BODY_FORMAT = {
    "title": "string",
    "body": "string",
    "dateFrom": "string",
    "dateTo": "string",
    "priority": "boolean"
}

// get endpoint for all announcements
router.get('/', async function(req, res, next) {
    // validating query parameters
    for (const prop in req.query) {
        if (req.query.hasOwnProperty(prop)) {
            if (!GET_QUERY_PARAMS.includes(prop)) {
                res.status(400).send({ error: `Invalid query parameter: ${prop}` });
                return;
            }
        }
    }
    // TODO get announcement from db when interface is ready
    res.status(200).send(null);
});

// post endpoint to create a new announcement
router.post('/', async function(req, res, next) {
    // validating request body
    for (const prop in req.body) {
        if (req.body.hasOwnProperty(prop)) {
            if (!(prop in POST_BODY_FORMAT)) {
                res.status(400).send({error: `Invalid body property: ${prop}`});
                return;
            }
        }
    }
    // ensures all required fields are present
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
    const changeTime = new Date(Date.now()).toISOString();
    const status = "REQUESTED";
    // TODO add announcement to database when interface is ready
    res.status(200).send({ announcementId: null, status: status});
});

// get endpoint for particular announcement
router.get('/:announcementId', async function(req, res, next) {
    const announcement = null; // TODO get announcement from database when interface is ready
    if (announcement === null) {
        res.status(404).send({error: `Announcement with id ${req.params.announcementId} not found`});
        return;
    }
    res.status(200).send(null);
});

// put endpoint to edit a particular announcement
router.put('/:announcementId', async function(req, res, next) {
    // validating request body
    for (const prop in req.body) {
        if (req.body.hasOwnProperty(prop)) {
            if (!(prop in POST_BODY_FORMAT)) {
                res.status(400).send({error: `Invalid body property: ${prop}`});
                return;
            }
        }
    }
    // TODO update announcement in database when interface is ready
    res.status(200).send({ announcementId: req.params.announcementId, status: null });
});

// delete endpoint to remove announcements
router.delete('/:announcementId', async function(req, res, next) {
    const announcement = null; // TODO attempt delete when interface is ready
    if (announcement === null) {
        res.status(404).send({error: `Announcement with id ${req.params.announcementId} not found`});
        return;
    }
    res.status(200).send({ announcementId: req.params.announcementId, status: null });
});

module.exports = router;