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

    // Safeguard: Only update the element if it exists in the HTML view
    const dateElement = document.getElementById("date");
    if (dateElement) {
        dateElement.innerHTML = date + "<br>" + time;
    }
}

// Initialize on execution load
updateDateTime();

// Keep running every single second
setInterval(updateDateTime, 1000);

async function loadDashboardStats(){

    const response = await fetch("/dashboard/stats");

    const stats = await response.json();

document.getElementById("totalMembers").textContent =
    stats.total_members;

}

window.addEventListener("DOMContentLoaded", loadDashboardStats);
