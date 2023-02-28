const express = require('express');
const router = express.Router();

const { retrieveLogPage } = require('../db/db-auditlog-interface');
const cloudWatchLogger = require('../services/log/cloudwatch');

router.get('/', async function(req, res, next) {
    let page = 0;
    if (req.query.hasOwnProperty("page")) {
        try {
            page = parseInt(req.query.page);
        } catch(err) {
            cloudWatchLogger.logger.error(err);
            res.status(500).send({ error: 'Error parsing page number' });
            return;
        }
    }
    retrieveLogPage(page).then((query) => {
        res.status(200).send(query.rows);
    }).catch((err) => {
        cloudWatchLogger.logger.error(err);
        res.status(500).send({ error: 'Unknown error' });
    });
});

module.exports = router;