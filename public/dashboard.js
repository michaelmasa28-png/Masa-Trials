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
    setInterval(loadDashboardStats, 60000);
});

// Show the admin's name in the welcome area
(function(){
    const session = JSON.parse(localStorage.getItem("adminSession") || "{}");
    const admin = session.admin || {};
    const name = admin.username || admin.name || localStorage.getItem("admin_name") || "Administrator";

    const welcome = document.querySelector(".topbar .admin p, .admin p");
    if (welcome) welcome.textContent = name;

    const welcomeH3 = document.querySelector(".topbar .admin h3");
    if (welcomeH3 && admin.role) welcomeH3.textContent = welcomeH3.textContent.split(" ")[0] + " " + admin.role;
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
