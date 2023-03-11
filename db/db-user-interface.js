// Note: 'title is not defined' error due to rows (or some var) not initialized.

const types = require('pg').types;
const { executeQuery }  = require('./connect');

// investigate pg-promise library arg processing to avoid SQL injection
// await db.any(SELECT * FROM table WHERE $1 and $2, [1, 10])
async function getUserById(id) {
  const selectByIdQuery = {
    text: 'SELECT * FROM users WHERE userid = $1;',
    values: [id]
  }
  return await executeQuery(selectByIdQuery);
}

async function getUserByEmail(email) {
  const selectByEmailQuery = {
    text: 'SELECT * FROM users WHERE email = $1;',
    values: [email]
  }
  return await executeQuery(selectByEmailQuery);
}

async function createNewUser(vals) {
  if (vals.length !== 5) {
    throw new Error('Invalid parameter');
  }
  const insertQuery = {
    text: 'INSERT INTO USERS (cognitoid, firstname, lastname, email, admin) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
    values: vals
  }
  return await executeQuery(insertQuery);
}

module.exports = {
  getUserById,
  getUserByEmail,
  createNewUser
}