var express = require('express');
var router = express.Router();

const {
    endConnection
} = require('../db/connect');

router.route('/').get(endConnection);

module.exports = router;