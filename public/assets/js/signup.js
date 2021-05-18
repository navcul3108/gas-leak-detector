// const authController = require("../../../controllers/authController");

var form = new Validator("#register-form");
form.onSubmit = function (data) {
  authController.signup(data);
  signup("ez");
};

const signup = (email, password) => {
  alert(email, password);
};
