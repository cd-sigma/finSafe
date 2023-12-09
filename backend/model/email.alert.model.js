const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const emailAlertSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    email: {
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

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("email_alert", emailAlertSchema)
