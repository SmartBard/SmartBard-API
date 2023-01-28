var express = require('express');
var router = express.Router();

const {
    getAnnouncements
} = require('../db/db-announcements-interface');

router.route('/').get(getAnnouncements);

module.exports = router;