const User = require("./../models/userModel");

exports.getAllUsers = async (req, res, next) => {
    try {
        let result = {};
        const snapshot = await User.get();
        snapshot.forEach((doc) => {
            result[doc.data().name] = doc.data();
        });
        res.status(200).json({
            status: "success",
            results: result.length,
            data: {
                users: result,
            },
        });

    }
    catch (err) {
        next(err)
    }
};
