/*
    @author: anuraag
    @date: 2023/08/15
    @description: This file defines the schema for the dp collection
 */

const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const dpSchema = new mongoose.Schema({
    type: {
        type: String,
    },
    name: {
        type: String,
        unique: true,
    },
    value: {
        type: Object,
    },
}, {
    timestamps: true
})

dpSchema.index({name: 1})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("dp", dpSchema)
