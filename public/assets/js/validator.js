function Validator(formSelector) {
  var _this = this;
  var formRules = {};

  /**
   * Quy ước tạo rule
   * 1. Nếu có lỗi, return `message lỗi`
   * 2. Nếu ko có lỗi, return undefined
   */
  var validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này";
    },
    email: function (value) {
      var regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return regex.test(value) ? undefined : "Email không đúng";
    },
    min: function (minValue) {
      return function (value) {
        return value.length >= minValue
          ? undefined
          : `Nhập ít nhất ${minValue} ký tự!`;
      };
    },
  };

  // Lấy ra form element trong DOM theo formSelector
  var formElement = document.querySelector(formSelector);

  // chỉ xử lý khi có element trong DOM
  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");
    Array.from(inputs).forEach(function (input) {
      if (!Array.isArray(formRules[input.name])) formRules[input.name] = [];
      var inputChild = input.getAttribute("rules").split("|");
      for (let x of inputChild) {
        if (x.includes(":")) {
          let temp = x.split(":");
          formRules[input.name].push(validatorRules[temp[0]](temp[1]));
        } else {
          formRules[input.name].push(validatorRules[x]);
        }
      }

      // Lắng nghe sự kiện để validate (blur, change, ...)
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    });
  }

  function handleValidate(event) {
    var rules = formRules[event.target.name];
    var errorMessage;
    for (var rule of rules) {
      errorMessage = rule(event.target.value);
      var formGroup = event.target.closest(".form-group");
      if (formGroup) {
        var errorElement = formGroup.querySelector(".form-message");
        if (errorElement) {
          // Nếu có lỗi thì hiển thị mesasge lỗi ra UI
          if (errorMessage) {
            errorElement.innerText = errorMessage;
            errorElement.classList.add("invalid");
            break;
          } else {
            errorElement.innerText = "";
          }
        }
      }
    }
    return !errorMessage;
  }

  function handleClearError(event) {
    var formGroup = event.target.closest(".form-group");
    var errorElement = formGroup.querySelector(".form-message");
    if (errorElement.classList.contains("invalid")) {
      errorElement.classList.remove("invalid");
      errorElement.innerText = "";
    }
  }

  // Xử lý hành vi submit form
  formElement.onsubmit = function (event) {
    event.preventDefault();
    var inputs = formElement.querySelectorAll("[name][rules]");
    var isValid = true;
    for (var input of inputs) {
      if (!handleValidate({ target: input })) {
        isValid = false;
      }
    }

    // Khi không có lỗi thì submit form
    if (isValid) {
      if (typeof _this.onSubmit === "function") {
        var enableInputs = formElement.querySelectorAll(
          "[name][rules]:not([disable])"
        );
        var formValues = Array.from(enableInputs).reduce(function (
          values,
          input
        ) {
          switch (input.type) {
            case "checkbox":
              if (!Array.isArray(values[input.name])) values[input.name] = [];
              if (input.matches(":checked"))
                values[input.name].push(input.value);
              break;
            case "radio":
              if (input.matches(":checked")) values[input.name] = input.value;
              break;
            case "file":
              values[input.name] = input.files;
              break;
            default:
              values[input.name] = input.value;
          }
          return values;
        },
        {});
        _this.onSubmit(formValues);
      } else {
        formElement.submit();
      }
    }
  };
}
