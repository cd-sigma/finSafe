const mongoLib = require("./mongo.lib");
const consoleLib = require("./console.lib");
const errorUtil = require("../util/error.util");
const validatorUtil = require("../util/validators.util");

const userModel = require("../model/user.model");
const alertTypeEnum = require("../enum/alert.type.enum");

const alertModels = {
    [alertTypeEnum.PUSH]: require("../model/push.alert.model"),
    [alertTypeEnum.SLACK]: require("../model/slack.alert.model"),
    [alertTypeEnum.DISCORD]: require("../model/discord.alert.model"),
    [alertTypeEnum.EMAIL]: require("../model/email.alert.model")
}

async function generateAlert(address, title, content) {
    try {
        if (validatorUtil.isEmpty(address) || validatorUtil.isEmpty(content) || validatorUtil.isEmpty(title)) {
            errorUtil.throwErr(`Invalid address, title or content! address : ${address}, content : ${content}, title : ${title}`);
        }

        let user = await mongoLib.findOneByQuery(userModel, {address: address.toLowerCase()});
        if (validatorUtil.isEmpty(user)) {
            consoleLib.logWarn(`User not found for address : ${address}! Skipping alert generation!`);
            return;
        }

        if (validatorUtil.isEmpty(user.alertPreferences)) {
            consoleLib.logWarn(`Alert preferences not found for address : ${address}! Skipping alert generation!`);
            return;
        }

        let alertInsertionCalls = [];
        for (let iterAlertPreference = 0; iterAlertPreference < user.alertPreferences.length; iterAlertPreference++) {
            switch (user.alertPreferences[iterAlertPreference]) {
                case alertTypeEnum.PUSH:
                    alertInsertionCalls.push(mongoLib.createDoc(alertModels[alertTypeEnum.PUSH], {
                        address: address.toLowerCase(),
                        title: title,
                        body: content
                    }));
                    break;
                case alertTypeEnum.SLACK:
                    alertInsertionCalls.push(mongoLib.createDoc(alertModels[alertTypeEnum.SLACK], {
                        address: address.toLowerCase(),
                        title: title,
                        content: content,
                        webhook: user.slackWebhook
                    }));
                    break;
                case alertTypeEnum.DISCORD:
                    alertInsertionCalls.push(mongoLib.createDoc(alertModels[alertTypeEnum.DISCORD], {
                        address: address.toLowerCase(),
                        title: title,
                        content: content,
                        webhook: user.discordWebhook
                    }));
                    break;
                case alertTypeEnum.EMAIL:
                    alertInsertionCalls.push(mongoLib.createDoc(alertModels[alertTypeEnum.EMAIL], {
                        address: address.toLowerCase(),
                        subject: title,
                        body: content,
                        email: user.email
                    }));
                    break;
                default:
                    consoleLib.logError(`Invalid alert preference : ${user.alertPreferences[iterAlertPreference]} for address : ${address}! Skipping alert generation!`);
            }
        }
        await Promise.all(alertInsertionCalls);
    } catch (error) {
        throw error;
    }
}

function isValidPushAlert(alert) {
    try {
        if (validatorUtil.isEmpty(alert) || validatorUtil.isEmpty(alert.address) || validatorUtil.isEmpty(alert.title) || validatorUtil.isEmpty(alert.body)) {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
}

function isValidEmailAlert(alert) {
    try {
        if (validatorUtil.isEmpty(alert) || validatorUtil.isEmpty(alert.email) || validatorUtil.isEmpty(alert.subject) || validatorUtil.isEmpty(alert.body)) {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
}

function isValidSlackAlert(alert) {
    try {
        if (validatorUtil.isEmpty(alert) || validatorUtil.isEmpty(alert.title) || validatorUtil.isEmpty(alert.body) || validatorUtil.isEmpty(alert.webhook)) {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
}

function isValidDiscordAlert(alert) {
    try {
        if (validatorUtil.isEmpty(alert) || validatorUtil.isEmpty(alert.body) || validatorUtil.isEmpty(alert.webhook)) {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    generateAlert: generateAlert,
    isValidPushAlert: isValidPushAlert,
    isValidEmailAlert: isValidEmailAlert,
    isValidSlackAlert: isValidSlackAlert,
    isValidDiscordAlert: isValidDiscordAlert
};
