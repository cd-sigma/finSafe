const mongoLib = require("../../lib/mongo.lib");
const responseLib = require("../../lib/response.lib");
const validatorUtil = require("../../util/validators.util");

const cmtOrderModel = require("../../model/cmt.order.model");
const resStatusEnum = require("../../enum/res.status.enum");

async function addCmtOrder(req, res) {
    try {
        const {positionId, collateralAddress, collateralAmount} = req.body;
        let {address} = req.user.payload;
        address = address.toLowerCase();

        if (validatorUtil.isEmpty(collateralAddress) || validatorUtil.isEmpty(collateralAmount)) {
            return responseLib.sendResponse(res, null, `collateralAddress and collateralAmount are required`
                , resStatusEnum.VALIDATION_ERROR);
        }

        await mongoLib.createDoc(cmtOrderModel, {
            ownerAddress: address,
            positionId: positionId,
            collateralAddress: collateralAddress,
            collateralAmount: collateralAmount,
        })

        return responseLib.sendResponse(res, "CMT order added successfully!", null, resStatusEnum.SUCCESS);
    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    addCmtOrder: addCmtOrder
}