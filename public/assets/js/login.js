// const authController = require("../../../controllers/authController");

const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      alert("Đăng nhập thành công!");
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
  login(data.email, data.password);
};
