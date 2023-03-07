const express = require('express');
const path = require('path');

const router = express.Router();

const {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../db/db-announcements-interface');

const GET_QUERY_PARAMS = ["category", "datefrom", "dateto", "status"];
const POST_BODY_FORMAT = {
    "title": "string",
    "media": "string",
    "datefrom": "string",
    "dateto": "string",
    "priority": "boolean"
}
const PUT_BODY_FORMAT = {
    "title": "string",
    "media": "string",
    "datefrom": "string",
    "dateto": "string",
    "priority": "boolean",
    "status": "string"
}

const {
    createS3Object,
    uploadObjectToS3,
    deleteS3Object,
    getS3Object
} = require('../assets-service/s3-connect');

//temp values
var s3Object = createS3Object('AKIAQGDVBYLOXYMHHVSK', 'cwVP/H26m0iy2d2OO1acaFouPlhGHUKzgZ/u/jSD');
const s3Bucket = 'arn:aws:s3:us-east-1:013130384093:accesspoint/smbd-test-point';

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

    // Uploading media to s3 bucket
    var responseBody = new Object();
    let uploadSuccess = true;
    if (req.body.media) {
        var mediaKey = `assets/someid/${path.basename(req.body.media)}`;
        await uploadObjectToS3(s3Object, s3Bucket, mediaKey, req.body.media).then(() => {
            responseBody['Upload'] = 'Success';
        }).catch((err) => {
            uploadSuccess = false;
            responseBody['Upload'] = 'Failed';
            console.log(err);
        });
    };
    
    // Updating Database
    const changeTime = new Date(Date.now()).toISOString();
    const status = "requested";
    const mediaS3Path = s3Bucket + mediaKey;
    let createSuccess = true;
    await createAnnouncement("title, body, media, datefrom, dateto, userid, status, priority, lastchangetime, lastchangeuser, creationtime", `'${req.body.title}', '${req.body.body}', '${mediaS3Path}', '${req.body.datefrom}', '${req.body.dateto}', '1', '${status}', '${req.body.priority}', '${changeTime}', '1', '${changeTime}'`).then((query) => {
        responseBody['announcementId'] = query.rows[0].announcementId;
        responseBody['status'] = status;
    }).catch((err) => {
        createSuccess = false;
        responseBody['Create'] = "Failed";
        console.log(err);
    });

    // Send Response
    if (uploadSuccess && createSuccess){
        res.status(200).send(responseBody);
    } else {
        res.status(500).send(responseBody);
    }
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
        res.status(200).write({ announcementId: req.params.announcementId, status: query.rows[0].status });
    }).catch((err) => {
        res.status(500).write({ error: 'Unknown error.' });
    });

    // edit object in s3 if media has changed
    // is there a need to delete the old object from s3? since the s3 path in db changed, the old one won't be referenced anymore
    if (req.body.hasOwnProperty('media')){
        uploadObjectToS3(s3Object, s3Bucket, req.body.media, req.body.media).then(() => {
            res.status(200).write({ uploaded : key});
        }).catch((err) => {
            res.status(500).write({ error: 'New Media Failed to Upload' });
        });
    }

    res.end();

});

// delete endpoint to remove announcements
router.delete('/:announcementId', async function(req, res, next) {
    var responseBody = new Object();
    let s3Success = true;
    let dBSuccess = true;

    // deleteing object from s3 bucket
    if (req.params.key) {
        await deleteS3Object(s3Object, s3Bucket, req.params.key).then(() => {
            responseBody["S3 Deletion"] = ['Success'];
        }).catch((err) => {
            s3Success = false;
            responseBody["S3 Deletion"] = ['Failed'];
            console.log(err);
        });
    }

    await deleteAnnouncement(req.params.announcementId).then((query) => {
        if (query.rows.length < 1) {
            dBSuccess = false;
            responseBody["Error"] = `Announcement with id ${req.params.announcementId} not found.`;
        } else {
            responseBody["DB Deletion"] = ['Success'];
        }
    }).catch((err) => {
        dBSuccess = false;
        responseBody["DB Deletion"] = ['Unknown error.'];
        console.log(err);
    });

    // Send Response
    if (s3Success && dBSuccess){
        res.status(200).send(responseBody);
    } else {
        res.status(500).send(responseBody);
    }
    
});

module.exports = router;