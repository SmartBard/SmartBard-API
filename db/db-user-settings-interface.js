const { query } = require('express');
const {
  executeQuery
} = require('./connect');

async function getUserSettings(user) {
  const selectQuery = {
    text: 'SELECT * FROM usersettings WHERE userid = $1;',
    values: [user]
  }
  return await executeQuery(selectQuery);
}

async function getUserSettingsById(settingsId) {
  const selectByIdQuery = {
    text: 'SELECT * FROM usersettings WHERE settingsid = $1;',
    values: [settingsId]
  }
  return await executeQuery(selectByIdQuery);
}

async function createUserSettings(vals) {
  if (vals.length !== 8) {
    throw new Error('Invalid parameter.');
  }
  const insertQuery = {
    text: 'INSERT INTO usersettings (userid, textsize, brightness, contrast, volume, delay, primarycolor, secondarycolor) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
    values: vals
  }
  return await executeQuery(insertQuery);
}

async function updateUserSettings(column, newValue, userId) {
  const updateQuery = {
    text: `UPDATE usersettings SET ${column} = $1 WHERE userid = $2;`,
    values: [newValue, userId]
  }
  return await executeQuery(updateQuery);
}

async function deleteUserSettings(userId) {
  const deleteQuery = {
    text: 'DELETE FROM usersettings WHERE userId = $1 RETURNING *;',
    values: [userId]
  }
  return await executeQuery(deleteQuery);
}

module.exports = {
  getUserSettings,
  getUserSettingsById,
  createUserSettings,
  updateUserSettings,
  deleteUserSettings
}