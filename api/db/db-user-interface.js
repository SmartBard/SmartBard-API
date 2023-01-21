//controller for db related functions

var client = require('./connect.js');

// Note: Queries stored as var and passed into functions instead of string to avoid sql injection vulnerability.
// Note: 'title is not defined' error due to rows not initialized.

// const getUsers = (req, res, next) => {
function getUsers(req, res, next) {
  const selectUsers = {
      text: `SELECT * FROM userstest`,
      // rowMode: `array`
  };

  client.connect();
  client.query(selectUsers, (err, result) => {

    if (!err) {
      console.log(result.rows)
      res.status(200).send(result.rows)
    } else {
      console.log(err.message)
    }
    client.end((err) => {
      console.log('client has disconnected')
      if (err) {
        console.log('error during disconnection', err.stack)
      }
    })
  })
}
  
  // const getUserById = (req) => {
function getUserById(req, res, next) {
  const selectUserById = `SELECT * FROM userstest WHERE userid=${req.params.id}`;

  client.connect();
  client.query(selectUsers, (err, result) => {

    if (!err) {
      // console.log(result.rows)
      res.status(200).send(result.rows)
    } else {
      console.log(err.message)
    }

    client.end((err) => {
      console.log('client has disconnected')
      if (err) {
        console.log('error during disconnection', err.stack)
      }
    })
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