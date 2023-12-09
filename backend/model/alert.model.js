const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const alertSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("alert", alertSchema)
