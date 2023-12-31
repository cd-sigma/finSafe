const _ = require("lodash")

const mongoLib = require("./mongo.lib")
const ipUtil = require("../util/ip.util");
const syncModel = require("../model/sync.model")

//update sync of the service in the database
async function updateSync(chain, name, data, isCompleted = false) {
    try {
        //validate the required fields
        if (chain == null || name == null || data == null) {
            throw new Error("values of chain " + chain + " name " + name + " data " + data,)
        }

        //update the sync object in the database
        let syncObj = await mongoLib.findOneAndUpdate(syncModel, {chain: chain, name: name}, {
            chain: chain, name: name, data: data, isCompleted: isCompleted,
        }, {upsert: true, returnDocument: "after"},)

        return syncObj
    } catch (error) {
        throw error
    }
}

//get sync of the service from the database
async function getSync(chain, name) {
        try {
            //validate the required fields
            if (_.isEmpty(chain) || _.isEmpty(name)) {
                throw new Error("values of chain " + chain + " serviceName " + name)
            }


            //get the sync object from the database
            let syncObj = await mongoLib.findOneByQueryWithHint(syncModel, {
                chain: chain,
                name: name
            }, "chain_1_name_1",)

            return syncObj
        } catch (error) {
            throw error
        }
}

// add conditions
function validateSync(sync) {
    if (_.isEmpty(sync) || _.isEmpty(sync.data) || _.isEmpty(sync.chain) || _.isEmpty(sync.name)) {
        throw new Error(`No sync data found in the db for chain: ${sync.chain}  serviceName: ${sync.name}`,)
    }
}

module.exports = {
    updateSync: updateSync, getSync: getSync, validateSync: validateSync,
}
