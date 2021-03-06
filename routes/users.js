var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");

router.use(authController.isLoggedIn);

router.get("/signup", function (req, res) {
    if(res.locals.user)
        res.render("users/loggedin")
    else
        res.render("users/signup");
});

router.post("/signup", authController.createNewUser);

router.get("/login", function (req, res) {
    if(res.locals.user)
        res.render("users/loggedin")
    else
        res.render("users/login");
});

router.post("/login", authController.authenticateLoginInfo);
router.post("/logout", authController.setJwtTokenExpire, (req, res) => {
    res.redirect("/users/login");
});

module.exports = router