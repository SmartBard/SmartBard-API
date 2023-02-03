//This file contains code to connect to a local PostgreSQL database.

require('dotenv').config();
const { json } = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  port: 5432,
  password: process.env.PASSWORD,
  database: 'test',
  // max: // This allows us to specify max clients?
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

function hi() {
  return "Hello";
}

async function executeQuery(queryString) {
  // Is it bad practice to store results in var instead of const?
  // Or return within try block...
  var res;

  try {
    const client = await pool.connect();
    res = await client.query(queryString);
    await client.release();
  } catch (error) {
    console.log(error);
  }
  // console.log(res.rows);
  
  // Cannot call pool.end more than once. Would have to create an entirely new pool...
  // pool.end((err) => {
    //   console.log('client has disconnected');
    //   // res.status(200).send('client has disconnected');
    //   if (err) {
      //     console.log('error during disconnection', err.stack);
      //   }
      // })
  return res;
}
    
function endConnection(req, res, next) {
  console.log('calling endConnection');
  
  pool.end((err) => {
    console.log('client has disconnected');
    res.status(200).send('client has disconnected');
    if (err) {
      console.log('error during disconnection', err.stack);
    }
  })
}

module.exports = {
  pool,
  executeQuery,
  endConnection,
  hi
};