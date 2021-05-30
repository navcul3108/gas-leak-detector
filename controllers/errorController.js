const sendError = (err, res) => {
    if (process.env.NODE_ENV === "production")
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    else
        // We only show stack trace when running on development environment
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack
        });

    res.end();
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    sendError(err, res);
};
