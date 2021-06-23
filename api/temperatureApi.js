const {Router} = require("express")
const {protect} = require("../controllers/authController")
const {Temperature} = require("../models/Models")
const AppError = require("../utils/appError")

const router = Router()

router.use(protect)

router.get("/daily-data", async(req, res, next)=>{
    // date in format: mm-dd-yyyy
    const {date} = req.query;
    if(!date)
        return next(new AppError("You must specify date", 400))
    
    let dateObj = new Date(date);
    if(!dateObj)
        return next(new AppError("Date is not in correct format", 400))

    let document = await Temperature.doc(date).get();
    if(!document.exists)
        return next(new AppError("This date does not have any data!", 400))

    let documentData = document.data();
    documentData.data = documentData.data.map((record)=>{
        return {
            time: record.time.toDate().toLocaleString(),
            temperature: record.temperature
        }
    })
    res.status(200).json(documentData);
})

module.exports = router