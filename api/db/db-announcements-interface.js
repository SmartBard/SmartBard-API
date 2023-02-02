// controller for db announcement table functions

const {
    executeQuery
} = require('./connect');

function getAnnouncements(req, next) {
    const selectUserById = `SELECT * FROM announcementstest`;
    executeQuery(selectUserById);
  }
    
    // function createAnnouncement()
    // INSERT INTO
    
    // function updateAnnouncement()
    // command to edit data in tables?

module.exports = {
    getAnnouncements
}