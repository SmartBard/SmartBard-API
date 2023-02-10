const {
    executeQuery
} = require('./connect');

async function getAnnouncements() {
    const selectAnnouncements = `SELECT * FROM announcements`;
    return await executeQuery(selectAnnouncements);
  }
    
// pg-promise might have functionality for inserting into a table
// for now, pass two strings? Or use a map with key value pair?
async function createAnnouncement(columns, values) {
    const insert = `INSERT INTO announcements (${columns}) VALUES (${values})`;
    return await executeQuery(insert);
}

// Possible Exceptions:
// 1. column doesn't exist
// 2. if updating status and provide value that isn't within ENUM set
// 3. invalid id provided
// 4. general exception: strings have to be encased in double quotes e.g. "'APPROVED'"
async function updateAnnouncement(column, newValue, id) {
    const update = `UPDATE announcements SET ${column} = ${newValue} WHERE announcementid = ${id}`;
    return await executeQuery(update);
}

// returns last change time and last change user when provided with id
// Could call this when user makes a change. How to track changes, event listener?
async function getUserActivity(id) {
    const getDateChanged = `SELECT last_change_time, last_change_user FROM announcements WHERE userid=${id}`;
    return await executeQuery(getDateChanged);
}

module.exports = {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    getUserActivity
};