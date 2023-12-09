const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const pushAlertSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
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

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("push_alert", pushAlertSchema)
