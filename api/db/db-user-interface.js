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

async function getUsers() {
  const selectUsers = {
    text: `SELECT * FROM userstest`,
    // text: `SELECT json_agg(userstest) FROM userstest`,
    // text: `SELECT row_to_json(userstest) FROM userstest`,
      // types: {
      //   getTypeParser: () => val => val,
      // }
      // rowMode: `array`
  };

  return await executeQuery(selectUsers);
}

// investigate pg-promise library arg processing to avoid SQL injection
// await db.any(SELECT * FROM table WHERE $1 and $2, [1, 10])
async function getUserById(id, next) {
  // const selectUserById = `SELECT * FROM userstest WHERE userid=${req.params.id}`;
  const selectUserById = `SELECT * FROM userstest WHERE userid=${id}`;
  return await executeQuery(selectUserById);
}

// function logUserActivity()...

module.exports = {
  getUsers,
  getUserById
}