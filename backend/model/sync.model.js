const mongoose = require("mongoose")
const dbEnum = require("../enum/db.enum")

const syncSchema = new mongoose.Schema(
    {
        chain: {
            type: String,
        },
        name: {
            type: String,
        },
        data: {
            type: Object,
        },
        isCompleted: {
            type: Boolean,
        },
    },
    {timestamps: true},
)

syncSchema.index({chain: 1, name: 1})

module.exports = mongoose.connection.useDb(dbEnum.FINSAFE).model("sync", syncSchema)
