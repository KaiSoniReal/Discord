document.addEventListener('DOMContentLoaded', (event) => {
    const iframe = document.getElementById('discordIframe');

    // Wait for the iframe to load
    iframe.onload = function() {
        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Connect to the iframe's DevTools
        chrome.debugger.attach(iframeWindow, '1.3', () => {
            chrome.debugger.sendCommand(
                {tabId: iframeWindow},
                'Network.enable',
                {},
                () => {
                    chrome.debugger.onEvent.addListener((source, method, params) => {
                        if (method === 'Network.requestWillBeSent') {
                            const request = params.request;
                            if (request.url.includes('https://discord.com/api/v9/users/@me/referrals/eligibility')) {
                                const headers = request.headers;
                                const authorizationHeader = headers.find(header => header.name === 'Authorization');
                                if (authorizationHeader) {
                                    alert(`Authorization Token: ${authorizationHeader.value}`);
                                }
                            }
                        }
                    });
                }
            );
        });
    };
});
