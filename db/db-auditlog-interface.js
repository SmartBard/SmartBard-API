const { executeQuery } = require('./connect');

async function addLog(id, time, user, type) {
    const logInsert = `INSERT INTO auditlog (announcementid, actiontime, userid, actiontype) VALUES ('${id}', '${time}', '${user}', '${type}') RETURNING *;`;
    return await executeQuery(logInsert);
}

async function retrieveLogPage(page) {
    const logQuery = `SELECT * FROM auditlog ORDER BY actiontime desc LIMIT 20 OFFSET ${20 * page};`;
    return await executeQuery(logQuery);
}

module.exports = {
    addLog,
    retrieveLogPage,
}