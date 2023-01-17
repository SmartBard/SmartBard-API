var express = require('express');
var router = express.Router();

const {
  getUsers,
  getUserById
  // testFunc
} = require('../db/connect.js');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// router.route('/').get(function(req, res, next) {
//     res.send('respond with a resource');
//   });
// router.route('/').get(testFunc);
router.route('/').get(getUsers);
router.route('/:id').get(getUserById);

module.exports = router;
