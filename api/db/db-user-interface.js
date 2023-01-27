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
  executeQuery(selectUsers, res);

  // using promises
  // ;(async function () {
  //   const client = await pool.connect()
  //   await client.query(selectUsers)
  //   client.release()
  // })()
}
  
// const getUserById = (req) => {
function getUserById(req, res, next) {
  const selectUserById = `SELECT * FROM userstest WHERE userid=${req.params.id}`;
  executeQuery(selectUserById, res);
}

function executeQuery(query, res) {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query(query, (err, result) => {
      release();
      if (err) {
        return console.error('Error executing query', err.stack);
      }
      console.log(result.rows);
      res.status(200).send(result.rows);
    })
  })
  // Cannot call pool.end more than once. Would have to create an entirely new pool...
  // pool.end((err) => {
  //   console.log('client has disconnected');
  //   // res.status(200).send('client has disconnected');
  //   if (err) {
  //     console.log('error during disconnection', err.stack);
  //   }
  // })
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