const express = require('express');
const path = require('path');
const fs = require('fs');
const tokenValidator = require('../services/auth/token-validation');

const router = express.Router();

const {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../db/db-announcements-interface');
const { removeLogsOfAnnouncement } = require('../db/db-auditlog-interface');
const { logAction } = require('../services/log/auditlog');
const cloudWatchLogger = require('../services/log/cloudwatch');

const GET_QUERY_PARAMS = ["category", "datefrom", "dateto", "status", "priority"];
const POST_BODY_FORMAT = {
    "title": "string",
    "body": "string",
    "media": "string",
    "datefrom": "string",
    "dateto": "string",
    "priority": "boolean"
}
const PUT_BODY_FORMAT = {
    "title": "string",
    "body": "string",
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
} = require('../services/assets/s3-connect');
const {getUserByEmail} = require("../db/db-user-interface");

//temp values
var s3Object = createS3Object(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY, process.env.AWS_REGION);
const s3Bucket = process.env.S3_IMAGE_ACCESS_POINT;
const imageBaseUrl = process.env.S3_IMAGE_BASE_URL;

// get endpoint for all announcements
router.get('/', async function(req, res, next) {
    // validating query parameters
    let cols = [];
    let vals = [];
    for (const prop in req.query) {
        if (req.query.hasOwnProperty(prop)) {
            if (!GET_QUERY_PARAMS.includes(prop)) {
                res.status(400).send({ error: `Invalid query parameter: ${prop}` });
                return;
            }
            cols.push(prop);
            vals.push(req.query[prop]);
        }
    }
    if (!cols.includes("datefrom") && !cols.includes("dateto")) {
        cols.push('datefrom');
        vals.push(null);
        cols.push('dateto');
        vals.push(null);
    }
    if (!cols.includes("status")) {
        cols.push('status');
        vals.push('approved');
    }
    await getAnnouncements(cols, vals).then((query) => {
        res.status(200).send(query.rows);
    }).catch((err) => {
        cloudWatchLogger.logger.error(err);
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

    let s3Success = true;
    let dbSuccess = true;

    // Uploading media to assets bucket
    let responseBody = {};
    let mediaKey = '';
    if (req.body.media) {
        mediaKey = `uploaded-assets/media/${path.basename(req.body.media)}`;
        await uploadObjectToS3(s3Object, s3Bucket, mediaKey).then(() => {
            responseBody['Upload'] = 'Success';
            fs.rmSync(path.join(process.cwd(), `uploaded-assets/media/${path.basename(req.body.media)}`));
        }).catch((err) => {
            s3Success = false;
            responseBody['Upload'] = 'Failed';
            console.log(err);
        });
    }

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
    
    // Updating Database
    const changeTime = new Date(Date.now()).toISOString();
    const status = "requested";
    const mediaS3Path = mediaKey.length > 0 ? `${imageBaseUrl}/${mediaKey}` : '';
    const vals = [req.body.title, req.body.body, mediaS3Path, req.body.datefrom, req.body.dateto, userId, status, req.body.priority, changeTime, userId, changeTime];
    await createAnnouncement(vals).then(async (query) => {
        await logAction(status, query.rows[0].announcementid, userId);
        responseBody['announcementId'] = query.rows[0].announcementid;
        responseBody['status'] = status;
    }).catch((err) => {
        dbSuccess = false;
        responseBody['Create'] = "Failed";
        cloudWatchLogger.logger.error(err);
        console.log(err);
    });

    if (dbSuccess && s3Success) {
        res.status(200).send(responseBody);
    } else {
        res.status(500).send(responseBody);
    }
});

// get endpoint for particular announcement
router.get('/:announcementId', async function(req, res, next) {
    await getAnnouncements(['announcementid'], [req.params.announcementId]).then((query) => {
        if (query.rows.length < 1) {
            res.status(404).send({error: `Announcement with id ${req.params.announcementId} not found`});
        } else {
            res.status(200).send(query.rows[0]);
        }
    }).catch((err) => {
        cloudWatchLogger.logger.error(err);
        console.log(err);
        res.status(500).send({error: 'Unknown error.'});
    });
});

// put endpoint to edit a particular announcement
router.put('/:announcementId', async function(req, res, next) {
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

    const announcement = await getAnnouncements(['announcementid'], [req.params.announcementId]).then(async (query) => {
        if (query.rows.length < 1) {
            res.status(404).send({error: `Announcement with id ${req.params.announcementId} not found`});
            return null;
        } else {
            // i am so sorry if someone has to maintain this validation
            if (query.rows[0].userid !== userId) {
                // only admins should be able to edit a post that is not theirs
                if (await tokenValidator.isUserAdmin(req.header('Authorization').split(' ')[1])) {
                    return query.rows[0];
                } else {
                    res.status(401).send({error: `You do not have permission to perform this action!`});
                    return null;
                }
            } else {
                // admins can do whatever they want to their own post
                if (await tokenValidator.isUserAdmin(req.header('Authorization').split(' ')[1])) {
                    return query.rows[0];
                }
                // stop users from approving their own posts
                if (req.body.hasOwnProperty('status') && !await tokenValidator.isUserAdmin(req.header('Authorization').split(' ')[1])) {
                    res.status(401).send({error: `You do not have permission to perform this action!`});
                    return null;
                } else {
                    // dont allow users to edit posts that are already approved
                    if (query.rows[0].status === 'approved') {
                        res.status(401).send({error: `You do not have permission to perform this action!`});
                        return null;
                    }
                    return query.rows[0];
                }
            }
        }
    });

    if (announcement == null) {
        return;
    }

    // validating request body
    for (const prop in req.body) {
        if (req.body.hasOwnProperty(prop)) {
            if (!(prop in PUT_BODY_FORMAT)) {
                res.status(400).send({error: `Invalid body property: ${prop}`});
                return;
            } else {
                await updateAnnouncement(prop, req.body[prop], req.params.announcementId).catch((err) => {
                    cloudWatchLogger.logger.error(err);
                    res.status(500).send({ error: 'Unknown error.' });
                });
                if (prop === "status") {
                    await logAction(req.body.status, req.params.announcementId, userId);
                }
                if (res.statusCode === 500) {
                    return;
                }
            }
        }
    }

    dbSuccess = true;
    s3Success = true;
    let responseBody = {};

    await updateAnnouncement("lastchangetime", new Date(Date.now()).toISOString(), req.params.announcementId).catch((err) => {
        responseBody['Error'] = 'Unknown Error Updating Announcement';
        cloudWatchLogger.logger.error(err);
        console.log(err);
        res.status(500).send(responseBody);
    });
    if (res.statusCode === 500) {
        return;
    }

    await updateAnnouncement("lastchangeuser", userId, req.params.announcementId).catch((err) => {
        responseBody['Error'] = 'Unknown Error Updating Announcement';
        cloudWatchLogger.logger.error(err);
        console.log(err);
        res.status(500).send(responseBody);
    });
    if (res.statusCode === 500) {
        return;
    }

    await getAnnouncements(['announcementid'], [req.params.announcementId]).then((query) => {
        responseBody['announcementId'] = req.params.announcementId;
        responseBody['status'] = query.rows[0].status;
    }).catch((err) => {
        responseBody['Error'] = 'Unknown Error Getting Announcement';
        cloudWatchLogger.logger.error(err);
        res.status(500).send({ error: 'Unknown error.' });
    });
    if (res.statusCode === 500) {
        return;
    }

    // edit object in assets if media has changed
    if (req.body.media){
        const mediaKey = `uploaded-assets/media/${path.basename(req.body.media)}`;

        await uploadObjectToS3(s3Object, s3Bucket, mediaKey, req.body.media).then(async () => {
            responseBody['Upload New Media'] = 'Success';
            fs.rmSync(path.join(process.cwd(), mediaKey));
            await updateAnnouncement('media', `${imageBaseUrl}/${mediaKey}`, req.params.announcementId);
        }).catch((err) => {
            uploadSuccess = false;
            responseBody['Upload New Media'] = 'Failed';
            console.log(err);
        });
    }

    // Send Response
    if (s3Success && dbSuccess){
        res.status(200).send(responseBody);
    } else {
        res.status(500).send(responseBody);
    }

});

// delete endpoint to remove announcements
router.delete('/:announcementId', async function(req, res, next) {
    let responseBody = {};
    let s3Success = true;
    let dBSuccess = true;

    if (!await tokenValidation.isUserAdmin(req.header('Authorization').split(' ')[1])) {
        res.status(401).send({error: 'You do not have permission to perform this action!'});
        return;
    }

    // getting media associated with announcement
    let s3Path = '';
    await getAnnouncements(['announcementid'], [req.params.announcementId]).then((query) => {
        s3Path = query.rows[0].media;
    }).catch((err) => {
        console.log(err);
        cloudWatchLogger.logger.error(err);
    });

    // deleteing object from assets bucket
    if (s3Path) {
        await deleteS3Object(s3Object, s3Path).then(() => {
            responseBody["S3 Deletion"] = ['Success'];
        }).catch((err) => {
            s3Success = false;
            responseBody["S3 Deletion"] = ['Failed'];
            console.log(err);
            cloudWatchLogger.logger.error(err);
        });
    }
    // deleting announcements also requires to remove all logs related to it
    await removeLogsOfAnnouncement(req.params.announcementId).catch((err) => {
        cloudWatchLogger.logger.error(err);
        console.log(err);
        res.status(500).send({ error: 'Unknown error.' });
    });
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
        cloudWatchLogger.logger.error(err);
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