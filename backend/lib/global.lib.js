const globalKeysEnum = require("../enum/global.keys.enum")
const errorUtil = require("../util/error.util")
const validatorUtil = require("../util/validators.util")

function setGlobalKey(key, value) {
    try {
        if (!Object.keys(globalKeysEnum).includes(key)) {
            errorUtil.throwErr(`Key ${key} not found in globalKeysEnum`)
        }
        global[key] = value
    } catch (error) {
        throw error
    }
}

function getGlobalKey(key) {
    try {
        if (!Object.keys(globalKeysEnum).includes(key)) {
            errorUtil.throwErr(`Key ${key} not found in globalKeysEnum`)
        }

        return global[key]
    } catch (error) {
        throw error
    }
}

function deleteGlobalKey(key) {
    try {
        if (validatorUtil.isEmpty(key)) {
            errorUtil.throwErr(`Key ${key} is empty`)
        }

        delete global[key]
    } catch (error) {
        throw error
    }
}

module.exports = {
    setGlobalKey: setGlobalKey,
    getGlobalKey: getGlobalKey,
    deleteGlobalKey: deleteGlobalKey,
}
