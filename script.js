const form = document.getElementById("feedbackForm");
const ajaxBtn = document.getElementById("ajaxBtn");
const submitBtn = document.getElementById("submitBtn");
const feedback = document.getElementById("feedback");

// 驗證函數
function validateForm() {
  let isValid = true;

  // 清除所有錯誤
  document
    .querySelectorAll(".error-message")
    .forEach((el) => (el.textContent = ""));
  document
    .querySelectorAll(".error")
    .forEach((el) => el.classList.remove("error"));

  // 驗證姓名
  const name = document.getElementById("name");
  if (!name.value.trim()) {
    showError("name", "請輸入姓名");
    isValid = false;
  }

  // 驗證產品選擇
  const option = document.getElementById("option");
  if (!option.value) {
    showError("option", "請選擇產品");
    isValid = false;
  }

  // 驗證心得
  const comment = document.getElementById("comment");
  if (!comment.value.trim()) {
    showError("comment", "請輸入使用心得");
    isValid = false;
  } else if (comment.value.trim().length < 10) {
    showError("comment", "心得內容至少需要10個字");
    isValid = false;
  }

  // 驗證推薦選項
  const recommand = document.querySelector('input[name="recommand"]:checked');
  if (!recommand) {
    showError("recommand", "請選擇是否推薦");
    isValid = false;
  }

  return isValid;
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (field) field.classList.add("error");
  if (errorEl) errorEl.textContent = message;
}

function showFeedback(message, type = "") {
  feedback.textContent = message;
  feedback.className = "feedback";
  if (type) feedback.classList.add(type);
}

function setLoadingState(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.classList.add("loading");
    button.style.color = "transparent";
  } else {
    button.disabled = false;
    button.classList.remove("loading");
    button.style.color = "";
  }
}

function getFormData() {
  const formData = new FormData(form);
  const data = [];

  for (let [key, value] of formData.entries()) {
    data.push({ name: key, value: value });
  }

  return data;
}

function sendAjaxRequest() {
  if (!validateForm()) {
    showFeedback("請填寫所有必填欄位", "error");
    return;
  }

  const data = getFormData();
  const jsonField = data.find((obj) => obj.name === "json");
  if (jsonField) {
    jsonField.value = "true";
  }

  setLoadingState(ajaxBtn, true);
  setLoadingState(submitBtn, true);
  showFeedback("");

  fetch("https://2017.awiclass.monoame.com/api/demo/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data.map((item) => [item.name, item.value])),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((result) => {
      console.log("AJAX 結果:", result);
      showFeedback(result.response || "感謝您的回饋!", "success");

      // 成功後清空表單
      setTimeout(() => {
        form.reset();
        showFeedback("");
      }, 3000);
    })
    .catch((error) => {
      console.error("AJAX 錯誤:", error);
      showFeedback("發生錯誤,請稍後再試", "error");
    })
    .finally(() => {
      setLoadingState(ajaxBtn, false);
      setLoadingState(submitBtn, false);
    });
}

// 事件監聽
ajaxBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("AJAX 送出");
  sendAjaxRequest();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showFeedback("請填寫所有必填欄位", "error");
    return;
  }

  // 如果需要傳統表單提交,取消註解下面這行
  // form.submit();

  // 預設使用 AJAX 送出
  sendAjaxRequest();
});

// 即時清除錯誤訊息
form.querySelectorAll("input, textarea, select").forEach((field) => {
  field.addEventListener("input", () => {
    if (field.classList.contains("error")) {
      field.classList.remove("error");
      const errorEl = document.getElementById(`${field.id}-error`);
      if (errorEl) errorEl.textContent = "";
    }
  });
});

// 清除 radio 錯誤
document.querySelectorAll('input[name="recommand"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const errorEl = document.getElementById("recommand-error");
    if (errorEl) errorEl.textContent = "";
  });
});
