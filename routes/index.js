var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");

router.use(authController.isLoggedIn)

router.get("/contact", function (req, res) {
  res.render("contact");
});

router.get(
  "/feed",
  authController.protect,
  authController.isLoggedIn,
  function (req, res) {
    res.render("feed");
  }
);

router.get("/", function (req, res) {
  res.render("index");
});

module.exports = router;
