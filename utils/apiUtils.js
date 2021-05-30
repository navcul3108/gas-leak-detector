const respondSuccess = (res, statusCode, message)=>{
    res.status(statusCode).json({
        status: "success",
        message: message
    })
}

module.exports = {respondSuccess}