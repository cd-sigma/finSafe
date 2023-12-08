const uuid = require("uuid")
const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")
const alertTypeEnum = require("../enum/alert.type.enum");

const userSchema = new mongoose.Schema({
    address: {
        type: String, required: true
    }, nonce: {
        type: String, default: () => uuid.v4(),
    }, isWalletVerified: {
        type: Boolean
    }, isProtectionEnabled: {
        type: Boolean, default: false
    }, alertPreferences: {
        type: [String], enum: Object.values(alertTypeEnum), default: []
    }, slackWebhook: {
        type: String, default: null
    }, email: {
        type: String, default: null
    }, discordWebhook: {
        type: String, default: null
    }, protectionAccountAddress: {
        type: String
    }
}, {
    timestamps: true
})


module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("user", userSchema)
