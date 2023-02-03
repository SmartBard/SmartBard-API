// controller for db announcement table functions

const {
    executeQuery
} = require('./connect');

async function getAnnouncements() {
    const selectUserById = `SELECT * FROM announcementstest`;
    return await executeQuery(selectUserById);
  }
    
// pg-promise might have functionality for inserting into a table
// for now, pass two arrays? Or use a map with key value pair?
async function createAnnouncement() {
    const insert = `INSERT INTO announcementstest (${fields}) VALUES (${values})`;
    return await executeQuery(insert);
}

    // function updateAnnouncement()
    // command to edit data in tables?

module.exports = {
    getAnnouncements
}