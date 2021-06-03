const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const swaggerUi = require("swagger-ui-express")
const swaggerDocument = require("./swagger-document.json")

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api")
const usersRouter = require("./routes/users")
const deviceRouter = require("./routes/device")
const {isLoggedIn} = require("./controllers/authController")

const app = express();

const globalErrorHandler = require("./controllers/errorController");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(isLoggedIn)
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {explorer:true}))
app.use("/api", apiRouter);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/device", deviceRouter);

app.use(function(req, res, next) {
    next(createError(404));
})

// error handling global
app.use(globalErrorHandler);

module.exports = app;
