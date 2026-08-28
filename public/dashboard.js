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
        const token = session.token || "";

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

        const totalMembersEl = document.getElementById("totalMembers");
        if (totalMembersEl) {
            totalMembersEl.textContent = stats.total_members ?? "0";
        }

    } catch (err) {
        console.error("Failed to load dashboard stats:", err);
    }

}

window.addEventListener("DOMContentLoaded", loadDashboardStats);

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
