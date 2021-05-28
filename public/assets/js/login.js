var isShowed = false;
function showError(message) {
    $("#text-error").show()
    $("#text-error").text(message);
    isShowed = true
}

function login() {
    const email = $("#email").val();
    const password = $("#password").val();

    if (!email || !password) {
        showError("Bạn cần nhập đủ thông tin")
        return
    }
    if (password.length < 6) {
        showError("Mật khẩu cần tối thiểu 6 ký tự!")
        return
    }

    $.ajax({
        method: "post",
        url: "/users/login",
        data: {
            email,
            password,
        },
        success: function (data) {
            document.location.assign("/")
        },
        error: function (err) {
            console.error(err);
            showError(err.message)
        }
    });
};

$(document).ready(function () {
    $("#login-form input").change(function () {
        if (isShowed) {
            $("#text-error").hide()
            isShowed = false
        }
    })
})
