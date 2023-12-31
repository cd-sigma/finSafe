const mongoLib = require("../../lib/mongo.lib");
const emailLib = require("../../lib/email.lib");
const slackLib = require("../../lib/slack.lib");
const discordLib = require("../../lib/discord.lib");
const responseLib = require("../../lib/response.lib");
const validatorUtil = require("../../util/validators.util");

const userModel = require("../../model/user.model");
const alertTypeEnum = require("../../enum/alert.type.enum");
const resStatusEnum = require("../../enum/res.status.enum");

async function subscribeToEmail(req, res) {
    try {
        const {email} = req.body;
        let {address} = req.user.payload;
        address = address.toLowerCase();

        if (validatorUtil.isEmpty(email)) {
            return responseLib.sendResponse(res, null, "email is required", resStatusEnum.VALIDATION_ERROR);
        }

        await mongoLib.findOneAndUpdate(userModel, {address: address}, {
            $addToSet: {alertPreferences: alertTypeEnum.EMAIL}, email: email
        });

        await emailLib.sendEmail(email, "Welcome To finSafe", "You have successfully subscribed to finSafe for alerts.")

        return responseLib.sendResponse(res, "Subscribed to email successfully!", null, resStatusEnum.SUCCESS);
    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

async function subscribeToSlack(req, res) {
    try {
        const {webhook} = req.body;
        let {address} = req.user.payload;
        address = address.toLowerCase();

        if (validatorUtil.isEmpty(webhook)) {
            return responseLib.sendResponse(res, null, "webhook is required", resStatusEnum.VALIDATION_ERROR);
        }

        await mongoLib.findOneAndUpdate(userModel, {address: address}, {
            $addToSet: {alertPreferences: alertTypeEnum.SLACK}, slackWebhook: webhook
        });

        await slackLib.sendAlert(webhook, "Welcome To finSafe", "You have successfully subscribed to finSafe for alerts.")

        return responseLib.sendResponse(res, "Subscribed to slack successfully!", null, resStatusEnum.SUCCESS);
    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

async function subscribeToDiscord(req, res) {
    try {
        const {webhook} = req.body;
        let {address} = req.user.payload;
        address = address.toLowerCase();

        if (validatorUtil.isEmpty(webhook)) {
            return responseLib.sendResponse(res, null, "webhook is required", resStatusEnum.VALIDATION_ERROR);
        }

        await mongoLib.findOneAndUpdate(userModel, {address: address}, {
            $addToSet: {alertPreferences: alertTypeEnum.DISCORD}, discordWebhook: webhook
        });

        await discordLib.sendAlert(webhook, "Welcome To finSafe", "You have successfully subscribed to finSafe for alerts.")

        return responseLib.sendResponse(res, "Subscribed to discord successfully!", null, resStatusEnum.SUCCESS);
    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)

    }
}

module.exports = {
    subscribeToDiscord: subscribeToDiscord,
    subscribeToSlack: subscribeToSlack,
    subscribeToEmail: subscribeToEmail
}