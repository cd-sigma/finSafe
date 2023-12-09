require("../node/node.env")

const express = require("express")
const cors = require("cors")

const mongoLib = require("../lib/mongo.lib")
const consoleLib = require("../lib/console.lib")
const responseLib = require("../lib/response.lib")
const tokenRoutes = require("./routes/token.route")
const userRoutes = require("./routes/user.route")
const feedRoutes = require("./routes/feed.route")

const app = express()
const port = 3001

;(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL)
        app.use(cors())
        app.use(express.json())
        app.use(express.urlencoded({extended: true}))

        app.get("/", (req, res) => {
            res.sendFile(__dirname + "//views//index.html")
        })

        app.get("/status", (req, res) => {
            return responseLib.sendResponse(res, {status: 200, health: "GREEN"}, null, 200)
        })

        app.use("/user", userRoutes)
        app.use("/token", tokenRoutes)
        app.use("/feed", feedRoutes)

        app.listen(port, () => {
            consoleLib.logInfo(`API listening at http://localhost:${port}`)
        })
    } catch (error) {
        console.log(error)
    }
})()