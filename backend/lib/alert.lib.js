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

async function generateAlert(address, content) {
    try {
        if (validatorUtil.isEmpty(address) || validatorUtil.isEmpty(content)) {
            errorUtil.throwErr(`Invalid address or content! address : ${address}, content : ${content}`);
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
                        content: content
                    }));
                    break;
                case alertTypeEnum.SLACK:
                    alertInsertionCalls.push(mongoLib.createDoc(alertModels[alertTypeEnum.SLACK], {
                        address: address.toLowerCase(),
                        content: content,
                        webhook: user.slackWebhook
                    }));
                    break;
                case alertTypeEnum.DISCORD:
                    alertInsertionCalls.push(mongoLib.createDoc(alertModels[alertTypeEnum.DISCORD], {
                        address: address.toLowerCase(),
                        content: content,
                        webhook: user.discordWebhook
                    }));
                    break;
                case alertTypeEnum.EMAIL:
                    alertInsertionCalls.push(mongoLib.createDoc(alertModels[alertTypeEnum.EMAIL], {
                        address: address.toLowerCase(),
                        content: content,
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

function validateEmailOptions(options = {}) {
  if (
    validatorUtil.isEmpty(options) ||
    validatorUtil.isEmpty(options.receiverEmail) ||
    validatorUtil.isEmpty(options.subject) ||
    validatorUtil.isEmpty(options.text)
  ) {
    errorUtil.throwErr("validation error for email type notifications");
  }
}


module.exports = {
  generateAlert: generateAlert,
  validateEmailOptions: validateEmailOptions,
};
