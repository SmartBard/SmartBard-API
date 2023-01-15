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

const getUsers = (req, res) => {
    client.query(`SELECT * FROM userstest`, (err, res) => {
        if(!err){
            console.log(res.rows);
            //res.status(200).json({ user: res.rows })
        } else {
            console.log(err.message)
        }
        client.end();
    })
}

const getUsersById = (req, res) => {
    client.query(`SELECT * FROM userstest WHERE userid=${req.params.id}`, (err, res) => {
        if(!err){
            console.log(res.rows);
            //res.status(200).json({ user: res.rows })
        } else {
            console.log(err.message)
        }
        client.end();
    })
}

//module.exports = client;
module.exports = {
    getUsers,
    getUsersById
}