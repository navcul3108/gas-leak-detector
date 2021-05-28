//var form = new Validator("#register-form");
var isShowed = false;
function showError(message) {
    $("#text-error").show()
    $("#text-error").text(message);
    isShowed = true
}

function signup() {
    const name = $("#full-name").val();
    const email = $("#email").val();
    const password = $("#password").val();
    const passwordConfirm = $("#password-confirmation").val();
    if (!name || !email || !password || !passwordConfirm) {
        showError("Vui lòng nhập đủ thông tin")
        return
    }

    if(password!==passwordConfirm)
    {
        showError("Mật khẩu không khớp")
        return
    }

    $.ajax({
        method: "post",
        url: "/signup",
        dataType: "json",
        data: {
            name, email, password
        },
        success: function (data) {
            document.location.assign("/")
        },
        error: function (err) {
            console.log('err :>> ', err);
            showError(err.message)
        }
    })
};


$(document).ready(function(){
    $("#register-form input").change(function(){
        if(isShowed){
            $("#text-error").hide()
            isShowed = false
        }
    })
})