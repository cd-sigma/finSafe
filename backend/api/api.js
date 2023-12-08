require("../node/node.env")

const express = require("express")
const cors = require("cors")

const responseLib = require("../lib/response.lib")
const userRoutes = require("./routes/user.route")

const app = express()
const port = 3000

;(async () => {
    try {
        app.use(cors())
        app.use(express.json())
        app.use(express.urlencoded({extended: true}))

        app.get("/status", (req, res) => {
            return responseLib.sendResponse(res, {status: 200, health: "GREEN"}, null, 200)
        })

        app.use("/user", userRoutes)

        app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        })
    } catch (error) {
        console.log(error)
    }
})()