//This file contains code to connect to a local PostgreSQL database.

require('dotenv').config();
const {Client} = require('pg');

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  port: 5432,
  password: process.env.PASSWORD,
  database: 'test'
});

 module.exports = client;