// const authController = require("../../../controllers/authController");

const login = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/signup",
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === "success") {
      alert("Đăng ký thành công!");
      window.setTimeout(() => {
        location.assign("/");
      }, 500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

var form = new Validator("#register-form");

form.onSubmit = function (data) {
  const name = data.fullname,
    email = data.email,
    password = data.password,
    passwordConfirm = data.password_confirmation;
  login(name, email, password, passwordConfirm);
};
