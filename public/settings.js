/**
 * Kingdomways Settings Portal - Part 1: Core Configuration
 */

// 1. Define explicit layout permissions for each admin role
const ACCESS_POLICIES = {
    'Super Admin': {
        showProfile: true,
        showNotifications: true,
        showUserTable: true,
        disableNameField: false
    },
    'Finance Officer': {
        showProfile: true,
        showNotifications: false, // Hides notifications completely
        showUserTable: false,       // Hides authorized users table completely
        disableNameField: true     // Locks the core church name field input element
    },
    'Youth Leader': {
        showProfile: false,        // Hides church profile entirely
        showNotifications: true,
        showUserTable: false,       // Hides authorized users table completely
        disableNameField: false
    }
};

// 2. Main Entry Point: Trigger orchestrated script workflow on page load
document.addEventListener("DOMContentLoaded", () => {
    initDashboardSettingsPage();
});

/**
 * Orchestrates the asynchronous data loading pipeline
 */
async function initDashboardSettingsPage() {
    try {
        // Fetch identity payload directly from the active backend session
        const sessionData = await fetchActiveSessionUser();
        
        // Update top navigation bar interface indicators dynamically
        document.getElementById('admin-display-name').textContent = sessionData.name;
        document.getElementById('settings-role-badge').textContent = `Role: ${sessionData.role}`;

        // Enforce role separation visibility configurations
        applyRoleVisibilityEngine(sessionData.role);

        // Conditional background database queries based on current user role properties
        if (ACCESS_POLICIES[sessionData.role]?.showProfile) {
            await loadChurchProfileDatabaseFields();
        }
        if (ACCESS_POLICIES[sessionData.role]?.showNotifications) {
            await loadNotificationPreferenceDatabaseFields();
        }
        if (ACCESS_POLICIES[sessionData.role]?.showUserTable) {
            await loadSystemUsersManagementTableData();
        }

        // Initialize secure submission event interceptors
        attachSystemFormSubmissionListeners();

    } catch (err) {
        console.error("Critical execution breakdown within settings panel:", err);
        displayInterfaceFailureShield("An unexpected authentication check loop failed while communicating parameters updates.");
    }
}

/**
 * Communicates with backend endpoints to capture logged-in identity tracking states
 */
async function fetchActiveSessionUser() {
    // BACKEND INTEGRATION NOTE: Replace with your actual live routing path
    // Expected DB JSON return schema blueprint shape: { "name": "Brother Mwangi", "role": "Finance Officer" }
    const response = await fetch('/api/current-user');
    if (!response.ok) throw new Error("Could not pull authorization state profile credentials token.");
    return await response.json();
}

/**
 * Kingdomways Settings Portal - Part 2: Dynamic UI Controllers
 */

/**
 * Filters card elements views strictly relying on active ACCESS_POLICIES rules
 */
function applyRoleVisibilityEngine(userRole) {
    const activePolicy = ACCESS_POLICIES[userRole];
    
    if (!activePolicy) {
        displayInterfaceFailureShield("Your designated workspace level clearance assignment is unmapped.");
        return;
    }

    // Toggle parent sections visibility blocks smoothly to match exact role restrictions
    document.getElementById('profileCard').style.display = activePolicy.showProfile ? 'block' : 'none';
    document.getElementById('notifyCard').style.display = activePolicy.showNotifications ? 'block' : 'none';
    document.getElementById('userManagementSection').style.display = activePolicy.showUserTable ? 'block' : 'none';

    // Apply strict field constraints and locking metrics to organization inputs
    const orgNameInput = document.getElementById('orgNameInput');
    if (orgNameInput && activePolicy.disableNameField) {
        orgNameInput.disabled = true;
        orgNameInput.style.backgroundColor = '#f1f3f5';
        orgNameInput.style.color = '#6c757d';
        orgNameInput.style.cursor = 'not-allowed';
    }
}

/**
 * Populates form inputs with active church configuration records from the database
 */
async function loadChurchProfileDatabaseFields() {
    try {
        const response = await fetch('/api/settings/profile');
        if (response.ok) {
            const data = await response.json();
            if (document.getElementById('orgNameInput')) document.getElementById('orgNameInput').value = data.organization_name || '';
            if (document.getElementById('currencyInput')) document.getElementById('currencyInput').value = data.currency_symbol || '';
        }
    } catch (e) { console.error("Error setting configuration profile parameters fields:", e); }
}

/**
 * Populates checkbox components with saved preferences criteria variables
 */
async function loadNotificationPreferenceDatabaseFields() {
    try {
        const response = await fetch('/api/settings/notifications');
        if (response.ok) {
            const data = await response.json();
            document.getElementById('emailRegInput').checked = !!data.email_registrations;
            document.getElementById('emailOfferInput').checked = !!data.email_offerings;
            document.getElementById('smsUrgentInput').checked = !!data.sms_urgent;
        }
    } catch (e) { console.error("Error rendering notification metrics configurations checkboxes:", e); }
}

/**
 * Renders user management role rows structures dynamically inside the HTML table canvas
 */
async function loadSystemUsersManagementTableData() {
    try {
        const response = await fetch('/api/settings/users');
        if (response.ok) {
            const usersList = await response.json();
            const targetContainerBody = document.getElementById('usersTableBody');
            if (!targetContainerBody) return;
            
            targetContainerBody.innerHTML = ''; // Wipe static dashboard layout templates out
            
            usersList.forEach(userItem => {
                const tableRow = document.createElement('tr');
                tableRow.innerHTML = `
                    <td>${escapeHTMLSafeMetrics(userItem.username)}</td>
                    <td>${escapeHTMLSafeMetrics(userItem.role)}</td>
                    <td>${escapeHTMLSafeMetrics(userItem.status)}</td>
                `;
                targetContainerBody.appendChild(tableRow);
            });
        }
    } catch (e) { console.error("Error filling administration system metadata tabular rows:", e); }
}

