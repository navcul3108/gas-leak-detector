const {Router} = require("express")
const {protect} = require("../controllers/authController")
router = Router()

router.get("/dashboard", (req, res)=>{
    res.render("devices/dashboard")
})
router.use(protect)

module.exports = router