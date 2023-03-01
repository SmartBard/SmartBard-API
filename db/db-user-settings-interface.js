const { query } = require('express');
const {
  executeQuery
} = require('./connect');

async function getUserSettings(user) {
  let selectUserSettings = `SELECT * FROM usersettings WHERE userid = ${user};`;
  return await executeQuery(selectUserSettings);
}

async function getUserSettingsById(settingsId) {
  const selectSettingById = `SELECT * FROM usersettings WHERE settingsid = ${settingsId};`;
  return await executeQuery(selectSettingById);
}

async function createUserSettings(columns, values) {
  const insertUserSettings = `INSERT INTO usersettings (${columns}) VALUES (${values}) RETURNING *;`;
  return await executeQuery(insertUserSettings);
}

async function updateUserSettings(column, newValue, settingsId) {
  const setUserSettings = `UPDATE usersettings SET ${column} = ${newValue} WHERE settingsid = ${settingsId};`;
  return await executeQuery(setUserSettings);
}

async function deleteUserSettings(userId) {
  const deleteSetting = `DELETE FROM usersettings WHERE userId = ${userId} RETURNING *;`;
  return await executeQuery(deleteSetting);
}

module.exports = {
  getUserSettings,
  getUserSettingsById,
  createUserSettings,
  updateUserSettings,
  deleteUserSettings
}