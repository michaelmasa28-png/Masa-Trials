/**
 * Kingdom Ways Church CMS — Settings Portal
 */

// ==========================================================
// UTILITIES
// ==========================================================

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showToast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; }, 2500);
    setTimeout(() => { el.remove(); }, 3000);
}

const CURRENT_USER = { name: '', role: '', isSuperAdmin: false };

// ==========================================================
// ACCESS POLICIES
// ==========================================================

const ACCESS_POLICIES = {
    'super_admin': { theme: true, vision: true, contact: true, profile: true, notifications: true, users: true, cardBg: true, givingAccounts: true },
    'admin':       { theme: false, vision: false, contact: false, profile: true, notifications: true, users: false, cardBg: false, givingAccounts: false },
    'secretary':   { theme: true, vision: true, contact: true, profile: false, notifications: true, users: false, cardBg: true, givingAccounts: false },
    'treasurer':   { theme: false, vision: false, contact: false, profile: true, notifications: true, users: false, cardBg: false, givingAccounts: false },
    'pastor':      { theme: true, vision: true, contact: false, profile: false, notifications: false, users: false, cardBg: false, givingAccounts: false },
};

function getPolicy(role) {
    return ACCESS_POLICIES[role] || ACCESS_POLICIES['admin'];
}

// ==========================================================
// INIT
// ==========================================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const user = await fetchJSON('/api/current-user');
        CURRENT_USER.name = user.name;
        CURRENT_USER.role = user.role;
        CURRENT_USER.isSuperAdmin = (user.role === 'super_admin');

        document.getElementById('admin-display-name').textContent = user.name;
        document.getElementById('settings-role-badge').textContent = `Role: ${user.role}`;

        const policy = getPolicy(user.role);

        if (policy.theme)   { document.getElementById('themeCard').style.display = 'block'; loadTheme(); }
        if (policy.vision)  { document.getElementById('visionCard').style.display = 'block'; loadVision(); }
        if (policy.contact) { document.getElementById('contactCard').style.display = 'block'; loadContact(); }
        if (policy.profile) { document.getElementById('profileCard').style.display = 'block'; loadProfile(); }
        if (policy.notifications) { document.getElementById('notifyCard').style.display = 'block'; loadNotifications(); }
        if (policy.users)   { document.getElementById('userManagementSection').style.display = 'block'; loadUsers(); }
        if (policy.cardBg)  { document.getElementById('cardBgCard').style.display = 'block'; loadCardBackgrounds(); }
        if (policy.givingAccounts) { document.getElementById('givingAccountsCard').style.display = 'block'; loadGivingAccounts(); }

        attachFormListeners();
    } catch (err) {
        console.error('Settings init failed:', err);
    }
}

// ==========================================================
// FETCH HELPER
// ==========================================================

async function fetchJSON(url, opts = {}) {
    const headers = opts.headers || {};
    const token = (JSON.parse(localStorage.getItem('adminSession') || '{}').token) ||
        localStorage.getItem('token') || '';
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const resp = await fetch(url, { ...opts, headers });
    if (!resp.ok) throw new Error(`${resp.status}`);
    return resp.json();
}

// ==========================================================
// FORM LISTENERS
// ==========================================================

function attachFormListeners() {
    const themeForm = document.getElementById('themeForm');
    if (themeForm) themeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await fetchJSON('/api/theme', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: document.getElementById('themeInput').value })
            });
            showToast('Theme saved');
        } catch (err) { showToast('Failed to save theme', 'error'); }
    });

    const visionForm = document.getElementById('visionForm');
    if (visionForm) visionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await fetchJSON('/api/vision', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vision: document.getElementById('visionInput').value })
            });
            showToast('Vision saved');
        } catch (err) { showToast('Failed to save vision', 'error'); }
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await fetchJSON('/api/church/contact', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: document.getElementById('contactPhone').value,
                    whatsapp: document.getElementById('contactWhatsapp').value,
                    email: document.getElementById('contactEmail').value,
                    facebook: document.getElementById('contactFacebook').value,
                    instagram: document.getElementById('contactInstagram').value,
                    youtube: document.getElementById('contactYoutube').value,
                    website: document.getElementById('contactWebsite').value,
                    maps_link: document.getElementById('contactMaps').value,
                    office_hours: document.getElementById('contactHours').value,
                })
            });
            showToast('Contact details saved');
        } catch (err) { showToast('Failed to save contact', 'error'); }
    });
}

// ==========================================================
// LOAD DATA
// ==========================================================

async function loadTheme() {
    try {
        const data = await fetchJSON('/api/theme');
        document.getElementById('themeInput').value = data.theme || '';
    } catch (e) { console.error('Theme load error:', e); }
}

async function loadVision() {
    try {
        const data = await fetchJSON('/api/vision');
        document.getElementById('visionInput').value = data.vision || '';
    } catch (e) { console.error('Vision load error:', e); }
}

