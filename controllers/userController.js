const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res, next) => {
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
});
