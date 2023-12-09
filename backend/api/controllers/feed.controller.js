const mongoLib = require("../../lib/mongo.lib");
const alertModel = require("../../model/alert.model");
const validatorsUtil = require("../../util/validators.util");
const responseLib = require("../../lib/response.lib");
const resStatusEnum = require("../../enum/res.status.enum");
;

async function getUserFeed(req, res) {
    try {
        let {address} = req.params
        const {page = 1, limit = 5} = req.query

        if (validatorsUtil.isEmpty(address)) {
            return responseLib.sendResponse(res, null, "Missing Address", resStatusEnum.VALIDATION_ERROR)
        }
        address = address.toLowerCase()

        const alerts = await mongoLib.findByQueryWithSkipLimitWithHint(alertModel, {address: address}, limit, (page - 1) * limit, "address_1_timestamp_-1")

        return responseLib.sendResponse(res, {alerts}, null, resStatusEnum.SUCCESS)
    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    getUserFeed: getUserFeed
}