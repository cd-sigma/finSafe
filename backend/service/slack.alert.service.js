require("../node/node.env");
const util = require("util");

const dpLib = require("../lib/dp.lib");
const mongoLib = require("../lib/mongo.lib");
const alertLib = require("../lib/alert.lib");
const slackLib = require("../lib/slack.lib");
const consoleLib = require("../lib/console.lib");
const helperUtil = require("../util/helper.util");
const validatorUtil = require("../util/validators.util");

const serviceConfig = require("../config/service.config");
const failedAlertModel = require("../model/failed.alert.model");
const slackAlertModel = require("../model/slack.alert.model");
const dpEnum = require("../enum/dp.enum");
const alertTypeEnum = require("../enum/alert.type.enum");

(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);

        let slackAlertProcessingBatchLimit = await dpLib.getDp(dpEnum.SLACK_ALERT_PROCESSING_BATCH_LIMIT, serviceConfig.alerting.slack.defaultBatchProcessingLimit);
        slackAlertProcessingBatchLimit = parseInt(slackAlertProcessingBatchLimit);

        let alerts = [];
        while (true) {
            alerts = await mongoLib.findByQueryWithSkipLimit(slackAlertModel, {
                isSent: false,
                isFailed: false
            }, slackAlertProcessingBatchLimit, 0);

            if (alerts.length === 0) {
                const sleepTime = await dpLib.getDp(dpEnum.SLACK_ALERTING_SERVICE_SLEEPTIME, serviceConfig.alerting.slack.defaultSleepTime);
                consoleLib.logInfo(`No alerts found to be sent!`);
                await helperUtil.sleep(sleepTime);
                continue;
            }

            let alertSendingCalls = [];
            for (const alert of alerts) {
                if (!alertLib.isValidSlackAlert(alert)) {
                    consoleLib.logError(`Invalid alert! alert : ${JSON.stringify(alert)}`);
                    await mongoLib.findOneAndUpdate(slackAlertModel, {_id: alert._id}, {isFailed: true});
                    await mongoLib.createDoc(failedAlertModel, {
                        alertId: alert._id,
                        reason: `Invalid alert! alert : ${JSON.stringify(alert)}`,
                        type: alertTypeEnum.SLACK
                    });
                    continue;
                }

                alertSendingCalls.push(slackLib.sendAlert(alert.webhook, alert.title, alert.body));
            }
            let alertSendingResults = await Promise.allSettled(alertSendingCalls);

            let alertUpdateCalls = [], failedAlertInsertionCalls = [], successfulAlertsCount = 0, failedAlertsCount = 0;
            alertSendingResults.forEach((alertSendingResult, iterAlert) => {
                if (alertSendingResult.status === "fulfilled") {
                    alertUpdateCalls.push(mongoLib.findOneAndUpdate(slackAlertModel, {_id: alerts[iterAlert]._id}, {isSent: true}));
                    successfulAlertsCount++;
                } else {
                    alertUpdateCalls.push(mongoLib.findOneAndUpdate(slackAlertModel, {_id: alerts[iterAlert]._id}, {isFailed: true}));
                    failedAlertInsertionCalls.push(mongoLib.createDoc(failedAlertModel, {
                        alertId: alerts[iterAlert]._id,
                        reason: util.inspect(alertSendingResult.reason),
                        type: alertTypeEnum.SLACK
                    }));
                    failedAlertsCount++;
                }
            });
            await Promise.all(alertUpdateCalls);
            await Promise.all(failedAlertInsertionCalls);

            consoleLib.logInfo({
                message: `Alerts sent successfully!`,
                totalAlerts: alerts.length,
                failedAlertsCount: failedAlertsCount,
                successfulAlertsCount: successfulAlertsCount
            })

            const sleepTime = await dpLib.getDp(dpEnum.SLACK_ALERTING_SERVICE_SLEEPTIME, serviceConfig.alerting.slack.defaultSleepTime);
            await helperUtil.sleep(sleepTime);
        }
    } catch (error) {
        consoleLib.logError(error);
        process.exit(1);
    }
})()