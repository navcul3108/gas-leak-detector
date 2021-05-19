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

const getLedData = async(axiosInstance, feedsURL, AIOkey)=>{
    try{
        const response = await axiosInstance.get(process.env.LED_DATA_FEED_URL) 
        return response.data;
    }
    catch(err){
        console.error(err);
        return {};
    }
}

const postLedData = async(axiosInstance, feedsURL, AIOkey, signal) =>{
    try{
        if(typeof signal=="number" && 0<=signal<=2){
            const formData = {id:"1", name:"LED", data: signal.toString(), unit:""};
              
            const response = await axiosInstance.post(process.env.LED_DATA_FEED_URL, {value: JSON.stringify(formData)});
            console.log(response.data);  
            return response.status === 200;   
        }
        return false
    }
    catch(err){
        console.error(err);
        return false
    }
}

const postSpeakerData = async(axiosInstance, feedsURL, AIOkey, level)=>{
    try{
        if(typeof level=="number" && 0<=level && level<=1023){
            let formData = {id:"3", name:"SPEAKER", data:level.toString(), unit: ""};
            const response = await axiosInstance.post(process.env.SPEAKER_DATA_FEED_URL, {value: JSON.stringify(formData)});
            console.log(response.data);
            return response.status === 200;   
        }
        return false;
    }
    catch(err){
        console.error(err)
        return false;
    }
}

const postLCDData = async(axiosInstance, feedsURL, AIOkey, message)=>{
    try{
        if(typeof message=="string"){
            let formData = {id:"5", name:"LCD", data:message, unit: ""};
            const response = await axiosInstance.post(process.env.LCD_DATA_FEED_URL, {value: JSON.stringify(formData)});
            console.log(response.data);
            return response.status === 200;   
        }
        return false
    }
    catch(err){
        console.error(err);
        return false
    }
}

const getTempAndHumidData = async(axiosInstance, feedsURL, AIOkey)=>{
    try{
        const response = await axiosInstance.get(process.env.TEMP_HUMID_DATA_FEED_URL);
        return response.data;
    }   
    catch(err){
        console.error(err);
        return {}
    }
}

const postTempAndHumidData = async(axiosInstance, feedsURL, AIOkey, temp, humid)=>{
    try{
        if(typeof temp=="number" && 0<=temp<=50 && typeof humid=="number" && 0<=humid<=100){
            const formData = {id:"7", name: "TEMP-HUMID", data: `${temp}-${humid}`, unit: "*C-%"}
            const response = await axiosInstance.post(process.env.TEMP_HUMID_DATA_FEED_URL, {value: JSON.stringify(formData)});
            console.log(response.data);
            return response.status === 200;    
        }
        return false
    }
    catch(err){
        console.error(err);
        return false
    }
}

const postGasData = async(axiosInstance, feedsURL, AIOkey, isOverThreshold)=>{
    if(typeof isOverThreshold=="boolean"){
        try{
            const formData = {id:"23", name:"GAS", data: isOverThreshold?"1":"0", unit: ""};
            const response = await axiosInstance.post(process.env.GAS_DATA_FEED_URL, {value: JSON.stringify(formData)})
            console.log(response.data)
            return response.status === 200;
        }
        catch(err){
            console.error(err);
        }
    }
}

const getLastestGasData = async(axiosInstance)=>{
    try{
        const response = await axiosInstance.get(process.env.GAS_DATA_FEED_URL+"/retain");
        const csvLine = response.data.toString();
        const data = parseCSVToJSON(csvLine);
        return data;
    }
    catch(err){
        return null
    }
}

