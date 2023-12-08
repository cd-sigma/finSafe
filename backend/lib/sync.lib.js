/*
    @author: ciphernova
    @date: 2023/07/30
    @description: This library contains functions related to storing the sync status of a service.
 */

const _ = require("lodash")

const mongoLib = require("./mongo.lib")
const ipUtil = require("../util/ip.util");
const syncModel = require("../model/sync.model")

//update sync of the service in the database
async function updateSync(chain, name, data, isCompleted = false) {
    return new Promise(async (resolve, reject) => {
        try {
            //validate the required fields
            if (chain == null || name == null || data == null) {
                throw new Error(
                    "values of chain " +
                    chain +
                    " name " +
                    name +
                    " data " +
                    data,
                )
            }

            //update the sync object in the database
            let syncObj = await mongoLib.findOneAndUpdate(
                syncModel,
                {chain: chain, name: name},
                {
                    chain: chain,
                    name: name,
                    data: data,
                    isCompleted: isCompleted,
                },
                {upsert: true, returnDocument: "after"},
            )

            resolve(syncObj)
        } catch (error) {
            reject(error)
        }
    })
}

//get sync of the service from the database
async function getSync(chain, name) {
    return new Promise(async (resolve, reject) => {
        try {
            //validate the required fields
            if (_.isEmpty(chain) || _.isEmpty(name)) {
                throw new Error("values of chain " + chain + " serviceName " + name)
            }


            //get the sync object from the database
            let syncObj = await mongoLib.findOneByQueryWithHint(
                syncModel,
                {chain: chain, name: name},
                "chain_1_name_1",
            )

            resolve(syncObj)
        } catch (error) {
            reject(error)
        }
    })
}

// add conditions
function validateSync(sync) {
    if (
        _.isEmpty(sync) ||
        _.isEmpty(sync.data) ||
        _.isEmpty(sync.chain) ||
        _.isEmpty(sync.name)
    ) {
        throw new Error(
            `No sync data found in the db for chain: ${sync.chain}  serviceName: ${sync.name}`,
        )
    }
}

module.exports = {
    updateSync: updateSync,
    getSync: getSync,
    validateSync: validateSync,
}
