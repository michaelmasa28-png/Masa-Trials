// =========================================
// admin-nav.js — Shared admin navigation helper
// Session guard · working logout · active link
// =========================================

(function () {
    const SESSION_KEYS = [
        "adminSession",
        "token",
        "admin_name",
        "admin_role",
        "memberSession",
        "memberToken",
        "member_name"
    ];

    function getToken() {
        try {
            const session = JSON.parse(localStorage.getItem("adminSession") || "{}");
            return session.token || localStorage.getItem("token") || "";
        } catch (e) {
            return "";
        }
    }

    // ---- Session guard: admin pages require a token ----
    const publicPages = ["login.html", "index.html", "btn.html", "offerings.html", "clientMode.html", "rolelogin.html"];
    const currentFile = window.location.pathname.split("/").pop() || "index.html";

    if (!publicPages.includes(currentFile)) {
        if (!getToken()) {
            window.location.replace("login.html");
            return;
        }
    }

    // ---- Active link highlighting ----
    document.querySelectorAll(".menu a, .sidebar nav a").forEach(function (link) {
        const href = (link.getAttribute("href") || "").split("?")[0];
        if (href === currentFile) {
            link.classList.add("active");
        }
    });

    // ---- Logout handler (clear all sessions, then leave) ----
    function logout(e) {
        e.preventDefault();
        SESSION_KEYS.forEach(function (k) { localStorage.removeItem(k); });
        window.location.href = "login.html";
    }

    document.querySelectorAll(".menu a[href='login.html'], .sidebar nav a[href='login.html'], a.logout-link").forEach(function (link) {
        link.addEventListener("click", logout);
    });
})();