async function loadContact() {
    try {
        const data = await fetchJSON('/api/church/contact');
        document.getElementById('contactPhone').value = data.phone || '';
        document.getElementById('contactWhatsapp').value = data.whatsapp || '';
        document.getElementById('contactEmail').value = data.email || '';
        document.getElementById('contactFacebook').value = data.facebook || '';
        document.getElementById('contactInstagram').value = data.instagram || '';
        document.getElementById('contactYoutube').value = data.youtube || '';
        document.getElementById('contactWebsite').value = data.website || '';
        document.getElementById('contactMaps').value = data.maps_link || '';
        document.getElementById('contactHours').value = data.office_hours || '';
    } catch (e) { console.error('Contact load error:', e); }
}

async function loadProfile() {
    try {
        const data = await fetchJSON('/api/settings/profile');
        document.getElementById('orgNameInput').value = data.organization_name || '';
        document.getElementById('currencyInput').value = data.currency_symbol || '';
    } catch (e) { console.error('Profile load error:', e); }
}

async function loadNotifications() {
    try {
        const data = await fetchJSON('/api/settings/notifications');
        document.getElementById('emailRegInput').checked = !!data.email_registrations;
        document.getElementById('emailOfferInput').checked = !!data.email_offerings;
        document.getElementById('smsUrgentInput').checked = !!data.sms_urgent;
    } catch (e) { console.error('Notification load error:', e); }
}

// ==========================================================
// ADMIN USERS TABLE
// ==========================================================

