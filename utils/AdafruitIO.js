const axios = require("axios").default;
require("dotenv").config();

const axiosInstance = axios.create({
    headers: {
        "X-AIO-key": process.env.CSE_BBC_KEY
    },
    responseType: "json"
})

const axiosInstance1 = axios.create({
    headers: {
        "X-AIO-key": process.env.CSE_BBC1_KEY
    },
    responseType: "json"
})

const parseCSVToJSON = (csvLine)=>{
    const splittedArr = csvLine.split(",");
    // Remove duplicate double quote
    let jsonDataStr = splittedArr.slice(0, splittedArr.length-3).join(",").replace(/""/g, '"');
    if(jsonDataStr.startsWith(","))
        jsonDataStr = jsonDataStr.substr(1);
    if(jsonDataStr.endsWith(","))
        jsonDataStr = jsonDataStr.substr(0, jsonDataStr.length-2);

    console.log('jsonDataStr :>> ', jsonDataStr);
    const dataObj = JSON.parse(jsonDataStr);
    console.log('dataObj :>> ', dataObj);
    return dataObj
}

const postLedData = async(signal) =>{
    try{
        if(typeof signal=="number" && 0<=signal<=2){
            const formData = {id:"1", name:"LED", data: signal.toString(), unit:""};
              
            const response = await axiosInstance.post(process.env.LED_DATA_FEED_URL1, {value: JSON.stringify(formData)});
              
            return response.status === 200;   
        }
        return false
    }
    catch(err){
        console.error(err.data);
        return false
    }
}

const postSpeakerData = async(level)=>{
    try{
        if(typeof level=="number" && 0<=level && level<=1023){
            let formData = {id:"3", name:"SPEAKER", data:level.toString(), unit: ""};
            const response = await axiosInstance.post(process.env.SPEAKER_DATA_FEED_URL1, {value: JSON.stringify(formData)});
            
            return response.status === 200;   
        }
        return false;
    }
    catch(err){
        console.error(err)
        return false;
    }
}

const postLCDData = async(message)=>{
    try{
        if(typeof message=="string"){
            let formData = {id:"5", name:"LCD", data:message, unit: ""};
            const response = await axiosInstance.post(process.env.LCD_DATA_FEED_URL1, {value: JSON.stringify(formData)});
            
            return response.status === 200;   
        }
        return false
    }
    catch(err){
        console.error(err.data);
        return false
    }
}

const getTempAndHumidData = async()=>{
    try{
        const response = await axiosInstance.get(process.env.TEMP_HUMID_DATA_FEED_URL1);
        return response.data;
    }   
    catch(err){
        console.error(err.data);
        return {}
    }
}

const postTempAndHumidData = async(temp, humid)=>{
    try{
        if(typeof temp=="number" && 0<=temp<=50 && typeof humid=="number" && 0<=humid<=100){
            const formData = {id:"7", name: "TEMP-HUMID", data: `${temp}-${humid}`, unit: "*C-%"}
            const response = await axiosInstance.post(process.env.TEMP_HUMID_DATA_FEED_URL1, {value: JSON.stringify(formData)});
            
            return response.status === 200;    
        }
        return false
    }
    catch(err){
        console.error(err.data);
        return false
    }
}

const postGasData = async(isOverThreshold)=>{
    if(typeof isOverThreshold=="boolean"){
        try{
            const formData = {id:"23", name:"GAS", data: isOverThreshold?"1":"0", unit: ""};
            const response = await axiosInstance1.post(process.env.GAS_DATA_FEED_URL1, {value: JSON.stringify(formData)})
            console.log(response.data)
            return response.status === 200;
        }
        catch(err){
            console.error(err.data);
        }
    }
}

const postDRVData = async(speed)=>{
    if(typeof speed=="number" && -255<=speed<=255){
        try{
            const formData = {id:"10", name:"DRV_PWM", data: speed.toString(), unit: ""};
            const response = await axiosInstance.post(process.env.DRV_DATA_FEED_URL1, {value: JSON.stringify(formData)})
            return response.status == 200;
        }
        catch(err)
        {
            console.error(err.data);
            return false
        }
    }
    return false;
}

const postRelayData = async(turnOn)=>{
    if(typeof turnOn=="boolean"){
        try{
            const formData = {id:"11", name:"RELAY", data: turnOn? "1":"0", unit: ""};
            const response = await axiosInstance1.post(process.env.RELAY_DATA_FEED_URL1, {value: JSON.stringify(formData)})
            return response.status == 200;
        }
        catch(err)
        {
            console.error(err.data);
            return false
        }
    }
    return false;
}


module.exports = {postLedData, postSpeakerData, postLCDData, getTempAndHumidData, postTempAndHumidData, 
                 postGasData, postDRVData, postRelayData}
