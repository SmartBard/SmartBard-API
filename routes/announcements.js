const express = require('express');
const router = express.Router();

const {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../db/db-announcements-interface');
const { logAction } = require('../services/log/auditlog');

const GET_QUERY_PARAMS = ["category", "datefrom", "dateto", "status"];
const POST_BODY_FORMAT = {
    "title": "string",
    "body": "string",
    "datefrom": "string",
    "dateto": "string",
    "priority": "boolean"
}
const PUT_BODY_FORMAT = {
    "title": "string",
    "body": "string",
    "datefrom": "string",
    "dateto": "string",
    "priority": "boolean",
    "status": "string"
}

// get endpoint for all announcements
router.get('/', async function(req, res, next) {
    let query = "";
    // validating query parameters
    for (const prop in req.query) {
        if (req.query.hasOwnProperty(prop)) {
            if (!GET_QUERY_PARAMS.includes(prop)) {
                res.status(400).send({ error: `Invalid query parameter: ${prop}` });
                return;
            }
            if (query.length !== 0) {
                query += " AND ";
            }
            if (prop === "datefrom") {
                query += `datefrom > '${req.query[prop]}'`;
            } else if (prop === "dateto") {
                query += `dateto < '${req.query[prop]}'`;
            } else {
                query += `${prop} = '${req.query[prop]}'`
            }
        }
    }
    if (!query.includes("datefrom") || !query.includes("dateto")) {
        if (query.length !== 0) {
            query += " AND ";
        }
        query += `datefrom < now() AND dateto > now()`;
    }
    if (!query.includes("status")) {
        if (query.length !== 0) {
            query += " AND ";
        }
        query += `status = 'approved'`;
    }
    getAnnouncements(query).then((query) => {
        res.status(200).send(query.rows);
    }).catch((err) => {
        res.status(500).send({ error: 'Unknown error.' });
    })
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
    const status = "requested";
    createAnnouncement("title, body, media, datefrom, dateto, userid, status, priority, lastchangetime, lastchangeuser, creationtime", `'${req.body.title}', '${req.body.body}', '${req.body.media}', '${req.body.datefrom}', '${req.body.dateto}', '1', '${status}', '${req.body.priority}', '${changeTime}', '1', '${changeTime}'`).then(async (query) => {
        await logAction(status, query.rows[0].announcementid, '1');
        res.status(200).send({ announcementId: query.rows[0].announcementid, status: status });
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ error: 'Unknown error.' });
    });
});

// get endpoint for particular announcement
router.get('/:announcementId', async function(req, res, next) {
    getAnnouncements(`announcementid = '${req.params.announcementId}'`).then((query) => {
        console.log(query.rows.length);
        if (query.rows.length < 1) {
            res.status(404).send({error: `Announcement with id ${req.params.announcementId} not found`});
        } else {
            res.status(200).send(query.rows[0]);
        }
    }).catch((err) => {
        res.status(500).send({error: 'Unknown error.'});
    });
});

// put endpoint to edit a particular announcement
router.put('/:announcementId', async function(req, res, next) {
    // validating request body
    for (const prop in req.body) {
        if (req.body.hasOwnProperty(prop)) {
            if (!(prop in PUT_BODY_FORMAT)) {
                res.status(400).send({error: `Invalid body property: ${prop}`});
                return;
            } else {
                await updateAnnouncement(prop, req.body[prop], req.params.announcementId).catch((err) => {
                    res.status(500).send({ error: 'Unknown error.' });
                });
                if (prop === "status") {
                    await logAction(req.body.status, req.params.announcementId, '1');
                }
                if (res.statusCode === 500) {
                    return;
                }
            }
        }
    }
    await updateAnnouncement("lastchangetime", new Date(Date.now()).toISOString(), req.params.announcementId).catch((err) => {
        res.status(500).send({ error: 'Unknown error.' });
    });
    if (res.statusCode === 500) {
        return;
    }
    getAnnouncements(`announcementid = '${req.params.announcementId}'`).then((query) => {
        res.status(200).send({ announcementId: req.params.announcementId, status: query.rows[0].status });
    }).catch((err) => {
        res.status(500).send({ error: 'Unknown error.' });
    });
});

// delete endpoint to remove announcements
router.delete('/:announcementId', async function(req, res, next) {
    deleteAnnouncement(req.params.announcementId).then((query) => {
        if (query.rows.length < 1) {
            res.status(404).send({error: `Announcement with id ${req.params.announcementId} not found.`});
        } else {
            res.status(200).send({});
        }
    }).catch((err) => {
        res.status(500).send({ error: 'Unknown error.' });
    });
});

module.exports = router;