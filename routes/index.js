const express = require('express');
const router = express.Router();

/* Sample Hello World Endpoint */
router.get('/', function(req, res, next) {
  res.send({ message: "Hello World!"});
});

module.exports = router;
