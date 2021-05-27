const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// API for mobile app

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout, function (req, res, next) {
  res.json({
    logout: "success"
  })
});


module.exports = router;
