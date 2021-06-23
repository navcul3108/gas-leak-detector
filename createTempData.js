const {Temperature} = require("./models/Models")

const startDate = "06/14/2021"

const genTimeStamp = (dateStr, startHour, endHour)=>{
    const interval = endHour-startHour;
    const hour = startHour + Math.floor(Math.random()*interval);
    const minute = Math.random() * 59;
    const seconds = Math.random() * 59;
    let date = new Date(dateStr);
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(seconds);
    return date
}

//console.log(genTimeStamp("06/21/2021Z", 0, 3).toLocaleString());
for(let dateIdx=14;dateIdx<=28;dateIdx++)
{
    let data = []
    let max = 25;
    let min = 50;
    for(let hours=0;hours<24;hours+=3)
    {
        let temperature = 25 + Math.round(Math.random()*25)  
        if(temperature>max)
            max = temperature;
        else if(temperature<min)
            min = temperature;

        data.push({
            time: genTimeStamp(`06/${dateIdx}/2021Z`, hours, hours+3),
            temperature: temperature 
        })
    }
    Temperature.doc(`06-${dateIdx}-2021`).set({data, max, min});
}