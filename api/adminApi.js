const { Router} = require("express")
const {protect, isLoggedIn} = require("../controllers/authController");
const AppError = require("../utils/appError");
const fs = require("fs");
const e = require("express");
const router = Router();

router.use(protect)
router.use(isLoggedIn)
router.use((req, res, next)=>{
    if(res.locals.user.email==="admin@gmail.com")
        next()
    else
        next(new AppError("Bạn không phải admin!", 401))
})

router.post("/update-adafruit-key", (req, res)=>{
    const {env_name, value} = req.body
    if(!["CSE_BBC_KEY", "CSE_BBC1_KEY"].includes(env_name))
    {
        res.status(404).json("env_name không hợp lệ")
        return
    }    
    if(!value.startsWith("aio_") || value.length!==32)
    {
        res.status(400).json('value không đúng format, phải bắt bầu bằng "aio_" và có độ dài 32 ký tự!')
        return
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
        res.status(200).json("Key đã được cập nhật")
    }
    catch(err){
        console.error(err.message);
        res.status(500).json(err.message)
    }
})

module.exports = router