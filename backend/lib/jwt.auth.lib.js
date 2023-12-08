const jwt = require("jsonwebtoken")

function generateJwtToken(user, address) {
    try {
        return jwt.sign(
            { payload: { id: user.nonce, address: address } },
            process.env.JWT_SECRET,
        )
    } catch (err) {
        throw err
    }
}

module.exports = {
    generateJwtToken: generateJwtToken,
}
