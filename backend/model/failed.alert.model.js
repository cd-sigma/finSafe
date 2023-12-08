const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")
const alertTypeEnum = require("../enum/alert.type.enum");

const failedAlertSchema = new mongoose.Schema({
    alertId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(alertTypeEnum),
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
