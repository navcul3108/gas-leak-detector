// const authController = require("../../../controllers/authController");

const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://localhost:3000/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      alert("Đăng nhập thành công!");
      window.setTimeout(() => {
        location.assign("/feed");
      }, 1500);
    }
  } catch (err) {
    console.log(err.response.data);
  }
};

var form = new Validator("#register-form");
form.onSubmit = function (data) {
  login(data.email, data.password);
};
