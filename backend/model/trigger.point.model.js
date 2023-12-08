/*
    @author: ciphernova
    @date: 2023/07/11
    @description: This file defines the schema for the trigger_points collection
 */

const mongoose = require('mongoose');
const dbEnum = require("../enum/db.enum");

const triggerPointSchema = new mongoose.Schema({
    protocolId: {
        type: String,
    }, chain: {
        type: String,
    }, group: {
        type: String,
    }, topic0: {
        type: String,
    }, contractAddress: {
        type: String,
    },
}, {
    timestamps: true
})

triggerPointSchema.index({topic0: 1, contractAddress: 1})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model('Trigger_point', triggerPointSchema)