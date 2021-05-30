const {User} = require("../models/Models");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const validator = require("email-validator");
const {createDefaultCookieOption, createToken, descryptToken} = require("../utils/jwtUtils")
const promisify = require("util-promisify");


const isUserObject = (obj)=>{
    if(!obj.id || !obj.email || !obj.name)
        return false
    if(obj.id.length!==20)
        return false
    if(!validator.validate(obj.email))
        return false
    return true
}

const createSendToken = (user, statusCode, res) => {
    if(user.password)
        delete user.password;

    const token = createToken(user);
    const cookieOption = createDefaultCookieOption()

    res.cookie("jwt", token, cookieOption);
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            name: user.name,
            email: user.email,
        },
    });
};

exports.createNewUser = async (req, res, next) => {
    try {
        let newUser = req.body;
        if (!newUser.email) {
            return next(new AppError("Please provide your email", 400));
        }
        if (!newUser.password) {
            return next(new AppError("Please provide your password", 400));
        }

        if (!validator.validate(newUser.email)) {
            return next(new AppError("Please provide a valid email", 400));
        }

        const x = await User.where("email", "==", newUser.email).get();

        if (!x.empty) {
            return next(new AppError("Email already exists", 400));
        }

        newUser.password = await bcrypt.hash(newUser.password, 12);
        const result = await User.add({
            ...newUser
        })
        newUser.id = (await result.get()).id;
        delete newUser.password;
        createSendToken(newUser, 201, res);
    }
    catch (err) {
        next(err)
    }
};

exports.authenticateLoginInfo = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password) {
            return next(new AppError("Please provide email and password", 400));
        }

        // 2) Check if user exists && password is correct
        const snapshot = await User.where("email", "==", email).get();
        if (snapshot.empty)
            return next(new AppError("Incorrect email or password", 401));
        else if (snapshot.docs.length !== 1)
            return next(new AppError("Error!", 400))

        const user = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        }
        if (!(await bcrypt.compare(password, user.password)))
            return next(new AppError("Incorrect email or password", 401));

        delete user.password
        // 3) If everything is OK, send token to client
        createSendToken(user, 200, res);
    }
    catch (err) {
        next(err)
    }
};

exports.setJwtTokenExpire = (req, res, next) => {
    if(!req.cookie || !req.cookie.jwt)
        return next(new AppError("Bad request!", 400))
    else
        res.cookie("jwt", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
    next();
};

exports.protect = async (req, res, next) => {
    try {
        // 1) Getting token and check of it's there
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        if (!token) {
            return next(new AppError("You are not logged in! Please log in to get access!!!", 401));
        }
        next();
    }
    catch (err) {
        next(err)
    }
};

exports.isLoggedIn = async (req, res, next) => {
    try {
        // 1) Getting token and check of it's there
        if (req.cookies.jwt) {
            try {
                token = req.cookies.jwt;
                const decoded = descryptToken(token);
                const userObj = {
                    id: decoded.id,
                    email: decoded.email,
                    name: decoded.name
                }
                if(isUserObject(userObj))
                    res.locals.user = userObj;
                return next();
            } catch (error) {
                return next();
            }
        }
        return next();
    }
    catch (err) {
        next(err)
    }
};
