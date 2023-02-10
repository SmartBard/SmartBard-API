const {
    executeQuery
} = require('./connect');

async function getUserSettings() {
    const selectUserSettings = `SELECT * FROM user_settings`;
    return await executeQuery(selectUserSettings);
}

module.exports = {
    getUserSettings
}