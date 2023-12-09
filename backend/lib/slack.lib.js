const axios = require("axios");
const errorUtil = require("../util/error.util");
const validatorUtil = require("../util/validators.util");

async function sendAlert(webhook, title, body) {
    try {
        if (validatorUtil.isEmpty(webhook) || validatorUtil.isEmpty(title) || validatorUtil.isEmpty(body)) {
            errorUtil.throwErr(`Invalid parameters! webhook : ${webhook}, title : ${title}, body : ${body}`);
        }

        const payload = {
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "```" + title + "\n-----------------------\n" + body + "```"
                    },
                },
            ],
        }

        await axios.post(webhook, payload);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    sendAlert: sendAlert
}