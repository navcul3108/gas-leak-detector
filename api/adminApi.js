const { Router} = require("express")
const {protect, isLoggedIn} = require("../controllers/authController");
const AppError = require("../utils/appError");
const fs = require("fs");
const router = Router();
const {respondSuccess} = require("../utils/apiUtils")

router.use(protect)
router.use(isLoggedIn)
router.use((req, res, next)=>{
    if(res.locals.user.email==="admin@gmail.com")
        next()
    else
        next(new AppError("You aren't admin", 401))
})

router.post("/update-adafruit-key", (req, res, next)=>{
    const {env_name, value} = req.body
    if(!["CSE_BBC_KEY", "CSE_BBC1_KEY"].includes(env_name))
    {
        return next(new AppError("env_name is invalid", 400))
    }    
    if(!value.startsWith("aio_") || value.length!==32)
    {
        return next(new AppError('value is not in correct format, must start with "aio_" and contain 32 characters', 400))
    }    

    try{
        const data = fs.readFileSync("./.env", "utf-8")
        const lines = data.split("\r\n")
        const newContent = lines.map((line, _)=>{
                if(line.includes(env_name))
                    return `${env_name}=${value}`
                else
                    return line
            })
            .join("\r\n")
        fs.writeFileSync("./.env", newContent, {encoding:"utf-8"})
        process.env[env_name] = value
        respondSuccess(res, 200, "Key has been updated")
    }
    catch(err){
        console.error(err.message);
        next(new AppError(err.message, 500))
    }
})

module.exports = router