const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const validator = require("email-validator");

const promisify = require("util-promisify");

const aDay = 24 * 60 * 60 * 1000;

const signToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

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
    const token = signToken(user);
    const cookieOption = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * aDay
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") cookieOption.secure = true;
    user.password = undefined;

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

exports.signup = async (req, res, next) => {
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

exports.login = async (req, res, next) => {
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
            return next(new AppError("Có lỗi xảy ra!", 400))

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

exports.logout = (req, res, next) => {
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
                const decoded = await promisify(jwt.verify)(
                    token,
                    process.env.JWT_SECRET
                );
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
