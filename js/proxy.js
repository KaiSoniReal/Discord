export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { login, password } = req.body;

  try {
    const response = await fetch("https://discord.com/api/v9/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        login,
        password,
        undelete: false,
        login_source: null,
        gift_code_sku_id: null
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: await response.text() });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
