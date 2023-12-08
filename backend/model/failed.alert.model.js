/*
    @author: ciphernova
    @date: 2023/12/08
    @description: This file defines the schema for the failed alert collection
 */

const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")
const alertFailureReasonEnum = require("../enum/alert.failure.reason.enum");

const failedAlertSchema = new mongoose.Schema({
    alertId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        enum: Object.values(alertFailureReasonEnum),
        required: true
    },
    haveRetried: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("failed_alert", failedAlertSchema)
