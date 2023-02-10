const {
    executeQuery
} = require('./connect');

async function getUserSettings() {
    const selectUserSettings = `SELECT * FROM user_settings`;
    return await executeQuery(selectUserSettings);
}

async function createUserSettings(columns, values) {
    const insertUserSettings = `INSERT INTO user_settings (${columns}) VALUES (${values})`;
    return await executeQuery(insertUserSettings);
}

module.exports = {
    getUserSettings,
    createUserSettings
}