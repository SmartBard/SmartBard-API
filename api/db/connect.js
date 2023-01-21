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

// const testFunc = (req,res) => {
    //     res.status(200).json({ success: true })
    // }
    
    // Note: 'title is not defined' error due to rows not initialized.
    // const getUsers = (req, res, next) => {
function getUsers(req, res, next) {
    const selectUsers = {
        text: `SELECT * FROM userstest`,
        // rowMode: `array`
    }
    client.query(selectUsers, (err, result) => {
        // client.connect()
        if(!err){
            // console.log(result.rows)
            res.status(200).send(result.rows)
        } else {
            console.log(err.message)
        }
        client.end()
    })
}

// const getUserById = (req) => {
function getUserById(req, res, next) {
    const selectUserById = `SELECT * FROM userstest WHERE userid=${req.params.id}`
    client.query(selectUserById, (err, result) => {
        // client.connect()
        if(!err){
            console.log(result.rows)
            res.status(200).send(result.rows)
        } else {
            console.log(err.message)
        }
        client.end()
    })
}

//module.exports = client;
module.exports = {
    getUsers,
    getUserById,
    // testFunc
}