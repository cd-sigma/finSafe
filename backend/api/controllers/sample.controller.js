const emailLib = require('../../lib/email.lib');
const pushLib = require('../../lib/push.lib');
const slackLib = require('../../lib/slack.lib');
const discordLib = require('../../lib/discord.lib');
const responseLib = require('../../lib/response.lib');

const resStatusEnum = require('../../enum/res.status.enum');

async function sendSlackSampleAlert(req, res) {
    try {
        await slackLib.sendAlert("https://hooks.slack.com/services/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", "Aave V2 Health Factor Threshold Crossed 🚑", "Your health factor has dropped below 1.5 on Aave V2! Current Health Factor: 1.4");
        return responseLib.sendResponse(res, "Alert Sent Successfully", null, resStatusEnum.SUCCESS);
    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR);
    }
}

async function sendDiscordSampleAlert(req, res) {
    try {
        await discordLib.sendAlert("https://discord.com/api/webhooks/1183199643895603290/v6QguHffIAL3YduXJCwrHI8G5WlzBoT5sy-P_zRNkiGf1VsMcMxcvsWtARkd_VAm-GCi", "Aave V2 Health Factor Threshold Crossed 🚑", "Your health factor has dropped below 1.5 on Aave V2! Current Health Factor: 1.4");
        return responseLib.sendResponse(res, "Alert Sent Successfully", null, resStatusEnum.SUCCESS);
    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR);
    }
}

async function sendEmailSampleAlert(req, res) {
    try {
        await emailLib.sendEmail("mohammadnuman123@gmail.com", "Aave V2 Health Factor Threshold Crossed 🚑! Your health factor has dropped below 1.5 on Aave V2! Current Health Factor: 1.4");
        return responseLib.sendResponse(res, "Alert Sent Successfully", null, resStatusEnum.SUCCESS);
    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR);
    }
}

async function sendPushSampleAlert(req, res) {
    try {

        await pushLib.sendAlert("0x49F7302b4d1e88C84E93fd44cceFDCD5Bd6F0BDd", "Aave V2 Health Factor Threshold Crossed 🚑", "Your health factor has dropped below 1.5 on Aave V2! Current Health Factor: 1.4");
        return responseLib.sendResponse(res, "Alert Sent Successfully", null, resStatusEnum.SUCCESS);
    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    sendSlackSampleAlert: sendSlackSampleAlert,
    sendDiscordSampleAlert: sendDiscordSampleAlert,
    sendEmailSampleAlert: sendEmailSampleAlert,
    sendPushSampleAlert: sendPushSampleAlert
}
