const express = require("express")
const router = express.Router()
const feedController = require("../controllers/feed.controller")

router.route("/:address").get(feedController.getUserFeed)

module.exports = router
