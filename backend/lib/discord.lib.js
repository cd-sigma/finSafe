async function sendAlert(alert) {
    try {
       throw new Error("Testing error");
    } catch (error) {
        throw error;
    }
}

module.exports = {
    sendAlert: sendAlert
}