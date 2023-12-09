const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const cmtOrderSchema = new mongoose.Schema({
    ownerAddress: {
        type: String,
        required: true
    },
    positionId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    collateralAddress: {
        type: String,
        required: true
    },
    collateralAmount: {
        type: Number,
        required: true
    },
    isExecuted: {
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

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("cmt_order", cmtOrderSchema)
