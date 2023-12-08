const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const slackAlertSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    webhook: {
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
    }
}, {
    timestamps: true
})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("slack_alert", slackAlertSchema)
