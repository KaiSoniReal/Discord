const clientId = '1424516359081164840'; // Replace with your Discord Client ID
const redirectUri = 'https://jewls-gray.vercel.app/callback';
const scope = 'identify'; // Add 'email' if needed
const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

document.addEventListener('DOMContentLoaded', () => {
    // Generate QR code
    const qrContainer = document.getElementById('qr-code-container');
    new QRCode(qrContainer, {
        text: discordAuthUrl,
        width: 160,
        height: 160,
        colorDark: '#000000',
        colorLight: '#ffffff'
    });

    // Handle "Log In with Discord" button click
    document.getElementById('discord-login-btn').addEventListener('click', () => {
        console.log('Redirecting to Discord OAuth');
        window.location.href = discordAuthUrl;
    });

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        console.log('Authorization code received:', code);
        exchangeCodeForToken(code);
    }
});

async function exchangeCodeForToken(code) {
    const clientSecret = 'YOUR_CLIENT_SECRET'; // Replace with your Discord Client Secret
    const data = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
    };

    try {
        console.log('Exchanging code for token');
        const response = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(data)
        });

        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.statusText}`);
        }

        const { access_token } = await response.json();
        console.log('Access token received:', access_token);
        fetchUserInfo(access_token);
    } catch (error) {
        console.error('Error exchanging code:', error);
        alert('Login failed. Please try again.');
    }
}

async function fetchUserInfo(accessToken) {
    try {
        console.log('Fetching user info');
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user info: ${response.statusText}`);
        }

        const user = await response.json();
        console.log('User info:', user);
        // Redirect or update UI with user info (e.g., display username)
        alert(`Logged in as ${user.username}`);
        // Optionally redirect to a dashboard
        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Error fetching user info:', error);
        alert('Failed to fetch user info. Please try again.');
    }
}
