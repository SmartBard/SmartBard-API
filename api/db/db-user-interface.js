// controller for db user table functions
// Note: Queries stored as var and passed into functions instead of string to avoid sql injection vulnerability.
// Note: 'title is not defined' error due to rows (or some var) not initialized.

const { 
  executeQuery
 }  = require('./connect');

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

function getUserById(req, res, next) {
  const selectUserById = `SELECT * FROM userstest WHERE userid=${req.params.id}`;
  executeQuery(selectUserById, res);
}
  
// function logUserActivity()...

module.exports = {
  getUsers,
  getUserById
}