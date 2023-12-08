const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const userSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    nonce: {
        type: String,
    },
    isWalletVerified: {
        type: Boolean
    },
    isProtectionEnabled: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})


module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("user", userSchema)
