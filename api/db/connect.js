//This file contains code to connect to a local PostgreSQL database.
//It also serves as a controller for db related tasks/functions

require('dotenv').config()
const {Client} = require('pg')

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: process.env.PASSWORD,
    database: 'test'
})
client.connect();

//Queries stored as var and passed into functions instead of string to avoid sql injection vulnerability.

const getUsers = (req, res) => {
    selectUsers = `SELECT * FROM userstest`
    rows;
    
    client.query(selectUsers, (err, res) => {
        if(!err){
            console.log(res.rows)
            rows = res.rows
        } else {
            console.log(err.message)
        }
        client.end()
    })
    res.status(200).send(rows)
}

const getUserById = (req) => {
    selectUserById = `SELECT * FROM userstest WHERE userid=${req.params.id}`
    client.query(selectUserById, (err, res) => {
        if(!err){
            console.log(res.rows)
            res.status(200).json({ user: res.rows })
        } else {
            console.log(err.message)
        }
        client.end()
    })
}

//module.exports = client;
module.exports = {
    getUsers,
    getUserById
}