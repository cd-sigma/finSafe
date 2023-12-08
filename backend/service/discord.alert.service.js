require("../node/node.env");
const util = require("util");

const dpLib = require("../lib/dp.lib");
const mongoLib = require("../lib/mongo.lib");
const discordLib = require("../lib/discord.lib");
const consoleLib = require("../lib/console.lib");
const helperUtil = require("../util/helper.util");
const validatorUtil = require("../util/validators.util");

const serviceConfig = require("../config/service.config");
const failedAlertModel = require("../model/failed.alert.model");
const discordAlertModel = require("../model/discord.alert.model");
const dpEnum = require("../enum/dp.enum");
const alertTypeEnum = require("../enum/alert.type.enum");

(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);

        let discordAlertProcessingBatchLimit = await dpLib.getDp(dpEnum.DISCORD_ALERT_PROCESSING_BATCH_LIMIT, serviceConfig.alerting.discord.defaultBatchProcessingLimit);
        discordAlertProcessingBatchLimit = parseInt(discordAlertProcessingBatchLimit);

        let alerts = [];
        while (true) {
            alerts = await mongoLib.findByQueryWithSkipLimit(discordAlertModel, {
                isSent: false,
                isFailed: false
            }, discordAlertProcessingBatchLimit, 0);

            if (alerts.length === 0) {
                const sleepTime = await dpLib.getDp(dpEnum.DISCORD_ALERTING_SERVICE_SLEEPTIME, serviceConfig.alerting.discord.defaultSleepTime);
                consoleLib.logInfo(`No alerts found to be sent!`);
                await helperUtil.sleep(sleepTime);
                continue;
            }

            let alertSendingCalls = [];
            for (const alert of alerts) {
                if (validatorUtil.isEmpty(alert.webhook)) {
                    consoleLib.logError(`Invalid alert! webhook is null for alert : ${JSON.stringify(alert)}`);
                    await mongoLib.findOneAndUpdate(discordAlertModel, {_id: alert._id}, {isFailed: true});
                    await mongoLib.createDoc(failedAlertModel, {
                        alertId: alert._id,
                        reason: `Invalid alert! webhook is null for alert : ${JSON.stringify(alert)}`,
                        type: alertTypeEnum.DISCORD
                    });
                    continue;
                }

                alertSendingCalls.push(discordLib.sendAlert(alert));
            }
            let alertSendingResults = await Promise.allSettled(alertSendingCalls);

            let alertUpdateCalls = [], failedAlertInsertionCalls = [], successfulAlertsCount = 0, failedAlertsCount = 0;
            alertSendingResults.forEach((alertSendingResult, iterAlert) => {
                if (alertSendingResult.status === "fulfilled") {
                    alertUpdateCalls.push(mongoLib.findOneAndUpdate(discordAlertModel, {_id: alerts[iterAlert]._id}, {isSent: true}));
                    successfulAlertsCount++;
                } else {
                    alertUpdateCalls.push(mongoLib.findOneAndUpdate(discordAlertModel, {_id: alerts[iterAlert]._id}, {isFailed: true}));
                    failedAlertInsertionCalls.push(mongoLib.createDoc(failedAlertModel, {
                        alertId: alerts[iterAlert]._id,
                        reason: util.inspect(alertSendingResult.reason),
                        type: alertTypeEnum.DISCORD
                    }));
                    failedAlertsCount++;
                }
            });
            await Promise.all(alertUpdateCalls);
            await Promise.all(failedAlertInsertionCalls);

            consoleLib.logInfo({
                message: `Alerts sent successfully!`,
                totalAlerts: alerts.length,
                failedAlerts: failedAlertsCount,
                successfulAlerts: successfulAlertsCount
            })

            const sleepTime = await dpLib.getDp(dpEnum.DISCORD_ALERTING_SERVICE_SLEEPTIME, serviceConfig.alerting.discord.defaultSleepTime);
            await helperUtil.sleep(sleepTime);
        }
    } catch (error) {
        consoleLib.logError(error);
        process.exit(1);
    }
})()