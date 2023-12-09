const express = require("express")
const router = express.Router()

const alertController = require("../controllers/alert.controller")
const authMiddleware = require("../../middleware/jwt.auth.middleware")

router.post("/discord/subscribe", authMiddleware.isLoggedIn, alertController.subscribeToDiscord);
router.post("/slack/subscribe", authMiddleware.isLoggedIn, alertController.subscribeToSlack);
router.post("/email/subscribe", authMiddleware.isLoggedIn, alertController.subscribeToEmail);

module.exports = router
