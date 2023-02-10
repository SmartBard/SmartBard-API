const express = require('express');
const router = express.Router();

// get endpoint for user settings
router.get('/', async function(req, res, next) {
    //getUserSettings();
    res.status(200).send('respond with a resource');
});

// post endpoint

// put endpoint

module.exports = router;