//This file contains code to connect to a local PostgreSQL database.

const { Pool } = require('pg');

require('dotenv').config();
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  port: 5432,
  password: process.env.PASSWORD,
  database: 'test',
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

function endConnection(req, res, next, pool) {
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
  endConnection
};