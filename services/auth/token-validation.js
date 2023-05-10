const { CognitoJwtVerifier } = require('aws-jwt-verify');
const {getUserByEmail, createNewUser, updateUser} = require("../../db/db-user-interface");
const cloudWatchLogger = require('../log/cloudwatch');

const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL,
    tokenUse: 'id',
    clientId: process.env.COGNITO_CLIENTID,
});

async function isValidToken(header) {
    const tokenHeader = header.split(' ');
    if (tokenHeader.length !== 2 || tokenHeader[0] !== 'Bearer') {
        return false;
    }
    try {
        const payload = await verifier.verify(tokenHeader[1]);
        return await initializeUserIfNotExist(payload);
    } catch(err) {
        console.log(err);
        return false;
    }
}

async function getUserEmailFromToken(token) {
    try {
        const payload = await verifier.verify(token);
        return payload.email;
    } catch(err) {
        return "";
    }
}

async function isUserAdmin(token) {
    try {
        const payload = await verifier.verify(token);
        return payload['cognito:groups'].includes('Admins');
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function initializeUserIfNotExist(jwtPayload) {
    const user = await getUserByEmail(jwtPayload.email).then((query) => {
        if (query.rows.length > 0) {
            return query.rows[0];
        } else {
            return {};
        }
    }).catch((err) => {
        console.log(err);
        cloudWatchLogger.logger.error(err);
        return false;
    });
    if (user === null) {
        return false;
    }
    const cognitoId = jwtPayload['cognito:username'];
    const firstName = jwtPayload['given_name'];
    const lastName = jwtPayload['family_name'];
    const email = jwtPayload['email'];
    const isAdmin = jwtPayload['cognito:groups'].includes('Admins');
    if (Object.keys(user).length < 1) {
        return await createNewUser([cognitoId, firstName, lastName, email, isAdmin]).then((query) => {
            return query.rows.length > 0;
        }).catch((err) => {
            console.log(err);
            cloudWatchLogger.logger.error(err);
            return false;
        });
    } else {
        return await updateUser([firstName, lastName, isAdmin, email]).then((query) => {
            return query.rows.length > 0;
        }).catch((err) => {
            console.log(err);
            cloudWatchLogger.logger.error(err);
            return false;
        });
    }
}

module.exports = {
    isValidToken,
    getUserEmailFromToken,
    isUserAdmin
}