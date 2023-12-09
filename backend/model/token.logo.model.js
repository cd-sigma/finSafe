const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const tokenLogo = new mongoose.Schema(
    {
        address: {
            type: String,
        },
        logo: {
            type: String,
        }
    },
    {timestamps: true},
)

tokenLogo.index({address: 1})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("logo", tokenLogo)
