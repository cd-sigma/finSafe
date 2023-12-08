require("../node/node.env");
const dpLib = require("../lib/dp.lib");
const mongoLib = require("../lib/mongo.lib");
const pushLib = require("../lib/alert/push.lib");
const slackLib = require("../lib/alert/slack.lib");
const emailLib = require("../lib/alert/email.lib");
const discordLib = require("../lib/alert/discord.lib");
const consoleLib = require("../lib/console.lib");
const helperUtil = require("../util/helper.util");

const serviceConfig = require("../config/service.config");

const userModel = require("../model/user.model");
const alertModel = require("../model/alert.model");
const failedAlertModel = require("../model/failed.alert.model");
const dpEnum = require("../enum/dp.enum");
const alertTypeEnum = require("../enum/alert.type.enum");
const alertFailureReasonsEnum = require("../enum/alert.failure.reason.enum");

(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);

        let alertProcessBatchLimit = await dpLib.getDp(dpEnum.ALERT_PROCESSING_BATCH_LIMIT, serviceConfig.alerting.defaultBatchProcessingLimit);
        alertProcessBatchLimit = parseInt(alertProcessBatchLimit);

        let alerts = [];
        while (true) {
            alerts = await mongoLib.findByQueryWithSkipLimit(alertModel, {isSent: false}, alertProcessBatchLimit, 0);

            if (alerts.length === 0) {
                consoleLib.logInfo(`No alerts found to be sent!`);
                const sleepTime = await dpLib.getDp(dpEnum.ALERTING_SERVICE_SLEEPTIME, serviceConfig.alerting.defaultSleepTime);
                await helperUtil.sleep(sleepTime);
                continue;
            }

            let alertUserCalls = [];
            alerts.forEach((alert) => {
                if (_.isNil(alert.address)) {
                    throw new Error(`Invalid alert! address is null for alert : ${JSON.stringify(alert)}`);
                }

                alertUserCalls.push(mongoLib.findOneByQuery(userModel, {address: alert.address}));
            });
            let alertUsers = await Promise.all(alertUserCalls);

            let failedAlertInsertionCalls = [], pushAlertCalls = [], slackAlertCalls = [], emailAlertCalls = [],
                discordAlertCalls = [];
            for (let iterAlert = 0; iterAlert < alerts.length; iterAlert++) {
                if (_.isNil(alertUsers[iterAlert])) {
                    consoleLib.logError(`Invalid alert! user not found for alert : ${JSON.stringify(alerts[iterAlert])}`);
                    failedAlertInsertionCalls.push(mongoLib.createDoc(failedAlertModel, {
                        alertId: alerts[iterAlert]._id,
                        reason: alertFailureReasonsEnum.NO_USER_FOUND
                    }));
                    continue;
                }

                if (_.isNil(alertUsers[iterAlert].alertPreferences)) {
                    consoleLib.logError(`Invalid alert! alertPreferences not found for user : ${JSON.stringify(alertUsers[iterAlert])}`);
                    failedAlertInsertionCalls.push(mongoLib.createDoc(failedAlertModel, {
                        alertId: alerts[iterAlert]._id,
                        reason: alertFailureReasonsEnum.ALERT_PREFERENCE_NOT_FOUND
                    }));
                    continue;
                }

                alertUsers[iterAlert].alertPreferences.forEach((alertPreference) => {
                    switch (alertPreference) {
                        case alertTypeEnum.PUSH:
                            pushAlertCalls.push(pushLib.sendAlert(alertUsers[iterAlert], alerts[iterAlert]));
                            break;
                        case alertTypeEnum.SLACK:
                            slackAlertCalls.push(slackLib.sendAlert(alertUsers[iterAlert], alerts[iterAlert]));
                            break;
                        case alertTypeEnum.EMAIL:
                            emailAlertCalls.push(emailLib.sendAlert(alertUsers[iterAlert], alerts[iterAlert]));
                            break;
                        case alertTypeEnum.DISCORD:
                            discordAlertCalls.push(discordLib.sendAlert(alertUsers[iterAlert], alerts[iterAlert]));
                            break;
                        default:
                            consoleLib.logError(`Invalid alert preference : ${alertPreference} for user : ${JSON.stringify(alertUsers[iterAlert])}`);
                            failedAlertInsertionCalls.push(mongoLib.createDoc(failedAlertModel, {
                                alertId: alerts[iterAlert]._id,
                                reason: alertFailureReasonsEnum.INVALID_ALERT_PREFERENCE
                            }));
                    }
                })
            }
            await Promise.all(failedAlertInsertionCalls);
            let pushAlerts = await Promise.allSettled(pushAlertCalls);
            let slackAlerts = await Promise.allSettled(slackAlertCalls);
            let emailAlerts = await Promise.allSettled(emailAlertCalls);
            let discordAlerts = await Promise.allSettled(discordAlertCalls);

        }
    } catch (error) {
        consoleLib.logError(error);
        process.exit(1);
    }
})();