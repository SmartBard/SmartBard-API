const { executeQuery } = require('./connect');

async function addLog(id, time, user, type) {
    const insertQuery = {
        text: 'INSERT INTO auditlog (announcementid, actiontime, userid, actiontype) VALUES ($1, $2, $3, $4) RETURNING *;',
        values: [id, time, user, type]
    }
    return await executeQuery(insertQuery);
}

async function retrieveLogPage(page) {
    const selectQuery = {
        text: 'SELECT * FROM auditlog ORDER BY actiontime desc LIMIT 20 OFFSET $1;',
        values: [20 * page]
    }
    return await executeQuery(selectQuery);
}

async function removeLogsOfAnnouncement(announcementId) {
    const deleteQuery = {
        text: 'DELETE FROM auditlog WHERE announcementid = $1;',
        values: [announcementId]
    }
    return await executeQuery(deleteQuery);
}

module.exports = {
    addLog,
    retrieveLogPage,
    removeLogsOfAnnouncement
}