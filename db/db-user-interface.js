// Note: 'title is not defined' error due to rows (or some var) not initialized.

const types = require('pg').types;
const { executeQuery }  = require('./connect');

async function getUsers() {
  const selectUsers = {
    text: 'SELECT * FROM users;'
  };
  return await executeQuery(selectUsers);
}

// investigate pg-promise library arg processing to avoid SQL injection
// await db.any(SELECT * FROM table WHERE $1 and $2, [1, 10])
async function getUserById(id) {
  const selectByIdQuery = {
    text: 'SELECT * FROM users WHERE userid = $1;',
    values: [id]
  }
  return await executeQuery(selectByIdQuery);
}

module.exports = {
  getUsers,
  getUserById
}