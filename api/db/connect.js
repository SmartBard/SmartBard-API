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
  var r = 10;

  // using callback
  // pool.connect((err, client, release) => {
  //   if (err) {
  //     return console.error('Error acquiring client', err.stack);
  //   }
  //   client.query(queryString, (err, result) => {
  //     release();
  //     if (err) {
  //       return console.error('Error executing String', err.stack);
  //     }
  //     console.log(result.rows);
  //     // console.log(JSON.parse(result.rows[0]));
  //     // res.status(200).send(result.rows);
  //     r = result.rows;
  //   })
  // })

  // using async
  try {
    const client = await pool.connect();
    r = await client.query(queryString);
    console.log(r.rows);
    client.release();
  } catch (error) {
    console.log(error);
  }
  console.log(r);
  return r;

  // Cannot call pool.end more than once. Would have to create an entirely new pool...
  // pool.end((err) => {
    //   console.log('client has disconnected');
    //   // res.status(200).send('client has disconnected');
    //   if (err) {
    //     console.log('error during disconnection', err.stack);
    //   }
    // })
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