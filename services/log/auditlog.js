const { addLog } = require('../../db/db-auditlog-interface');

const ALLOWED_ACTIONS = ['requested', 'approved', 'denied', 'changes'];

async function logAction(action, announcementId, user) {
    if (!ALLOWED_ACTIONS.includes(action)) {
        throw new Error('Invalid action for log.');
    }
    const actionTime = new Date(Date.now()).toISOString();
    let err = false;
    await addLog(announcementId, actionTime, user, action).then((query) => {
        if (query.rows.length < 1) {
            err = true;
        }
    }).catch((error) => {
        console.log(error);
        err = true;
    })
    return err;
}

module.exports = { logAction };
