#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER smartbarduser;
  GRANT ALL PRIVILEGES ON DATABASE smartbard TO smartbarduser;
  CREATE TYPE status AS ENUM ('requested', 'approved', 'denied', 'changes');
  CREATE TABLE users(userid serial primary key, cognitoid text, firstname text, lastname text, email text, admin boolean);
  CREATE TABLE announcements(announcementid serial primary key, title text, body text, media text, datefrom timestamp, dateto timestamp, userid serial references users(userid), status status, priority boolean, lastchangetime timestamp, lastchangeuser serial references users(userid), creationtime timestamp);
  CREATE TABLE auditlog(actionid serial primary key, announcementid serial references announcements(announcementid), actiontime timestamp, userid serial references users(userid), actiontype status);
  CREATE TABLE usersettings(settingsid serial primary key, userid serial references users(userid), textsize integer, brightness integer, contrast integer, volume integer, delay integer, primarycolor text, secondarycolor text);
EOSQL