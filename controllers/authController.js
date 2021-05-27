const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const validator = require("email-validator");
const { v4: uuidv4 } = require("uuid");

const promisify = require("util-promisify");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const cookieOption = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
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

exports.signup = catchAsync(async (req, res, next) => {
    let newUser = { ...req.body };
    if (!newUser.email) {
        return next(new AppError("Please provide your email", 400));
    }
    if (!newUser.password) {
        return next(new AppError("Please provide your password", 400));
    }
    if (!newUser.passwordConfirm) {
        return next(new AppError("Please provide your password confirm", 400));
    }

    if (!validator.validate(newUser.email)) {
        return next(new AppError("Please provide a valid email", 400));
    }

    const x = await User.where("email", "==", newUser.email).get();

    if (!x.empty) {
        return next(new AppError("Email already exists", 400));
    }

    if (newUser.password != newUser.passwordConfirm) {
        return next(new AppError("Passwords are not the same!", 400));
    }

    newUser.password = await bcrypt.hash(newUser.password, 12);
    delete newUser.passwordConfirm;
    const userID = uuidv4();
    await User.doc(userID).set(newUser);
    newUser.id = userID;
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    // 2) Check if user exists && password is correct
    const snapshot = await User.where("email", "==", email).get();
    if (snapshot.empty)
        return next(new AppError("Incorrect email or password", 401));

    let user;
    let newUser = {};
    snapshot.forEach((x) => {
        user = x.data();
        newUser["id"] = x.id;
    });

    if (!(await bcrypt.compare(password, user.password)))
        return next(new AppError("Incorrect email or password", 401));

    // 3) If everything is OK, send token to client
    newUser = { ...newUser, ...user };
    createSendToken(newUser, 200, res);
});

exports.logout = (req, res, next) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    next();
};

exports.protect = catchAsync(async (req, res, next) => {
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
        return next(
            new AppError("You are not logged in! Please log in to get access!!!", 401)
        );
    }
    
    next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    if (req.cookies.jwt) {
        try {
            token = req.cookies.jwt;
            const decoded = await promisify(jwt.verify)(
                token,
                process.env.JWT_SECRET
            );
            const userRef = User.doc(decoded.id);
            const user = await userRef.get();
            if (!user.exists) {
                return next();
            }
            let currentUser = { ...user.data(), id: user.id };
            res.locals.user = currentUser;
            return next();
        } catch (error) {
            return next();
        }
    }
    return next();
});
