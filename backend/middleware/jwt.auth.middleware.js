const jwt = require("jsonwebtoken")
const validatorUtil = require("../util/validators.util")
const errorUtil = require("../util/error.util")

async function isLoggedIn(req, res, next) {
    try {
        if (
            validatorUtil.isEmpty(req.headers.authorization)
        ) {
            errorUtil.throwErr("validation exception for req.headers.authorization")
        }
        let token= req.headers.authorization.split(" ")[1];
        req.user = await jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (e) {
        next(e)
    }
}

module.exports = {isLoggedIn: isLoggedIn}
