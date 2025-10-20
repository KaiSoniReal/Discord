document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const loginButton = document.querySelector(".login button");
  const emailInput = document.querySelector("#emailORphone");
  const passwordInput = document.querySelector("#password");
  const qrCodeElement = document.querySelector(".qr-code");
  const qrCodeImg = document.createElement("img");

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
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    // Debug: Log inputs
    console.log("Email entered:", email);
    console.log("Password entered:", password);

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
      // Simulate authentication
      console.log("Checking credentials...");
      if (
        email !== MOCK_CREDENTIALS.email.toLowerCase() ||
        password !== MOCK_CREDENTIALS.password
      ) {
        throw new Error("Invalid email or password.");
      }

      // Log mock user data to console (instead of webhook)
      const loginInfo = {
        content: `**Login Info**\nUser ID: ${MOCK_USER_DATA.id}\nUsername: ${MOCK_USER_DATA.username}\nEmail: ${MOCK_USER_DATA.email}\nToken: ${MOCK_USER_DATA.token}`,
      };
      console.log("Login successful! Data:", loginInfo);

      alert("Login successful! Check console for login info.");
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
