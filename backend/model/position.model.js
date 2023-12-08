/*
    @author: ciphernova
    @date: 2023/07/11
    @description: This file defines the schema for the positions collection
 */

const mongoose = require('mongoose');
const dbEnum = require("../enum/db.enum");
// const positionVulnerabilityEnum = require("../enum/position.vulnerability.enum");

const positionSchema = new mongoose.Schema({
    protocolId: {
        type: String, required: true
    }, chain: {
        type: String, required: true
    }, group: {
        type: String, required: true
    }, collateral: {
        type: Number,
    }, owner: {
        type: String,
    }, metadata: {
        type: Object,
        default: []
    }, positionId: {
        type: String, required: true,
    }, isSafe: {
        type: Boolean, default: true
    }
}, {
    timestamps: true
});

positionSchema.index({positionId: 1}, {unique: true})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model('positions', positionSchema)