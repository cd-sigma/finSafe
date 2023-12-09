const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const discordAlertSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    body: {
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

discordAlertSchema.index({isSent: 1, isFailed: 1})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("discord_alert", discordAlertSchema)
