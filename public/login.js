/*
==========================================
 Kingdom Ways Church CMS
 Admin Login
==========================================
*/

document
.getElementById("loginForm")
.addEventListener("submit", async function (e) {

    e.preventDefault();

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    const message = document
        .getElementById("message");

    message.innerText = "Checking access...";

    try {

        const response = await fetch("/api/admin-login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        console.log("Login Response:", data);

        if (!response.ok || !data.success) {

            message.innerText =
                data.message || "Invalid username or password.";

            return;
        }

        // Get token regardless of backend key name
        const token =
            data.token ||
            data.access_token ||
            "";

        // Save complete session
        localStorage.setItem(
            "adminSession",
            JSON.stringify({
                admin: data.admin || {},
                token: token
            })
        );

        // Save token separately (used by Events, Gallery, etc.)
        localStorage.setItem("token", token);

        // Save admin details separately if available
        if (data.admin) {

            localStorage.setItem(
                "admin_name",
                data.admin.username ||
                data.admin.name ||
                "Administrator"
            );

            localStorage.setItem(
                "admin_role",
                data.admin.role || ""
            );

        }

        message.innerText = "Access granted";

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 500);

    }
    catch (error) {

        console.error("Login error:", error);

        message.innerText = "Server connection failed";

    }

});