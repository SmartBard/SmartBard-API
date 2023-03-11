const { CognitoJwtVerifier } = require('aws-jwt-verify');

const verifier = CognitoJwtVerifier.create({
    userPoolId: 'us-east-1_53MSxTr53',
    tokenUse: 'id',
    clientId: '6t7iieu7iapoadjqj20di1j33h',
});

async function isValidToken(header) {
    const tokenHeader = header.split(' ');
    if (tokenHeader.length !== 2 || tokenHeader[0] !== 'Bearer') {
        return false;
    }
    try {
        const payload = await verifier.verify(tokenHeader[1]);
        console.log(payload);
        return true;
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

module.exports = {
    isValidToken,
    getUserEmailFromToken
}