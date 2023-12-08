const util = require("util")

const errorUtil = require("../util/error.util")
const validatorUtil = require("../util/validators.util")

const resStatusEnum = require("../enum/res.status.enum")

/**
 * @param res
 * @param data
 * @param error
 * @param {number} status
 * @param performanceStats
 */
async function sendResponse(res, data, error, status, performanceStats = null) {
    let responseToSend = {}
    try {
        if (validatorUtil.isNil(status)) {
            errorUtil.throwErr("Please provide status code ")
        }

        if (validatorUtil.isEmpty(res)) {
            errorUtil.throwErr("Please provide response object")
        }

        switch (status) {
            case resStatusEnum.SUCCESS:
                if (data === null || data === undefined || data.length === 0) {
                    errorUtil.throwErr("Please provide data to send")
                }
                responseToSend = {
                    result: {
                        message: "Success",
                        data: data,
                        error: null,
                    },
                    status: resStatusEnum.SUCCESS,
                }
                break
            case resStatusEnum.VALIDATION_ERROR: {
                if (validatorUtil.isNil(error)) {
                    errorUtil.throwErr("Please provide error to send")
                }
                responseToSend = {
                    result: {
                        message: "Bad request",
                        data: data,
                        error: error,
                    },
                    status: resStatusEnum.VALIDATION_ERROR,
                }
            }
                break
            case resStatusEnum.NOT_FOUND: {
                if (validatorUtil.isNil(error)) {
                    errorUtil.throwErr("Please provide error to send")
                }
                responseToSend = {
                    result: {
                        message: "Resource Not Found",
                        data: data,
                        error: error,
                    },
                    status: resStatusEnum.NOT_FOUND,
                }
            }
                break
            case resStatusEnum.INTERNAL_SERVER_ERROR: {
                responseToSend = {
                    result: {
                        message: "Internal Server Error",
                        data: data,
                        error: util.inspect(error),
                    },
                    status: resStatusEnum.INTERNAL_SERVER_ERROR,
                }
            }
                break
            case resStatusEnum.UNAUTHORIZED: {
                responseToSend = {
                    result: {
                        message: "Unauthorized",
                        data: data,
                        error: error,
                    },
                    status: resStatusEnum.UNAUTHORIZED,
                }
            }
                break
            case resStatusEnum.TOO_MANY_REQUESTS: {
                responseToSend = {
                    result: {
                        message: "Too many requests",
                        data: data,
                        error: error,
                    },
                    status: resStatusEnum.TOO_MANY_REQUESTS,
                }
            }
                break
            case resStatusEnum.CONFLICT: {
                responseToSend = {
                    result: {
                        message: "Conflict",
                        data: data,
                        error: error,
                    },
                    status: resStatusEnum.CONFLICT,
                }
            }
                break
            case resStatusEnum.ACCEPTED: {
                responseToSend = {
                    result: {
                        message: "ACCEPTED",
                        data: data,
                        error: null,
                    },
                    status: resStatusEnum.ACCEPTED,
                }
            }
                break
            default: {
                errorUtil.throwErr("Please provide valid status code")
            }
        }

        res.json(responseToSend)
    } catch (error) {
        throw error
    }
}

module.exports = {
    sendResponse: sendResponse,
}
