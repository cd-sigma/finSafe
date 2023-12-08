const _ = require("lodash")
const mongoLib = require("../lib/mongo.lib")
const consoleLib = require("../lib/console.lib")

const errorUtil = require("../util/error.util")
const dpModel = require("../model/dp.model")

const dpTypesEnum = require("../enum/dp.types.enum")

// update the dp in the database
async function setDp(type, name, value) {
    try {
        if (_.isEmpty(type) || _.isEmpty(name) || _.isNil(value)) {
            errorUtil.throwErr(`Values of type :${type}, name : ${name}, value : ${value}!`)
        }

        //check if the type is valid
        if (!Object.keys(dpTypesEnum).includes(type)) {
            errorUtil.throwErr(`Invalid type : ${type}!`)
        }

        if ((type === dpTypesEnum.BOOLEAN && _.isBoolean(value)) || (type === dpTypesEnum.ARRAY && _.isArray(value)) || (type === dpTypesEnum.NUMERIC && _.isNumber(value)) || (type === dpTypesEnum.STRING && _.isString(value))) {
            let dp = await mongoLib.findOneAndUpdate(dpModel, {name: name}, {type, name, value}, {
                upsert: true, returnDocument: "after"
            },)
            return dp
        } else {
            errorUtil.throwErr(`Invalid value : ${value} for type : ${type}!`)
        }
    } catch (error) {
        throw error
    }
}

// get the dp
async function getDp(name, defaultValue) {
    try {
        //validate the required fields
        if (_.isEmpty(name) || _.isNil(defaultValue)) {
            errorUtil.throwErr(`Values of name : ${name} and defaultValue : ${defaultValue}!`)
        }

        let dp = await mongoLib.findOneByQuery(dpModel, {name: name})
        if (_.isEmpty(dp)) {
            consoleLib.logWarn(`DP not found! using default value for dp:${name}`)
            return defaultValue
        }

        let value = dp.value
        return value
    } catch (error) {
        throw error
    }
}

module.exports = {
    setDp: setDp, getDp: getDp,
}
