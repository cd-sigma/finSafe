const util = require('util');
const chalk = require('chalk');
const dateUtil = require('../util/date.util');

function logError(message) {
    try {
        console.log(chalk.red(util.inspect({
            time: dateUtil.getCurrentIndianTimeForUnixTimestamp(dateUtil.getCurrentTimestamp()),
            message: message
        })));
    } catch
        (error) {
        throw error;
    }
}

function logInfo(message) {
    try {
        console.log(chalk.green(util.inspect({
            time: dateUtil.getCurrentIndianTimeForUnixTimestamp(dateUtil.getCurrentTimestamp()), message: message
        })));
    } catch (error) {
        throw error;
    }
}

function logWarn(message) {
    try {
        console.log(chalk.yellow(util.inspect({
            time: dateUtil.getCurrentIndianTimeForUnixTimestamp(dateUtil.getCurrentTimestamp()), message: message
        })));
    } catch (error) {
        throw error;
    }
}

function logDebug(message) {
    try {
        console.log(chalk.white(util.inspect({
            time: dateUtil.getCurrentIndianTimeForUnixTimestamp(dateUtil.getCurrentTimestamp()), message: message
        })));
    } catch (error) {
        throw error;
    }
}

module.exports = {
    logError: logError, logInfo: logInfo, logWarn: logWarn, logDebug: logDebug
}
