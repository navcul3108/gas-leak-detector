const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// API for mobile app

router.post("/signup", authController.signup);
router.post("/login", authController.login, (req, res)=>{
  console.log('res.body :>> ', res.body);
});
router.get("/logout", authController.logout, function (req, res) {
  res.json({
    logout: "success"
  })
});


module.exports = router;
