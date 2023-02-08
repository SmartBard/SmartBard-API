const express = require('express');
const router = express.Router();

const {
    endConnection
} = require('../db/connect');

router.route('/').get(endConnection);

module.exports = router;