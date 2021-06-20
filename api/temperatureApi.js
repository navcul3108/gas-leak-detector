const { Router} = require("express")
const {protect} = require("../controllers/authController")
const router = Router();

const { Temperature } = require("../models/Models");

router.use(protect)

router.post("/get", async (req, res, next)=>{
    const { date } = req.body
    const _day = parseInt(date.substring(0, 2));
    const _month = parseInt(date.substring(3, 5));
    const _year = parseInt(date.substring(6));
    if(!date) return next(new AppError("You must provide enough information", 400))
    let data = []
    const snapshot = await Temperature.get();
    snapshot.docs.map(doc => data.push(doc.data()));
    result = []
    data.forEach(el => {
        let date = new Date(el.timestamp * 1000);
        let year = date.getFullYear() - 1969;
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hours = date.getHours();
        console.log(year, month, day)
        if (day == _day && month == _month && year == _year) 
            result.push({
                temmperature: el.temperature, 
                date: _day,
                hours,
            });
    })
    console.log();
    res.status(200).json(result)
    
})

module.exports = router