const jwt = require("jsonwebtoken");
const aDay = 24 * 60 * 60 * 1000;

const createToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createDefaultCookieOption = ()=>{
    let secure = false
    if (process.env.NODE_ENV === "production") 
        secure = true
    return {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * aDay
        ),
        httpOnly: true,
        secure: secure
    };
}

const descryptToken = (token, secret=process.env.JWT_SECRET)=>{
    return jwt.verify(token, secret)
}

module.exports = {createToken, createDefaultCookieOption, descryptToken}