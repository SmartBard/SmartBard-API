const {
    executeQuery
} = require('./connect');

async function getAnnouncements(cols, vals) {
    if (cols.length !== vals.length) {
        throw new Error('Invalid args');
    }
    let text = 'SELECT * FROM announcements';
    let values = [];
    if (cols.length > 0) {
        text += ' WHERE ';
        let argNum = 1;
        for (let i = 0; i < cols.length; i++) {
            if (cols[i] === 'datefrom') {
                if (vals[i] === null) {
                    text += 'datefrom > now()'
                } else {
                    text += `datefrom > $${argNum}`;
                    argNum += 1;
                }
            } else if (cols[i] === 'dateto') {
                if (vals[i] === null) {
                    text += 'dateto < now()'
                } else {
                    text += `dateto < $${argNum}`;
                    argNum += 1;
                }
            } else {
                text += `${cols[i]} = $${argNum}`;
                argNum += 1;
            }
            if (i < cols.length - 1) {
                text += ` AND `;
            }
            if (vals[i] !== null) {
                values.push(vals[i]);
            }
        }
    }
    const selectQuery = {
        text: `${text};`,
        values: values,
    }
    return await executeQuery(selectQuery);
}
    
// pg-promise might have functionality for inserting into a table
// for now, pass two strings? Or use a map with key value pair?
async function createAnnouncement(vals) {
    if (vals.length !== 11) {
        throw new Error('Invalid parameter');
    }
    const insertQuery = {
        text: `INSERT INTO announcements (title, body, media, datefrom, dateto, userid, status, priority, lastchangetime, lastchangeuser, creationtime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`,
        values: vals
    }
    return await executeQuery(insertQuery);
}

// Possible Exceptions:
// 1. column doesn't exist
// 2. if updating status and provide value that isn't within ENUM set
// 3. invalid id provided
// 4. general exception: strings have to be encased in double quotes e.g. "'APPROVED'"
async function updateAnnouncement(column, newValue, id) {
    const updateQuery = {
        text: `UPDATE announcements SET ${column} = $1 WHERE announcementid = $2;`,
        values: [newValue, id]
    }
    return await executeQuery(updateQuery);
}

async function deleteAnnouncement(id) {
    const deleteQuery = {
        text: 'DELETE FROM announcements WHERE announcementid = $1 RETURNING *;',
        values: [id]
    }
    return await executeQuery(deleteQuery);
}

// returns last change time and last change user when provided with id
// Could call this when user makes a change. How to track changes, event listener?
async function getUserActivity(id) {
    const dateChangedQuery = {
        text: 'SELECT lastchangetime, lastchangeuser FROM announcements WHERE userid = $1',
        values: [id]
    }
    return await executeQuery(dateChangedQuery);
}

module.exports = {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getUserActivity
};