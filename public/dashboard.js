// =========================================
// KINGDOM WAYS PENTECOSTAL CHURCH
// dashboard.js - Admin Interface Controller
// =========================================

function updateDateTime() {
    const now = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    const date = now.toLocaleDateString("en-GB", options);
    const time = now.toLocaleTimeString();

    const dateElement = document.getElementById("date");
    if (dateElement) {
        dateElement.innerHTML = date + "<br>" + time;
    }
}

updateDateTime();
setInterval(updateDateTime, 1000);

async function loadDashboardStats() {

    try {
        const session = JSON.parse(localStorage.getItem("adminSession") || "{}");
        const token = session.token || localStorage.getItem("token") || "";

        if (!token) {
            console.warn("No admin token found");
            return;
        }

        const response = await fetch("/dashboard/stats", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.warn("Dashboard stats unavailable:", response.status);
            return;
        }

        const stats = await response.json();

        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        set("totalMembers", stats.total_members ?? "0");
        set("upcomingEvents", stats.upcoming_events ?? "0");
        set("attendanceCount", stats.today_attendance ?? "0");
        set("offeringsTotal", "KSh " + Number(stats.monthly_offerings ?? 0).toLocaleString());

    } catch (err) {
        console.error("Failed to load dashboard stats:", err);
    }

}

// Fill the stat cards with real numbers, then keep them fresh automatically
window.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
    loadRecentActivity();
    setInterval(loadDashboardStats, 60000);
});

async function loadRecentActivity() {
    try {
        const session = JSON.parse(localStorage.getItem("adminSession") || "{}");
        const token = session.token || localStorage.getItem("token") || "";
        if (!token) return;

        const res = await fetch("/dashboard/activity", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) return;
        const data = await res.json();
        const tbody = document.getElementById("recentActivityBody");
        if (!tbody || !data.activities) return;

        tbody.innerHTML = data.activities.map(function (item) {
            const cls =
                item.status === "Success" ? "done" :
                item.status === "Pending" ? "pending" : "info";
            return `<tr>
                <td>${item.date || ""}</td>
                <td>${item.activity || ""}</td>
                <td><span class="status-pill ${cls}">${item.status}</span></td>
            </tr>`;
        }).join("");

        if (!data.activities.length) {
            tbody.innerHTML = `<tr><td colspan="3">No recent activity yet.</td></tr>`;
        }
    } catch (err) {
        console.error("Failed to load recent activity:", err);
    }
}

// Show the admin's name in the welcome area
(async function(){
    try {
        const session = JSON.parse(localStorage.getItem("adminSession") || "{}");
        const token = session.token || localStorage.getItem("token") || "";

        const admin = session.admin || {};
        const name = admin.username || admin.name || localStorage.getItem("admin_name") || "Administrator";

        const welcome = document.querySelector(".topbar .admin p, .admin p");
        if (welcome) welcome.textContent = name;

        const welcomeH3 = document.querySelector(".topbar .admin h3");
        if (welcomeH3 && admin.role) welcomeH3.textContent = welcomeH3.textContent.split(" ")[0] + " " + admin.role;

        // ---- Live M-Pesa readiness check ----
        const line = document.getElementById("mpesaStatusLine");
        const detail = document.getElementById("mpesaStatusDetail");
        const panel = document.getElementById("mpesaStatus");

        if (!token) {
            if (line) line.textContent = "Admin token missing";
            if (detail) detail.textContent = "Log in again to refresh.";
            if (panel) panel.classList.add("bad");
            return;
        }

        const res = await fetch("/api/finance/mpesa-diagnostics", {
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            if (line) line.textContent = "Could not check M-Pesa status";
            if (detail) detail.textContent = "Server returned: " + (data.detail || "unknown error");
            if (panel) panel.classList.add("bad");
            return;
        }

        const cfg = data.config || {};
        const missing = [];
        if (!cfg.consumer_key) missing.push("Consumer Key");
        if (!cfg.consumer_secret) missing.push("Consumer Secret");
        if (!cfg.shortcode) missing.push("Shortcode");
        if (!cfg.passkey) missing.push("Passkey");
        if (!cfg.callback_url) missing.push("Callback URL");

        if (missing.length) {
            if (line) line.textContent = "M-Pesa NOT configured";
            if (detail) detail.textContent = "Missing on server: " + missing.join(", ");
            if (panel) panel.classList.add("bad");
        } else {
            const envLabel = (data.env || "sandbox") === "sandbox" ? "TEST MODE (sandbox)" : "LIVE";
            if (line) line.textContent = "M-Pesa configured — " + envLabel;
            if (detail) detail.textContent =
                (data.issues || []).join("; ") ||
                "Everything is set up. Payments should work.";
            if (data.env !== "sandbox") {
                if (panel) panel.classList.add("good");
            } else {
                if (panel) panel.classList.add("warn");
            }
        }
    } catch (e) {
        console.error("M-Pesa status check failed:", e);
        const line = document.getElementById("mpesaStatusLine");
        if (line) line.textContent = "Could not reach server";
    }
})();

// Sidebar toggle
(function(){
    const toggle = document.getElementById("sidebarToggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if(!toggle || !sidebar) return;

    function openSidebar(){
        sidebar.classList.add("open");
        toggle.classList.add("open");
        overlay.classList.add("active");
    }

    function closeSidebar(){
        sidebar.classList.remove("open");
        toggle.classList.remove("open");
        overlay.classList.remove("active");
    }

    toggle.addEventListener("click", function(){
        sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener("click", closeSidebar);
})();
