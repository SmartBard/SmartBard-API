// controller for db user table functions
// Note: Queries stored as var and passed into functions instead of string to avoid sql injection vulnerability.
// Note: 'title is not defined' error due to rows (or some var) not initialized.
var types = require('pg').types;
const { executeQuery }  = require('./connect');
// types.arrayParser
// parsePointArray
//  types.setTypeParser(20, function(val) {
//   return array.parse(val, parsePoint);
// })

function getUsers() {
  const selectUsers = {
      text: `SELECT * FROM userstest`,
      // types: {
      //   getTypeParser: () => val => val,
      // }
      // rowMode: `array`
  };
  executeQuery(selectUsers);

  // using promises
  // ;(async function () {
  //   const client = await pool.connect()
  //   await client.query(selectUsers)
  //   client.release()
  // })()
}

function getUserById(req, next) {
  const selectUserById = `SELECT * FROM userstest WHERE userid=${req.params.id}`;
  executeQuery(selectUserById);
}
  
// function logUserActivity()...

module.exports = {
  getUsers,
  getUserById
}