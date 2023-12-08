/*
    @author: ciphernova
    @date: 2023/12/08
    @description: This file defines the schema for the alert collection
 */

const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")
const alertTypeEnum = require("../enum/alert.type.enum");

const alertSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    isSent: {
        type: Boolean,
        default: false
    },
    isFailed: {
        type: Boolean,
        default: false
    },
    alertPreference: {
        type: [String],
        enum: Object.values(alertTypeEnum),
        default: []
    },
    slackWebhook: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    discordWebhook: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("alert", alertSchema)
