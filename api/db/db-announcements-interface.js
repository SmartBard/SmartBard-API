// controller for db announcement table functions

const {
    executeQuery
} = require('./connect');

async function getAnnouncements() {
    const selectUserById = `SELECT * FROM announcementstest`;
    return await executeQuery(selectUserById);
  }
    
// pg-promise might have functionality for inserting into a table
// for now, pass two strings? Or use a map with key value pair?
async function createAnnouncement(columns, values) {
    const insert = `INSERT INTO announcementstest (${columns}) VALUES (${values})`;
    return await executeQuery(insert);
}

// Possible Exceptions:
// 1. column doesn't exist
// 2. if updating status and provide value that isn't within ENUM set
// 3. invalid id provided
// 4. general exception: strings have to be encased in double quotes e.g. "'APPROVED'"
async function updateAnnouncement(column, newValue, id) {
    const update = `UPDATE announcementstest SET ${column} = ${newValue} WHERE announcementid = ${id}`;
    console.log(update);
    return await executeQuery(update);
}

module.exports = {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement
};