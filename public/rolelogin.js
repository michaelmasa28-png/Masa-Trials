/**
 * Kingdom Ways Authentication Middleware Script Interface Handler
 */

document.addEventListener("DOMContentLoaded", () => {
    initPortalAuthenticationWorkflow();
});

/**
 * Attaches operational monitors to key submissions actions pathways
 */
function initPortalAuthenticationWorkflow() {
    const loginFormElement = document.getElementById('secureLoginForm');
    if (!loginFormElement) return;

    loginFormElement.addEventListener('submit', async (event) => {
        event.preventDefault();

        const accessKeyField = document.getElementById('portalAccessKey');
        const enterButton = document.getElementById('enterBtn');
        
        if (!accessKeyField || !enterButton) return;

        const rawKeyValueInput = accessKeyField.value.trim();

        // Establish visual loading feedback state routines parameters parameters mapping loops updates
        enterButton.disabled = true;
        const originalButtonHTMLMarkupInnerContentTextData = enterButton.innerHTML;
        enterButton.innerHTML = `<span>VALIDATING ENTRY KEY...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

        try {
            // BACKEND INTEGRATION POINT: Send authentication validation network payloads down server route endpoints
            // Expected backend schema return structure object layout match: { "authenticated": true, "redirect": "dashboard.html" }
            const networkResponseResult = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secure_key: rawKeyValueInput })
            });

            if (networkResponseResult.ok) {
                const responseData = await networkResponseResult.json();
                
                if (responseData.authenticated) {
                    enterButton.innerHTML = `<span>ACCESS GRANTED</span> <i class="fa-solid fa-circle-check"></i>`;
                    enterButton.style.boxShadow = "0 0 30px #22c55e";
                    
                    // Route user dynamically based on the authorization rule mapped by the server session parameters
                    setTimeout(() => {
                        window.location.href = responseData.redirect || 'dashboard.html';
                    }, 600);
                } else {
                    triggerAccessKeyDenialFeedback(accessKeyField, enterButton, originalButtonHTMLMarkupInnerContentTextData);
                }
            } else {
                triggerAccessKeyDenialFeedback(accessKeyField, enterButton, originalButtonHTMLMarkupInnerContentTextData);
            }

        } catch (error) {
            console.error("Authentication request loop exception error tracking data intercept logs:", error);
            alert("Connection error: Authentication servers are currently offline or unreachable.");
            
            // Re-enable form properties constraints layout controls sets triggers
            enterButton.disabled = false;
            enterButton.innerHTML = originalButtonHTMLMarkupInnerContentTextData;
        }
    });
}

/**
 * Handles error messaging, field resets, and animation shakers when validation criteria drops bounds parameters
 */
function triggerAccessKeyDenialFeedback(inputFieldElementToReset, actionButtonToReset, originalActionLabelHTMLDataTextString) {
    alert("Access Denied: Invalid parameters key signature token.");
    
    // Reset control items attributes variables state conditions workflows elements loops trackers
    inputFieldElementToReset.value = '';
    inputFieldElementToReset.focus();
    
    actionButtonToReset.disabled = false;
    actionButtonToReset.innerHTML = originalActionLabelHTMLDataTextString;
}
