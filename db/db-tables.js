const { executeQuery } = require('./connect');

async function createAllTables() {
    await createStatus();
    await createUsersTable();
    await createAnnouncementsTable();
    await createAuditLogTable();
    await createUserSettingsTable();
}

async function createStatus() {
    const createQuery = {
        text: 'DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = \'status\') THEN CREATE TYPE status AS ENUM (\'requested\', \'approved\', \'denied\', \'changes\'); END IF; END$$;'
    }
    return await executeQuery(createQuery);
}

async function createUsersTable() {
    const createQuery = {
        text: 'CREATE TABLE IF NOT EXISTS users(userid serial primary key, cognitoid text, firstname text, lastname text, email text, admin boolean);'
    }
    return await executeQuery(createQuery);
}

async function createAnnouncementsTable() {
    const createQuery = {
        text: 'CREATE TABLE IF NOT EXISTS announcements(announcementid serial primary key, title text, body text, media text, datefrom timestamp, dateto timestamp, userid serial references users(userid), status status, priority boolean, lastchangetime timestamp, lastchangeuser serial references users(userid), creationtime timestamp);'
    }
    return await executeQuery(createQuery);
}

async function createAuditLogTable() {
    const createQuery = {
        text: 'CREATE TABLE IF NOT EXISTS auditlog(actionid serial primary key, announcementid serial references announcements(announcementid), actiontime timestamp, userid serial references users(userid), actiontype status);'
    }
    return await executeQuery(createQuery);
}

async function createUserSettingsTable() {
    const createQuery = {
        text: 'CREATE TABLE IF NOT EXISTS usersettings(settingsid serial primary key, userid serial references users(userid), textsize integer, brightness integer, contrast integer, volume integer, delay integer, primarycolor text, secondarycolor text);'
    }
    return await executeQuery(createQuery);
}

module.exports = {
    createAllTables
}