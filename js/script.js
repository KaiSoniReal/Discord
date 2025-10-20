<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Discord Login Test</title>
  <script src="https://unpkg.com/qrcode@1.5.1/build/qrcode.min.js"></script>
  <style>
    .spinnerItem {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #000;
      border-radius: 50%;
      margin: 0 2px;
    }
    @keyframes spinner-pulsing-ellipsis {
      0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; }
    }
    .input-groups { margin: 20px; }
    .main-form-header { text-align: center; }
    .email-wrapper, .password-wrapper { margin: 10px 0; }
    .required { color: red; }
    .forgot-password, .small-register { margin: 10px 0; }
    button { padding: 10px 20px; cursor: pointer; }
  </style>
</head>
<body>
  <form action="#">
    <div class="input-groups">
      <div class="main-form-header">
        <h1>Welcome back!</h1>
        <p>We're so excited to see you again!</p>
      </div>
      <div class="email-wrapper">
        <label for="emailORphone">EMAIL OR PHONE NUMBER <span class="required">*</span></label>
        <input type="text" id="emailORphone">
      </div>
      <div class="password-wrapper">
        <label for="password">PASSWORD <span class="required">*</span></label>
        <input type="password" id="password">
      </div>
    </div>
    <div class="forgot-password">
      <a href="#">Forgot your password?</a>
    </div>
    <div class="login">
      <button type="submit">Log In</button>
    </div>
    <div class="small-register">
      <span>Need an account?</span>
      <a href="#">Register</a>
    </div>
  </form>
  <script src="script.js"></script> <!-- Or paste script here -->
</body>
</html>
