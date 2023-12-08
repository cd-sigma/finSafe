/*
    @author: ciphernova
    @date: 2023/11/23
    @description: This file contains all the time related functions
 */

function getCurrentTimestamp() {
    return Date.now();
}

function getCurrentIndianTimeForUnixTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
}

function getTimestamp() {
    return parseInt(Date.now() / 1000)
}

function getCurrentIndianTime() {
    let date = new Date()
    let localTime = date.getTime()
    let localOffset = date.getTimezoneOffset() * 60000
    let utc = localTime + localOffset
    let indianOffset = 5.5
    let india = utc + 3600000 * indianOffset
    return new Date(india).toLocaleString()
}

function getTimestampWithMS() {
    return Date.now()
}

module.exports = {
    getTimestampWithMS: getTimestampWithMS,
    getCurrentIndianTime: getCurrentIndianTime,
    getTimestamp: getTimestamp,
    getCurrentTimestamp: getCurrentTimestamp,
    getCurrentIndianTimeForUnixTimestamp: getCurrentIndianTimeForUnixTimestamp
}