async function loadUsers() {
    try {
        const users = await fetchJSON('/api/settings/users');
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        users.forEach(u => {
            const tr = document.createElement('tr');
            const canManage = CURRENT_USER.isSuperAdmin && u.id !== undefined;
            let actions = '';

            if (canManage) {
                actions = `
                    <td>
                        <select class="role-select" data-id="${u.id}" style="padding:3px 6px;font-size:12px;border-radius:4px;border:1px solid #ccc;">
                            <option value="super_admin" ${u.role==='super_admin'?'selected':''}>Super Admin</option>
                            <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                            <option value="secretary" ${u.role==='secretary'?'selected':''}>Secretary</option>
                            <option value="treasurer" ${u.role==='treasurer'?'selected':''}>Treasurer</option>
                            <option value="pastor" ${u.role==='pastor'?'selected':''}>Pastor</option>
                        </select>
                        <button class="btn-role" onclick="changeRole(${u.id}, this.previousElementSibling.value)">Set</button>
                        <button class="btn-danger" onclick="deleteAdmin(${u.id}, '${escapeHTML(u.username)}')">Delete</button>
                    </td>`;
            } else {
                actions = `<td style="color:#999;">—</td>`;
            }

            tr.innerHTML = `
                <td>${escapeHTML(u.full_name || u.username)}</td>
                <td>${escapeHTML(u.username)}</td>
                <td>${escapeHTML(u.role)}</td>
                <td>${escapeHTML(u.status || 'Active')}</td>
                ${actions}
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error('Users load error:', e); }
}

async function changeRole(adminId, newRole) {
    if (!confirm(`Change this admin's role to "${newRole}"?`)) return;
    try {
        const result = await fetchJSON(`/admin/${adminId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });
        if (result.success) {
            showToast(result.message);
            loadUsers();
        } else {
            showToast(result.message || 'Failed', 'error');
        }
    } catch (e) { showToast('Request failed', 'error'); }
}

async function deleteAdmin(adminId, username) {
    if (!confirm(`Delete admin "${username}"? This cannot be undone.`)) return;
    try {
        const result = await fetchJSON(`/admin/${adminId}`, { method: 'DELETE' });
        if (result.success) {
            showToast(result.message);
            loadUsers();
        } else {
            showToast(result.message || 'Failed', 'error');
        }
    } catch (e) { showToast('Request failed', 'error'); }
}

// ==========================================================
// CARD BACKGROUNDS
// ==========================================================

const CARD_LABELS = {
    'sermons': 'Sermons', 'notice': 'Notice Board', 'connect': 'Connect Hub',
    'sunday-live': 'Sunday Live', 'offerings': 'Offerings', 'contact': 'Contact Us'
};

async function loadCardBackgrounds() {
    const container = document.getElementById('cardBgList');
    if (!container) return;
    try {
        const data = await fetchJSON('/api/card-backgrounds');
        const existing = {};
        if (data.backgrounds) data.backgrounds.forEach(bg => { existing[bg.card_key] = bg.image_url; });

        container.innerHTML = '';
        Object.entries(CARD_LABELS).forEach(([key, label]) => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'border:1px solid #e0e0e0;border-radius:8px;padding:12px;text-align:center;background:#fafafa;';
            const preview = existing[key]
                ? `<img src="${existing[key]}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;">`
                : `<div style="width:100%;height:100px;background:#e0e0e0;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">No Image</div>`;
            wrapper.innerHTML = `
                ${preview}
                <div style="font-weight:600;font-size:13px;margin-bottom:8px;">${label}</div>
                <input type="file" accept="image/*" class="card-bg-input" style="display:none;">
                <button onclick="this.previousElementSibling.click();" style="padding:5px 12px;font-size:12px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;margin-right:4px;">
                    ${existing[key] ? 'Change' : 'Upload'}
                </button>
                ${existing[key] ? `<button onclick="deleteCardBg('${key}');" style="padding:5px 12px;font-size:12px;background:#ef4444;color:white;border:none;border-radius:4px;cursor:pointer;">Remove</button>` : ''}
            `;
            container.appendChild(wrapper);
            wrapper.querySelector('.card-bg-input').addEventListener('change', (e) => uploadCardBg(key, e.target.files[0]));
        });
    } catch (e) { console.error('Card backgrounds load error:', e); }
}

async function uploadCardBg(cardKey, file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
        const result = await fetchJSON(`/api/card-backgrounds/${cardKey}`, { method: 'POST', body: fd });
        if (result.success) { showToast('Background updated'); loadCardBackgrounds(); }
        else showToast(result.message || 'Upload failed', 'error');
    } catch (e) { showToast('Upload failed', 'error'); }
}

async function deleteCardBg(cardKey) {
    if (!confirm('Remove this background?')) return;
    try {
        const result = await fetchJSON(`/api/card-backgrounds/${cardKey}`, { method: 'DELETE' });
        if (result.success) { showToast('Background removed'); loadCardBackgrounds(); }
    } catch (e) { showToast('Delete failed', 'error'); }
}

// ==========================================================
// GIVING ACCOUNTS
// ==========================================================

async function loadGivingAccounts() {
    const list = document.getElementById('givingAccountsList');
    if (!list) return;
    try {
        const data = await fetchJSON('/api/settings/giving-accounts');
        const accounts = data.accounts || [];
        list.innerHTML = '';

        if (!accounts.length) {
            list.innerHTML = '<p style="color:#888;font-size:13px;padding:8px 0;">No giving accounts added yet.</p>';
            return;
        }

        accounts.forEach(a => {
            const typeLabel = a.account_type === 'paybill' ? 'PayBill' : 'Phone';
            const card = document.createElement('div');
            card.style.cssText = 'border:1px solid #e0e0e0;border-radius:8px;padding:12px;margin-bottom:10px;background:#fff;';
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                    <div>
                        <strong style="font-size:14px;">${escapeHTML(a.name)}</strong>
                        <span style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:10px;font-size:11px;background:${a.account_type==='paybill'?'#2563eb':'#16a34a'};color:#fff;">${typeLabel}</span>
                        ${a.is_active ? '' : '<span style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:10px;font-size:11px;background:#94a3b8;color:#fff;">Inactive</span>'}
                    </div>
                    <div>
                        <button onclick="toggleGivingAccount(${a.id}, ${!a.is_active})" style="padding:4px 10px;font-size:12px;background:#f59e0b;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-right:4px;">${a.is_active?'Deactivate':'Activate'}</button>
                        <button onclick="deleteGivingAccount(${a.id}, '${escapeHTML(a.name)}')" style="padding:4px 10px;font-size:12px;background:#ef4444;color:#fff;border:none;border-radius:4px;cursor:pointer;">Delete</button>
                    </div>
                </div>
                <div style="margin-top:8px;font-size:13px;color:#444;">
                    <div>Number: <strong>${escapeHTML(a.number)}</strong></div>
                    ${a.account_name ? `<div>Account Name: <strong>${escapeHTML(a.account_name)}</strong></div>` : ''}
                </div>
            `;
            list.appendChild(card);
        });
    } catch (e) { console.error('Giving accounts load error:', e); }
}

function addGivingAccount() {
    const name = document.getElementById('gaName').value.trim();
    const type = document.getElementById('gaType').value;
    const number = document.getElementById('gaNumber').value.trim();
    const accountName = document.getElementById('gaAccountName').value.trim();

    if (!name) { showToast('Enter an account name.', 'error'); return; }
    if (!number) { showToast(`Enter the ${type === 'paybill' ? 'PayBill' : 'M-Pesa'} number.`, 'error'); return; }

    fetchJSON('/api/settings/giving-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, account_type: type, number, account_name: accountName, is_active: true })
    }).then(() => {
        document.getElementById('gaName').value = '';
        document.getElementById('gaNumber').value = '';
        document.getElementById('gaAccountName').value = '';
        showToast('Giving account added');
        loadGivingAccounts();
    }).catch(() => showToast('Failed to add account', 'error'));
}

async function toggleGivingAccount(id, isActive) {
    try {
        await fetchJSON(`/api/settings/giving-accounts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: isActive })
        });
        showToast('Account updated');
        loadGivingAccounts();
    } catch (e) { showToast('Failed to update', 'error'); }
}

async function deleteGivingAccount(id, name) {
    if (!confirm(`Delete giving account "${name}"?`)) return;
    try {
        await fetchJSON(`/api/settings/giving-accounts/${id}`, { method: 'DELETE' });
        showToast('Account deleted');
        loadGivingAccounts();
    } catch (e) { showToast('Delete failed', 'error'); }
}
