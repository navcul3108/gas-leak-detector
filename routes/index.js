var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");

router.use(authController.isLoggedIn);
/* GET home page. */
router.get("/index", function (req, res) {
  res.render("index");
});

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.post("/signup", authController.signup);

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", authController.login);
router.post("/logout", authController.logout, (req, res) => {
  res.redirect("index");
});

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
