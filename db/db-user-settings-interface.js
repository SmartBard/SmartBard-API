const {
  executeQuery
} = require('./connect');

async function getUserSettings() {
  const selectUserSettings = `SELECT * FROM user_settings`;
  return await executeQuery(selectUserSettings);
}

async function getUserSettingsById(settingsId) {
  const selectSettingById = `SELECT * FROM user_settings WHERE settings_id = ${settingsId}`;
  return await executeQuery(selectSettingById);
}

async function createUserSettings(columns, values) {
  const insertUserSettings = `INSERT INTO user_settings (${columns}) VALUES (${values})`;
  return await executeQuery(insertUserSettings);
}

async function updateUserSettings(column, newValue, settingsId) {
  const setUserSettings = `UPDATE user_settings SET ${column} = ${newValue} WHERE settings_id = ${settingsId}`;
  return await executeQuery(setUserSettings);
}

module.exports = {
  getUserSettings,
  getUserSettingsById,
  createUserSettings,
  updateUserSettings
}