const express = require("express")
const router = express.Router()
const sampleController = require("../controllers/sample.controller")

router.route("/slack").get(sampleController.sendSlackSampleAlert);
router.route("/discord").get(sampleController.sendDiscordSampleAlert);
router.route("/email").get(sampleController.sendEmailSampleAlert);
router.route("/push").get(sampleController.sendPushSampleAlert);


module.exports = router
