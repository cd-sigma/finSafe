const axios = require("axios");
const errorUtil = require("../util/error.util");
const validatorUtil = require("../util/validators.util");

async function sendAlert(webhook, body) {
    try {
        if (validatorUtil.isEmpty(webhook) || validatorUtil.isEmpty(body)) {
            errorUtil.throwErr(`Invalid parameters! webhook : ${webhook}, body : ${body}`);
        }

        await axios.post(webhook, {content: body});
    } catch (error) {
        throw error;
    }
}

module.exports = {
    sendAlert: sendAlert
}