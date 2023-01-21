//controller for db related functions

const {
  pool
}  = require('./connect');

// Note: Queries stored as var and passed into functions instead of string to avoid sql injection vulnerability.
// Note: 'title is not defined' error due to rows (or some var) not initialized.

// const getUsers = (req, res, next) => {
function getUsers(req, res, next) {
  const selectUsers = {
      text: `SELECT * FROM userstest`,
      // rowMode: `array`
  };

  pool.connect();
  pool.query(selectUsers, (err, result) => {
    if (!err) {
      console.log(result.rows)
      res.status(200).send(result.rows)
    } else {
      console.log(err.message)
    }
  })
}
  
// const getUserById = (req) => {
function getUserById(req, res, next) {
  const selectUserById = `SELECT * FROM userstest WHERE userid=${req.params.id}`;

  pool.connect();
  pool.query(selectUserById, (err, result) => {
    if (!err) {
      // console.log(result.rows)
      res.status(200).send(result.rows)
    } else {
      console.log(err.message)
    }
  })
}
  
  // function createAnnouncement()
  // INSERT INTO
  
  // function updateAnnouncement()
  // command to edit data in tables?
  
  // function logUserActivity()...
  
  module.exports = {
    getUsers,
    getUserById
  }