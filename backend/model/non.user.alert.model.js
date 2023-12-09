const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const nonUserAlertSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("non_user_alert", nonUserAlertSchema)
