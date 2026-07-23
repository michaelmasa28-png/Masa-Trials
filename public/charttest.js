/**
 * Kingdom Ways WhatsApp-Style Core Communication Engine Client Controls
 */

// Establish global application active session tracking profiles arrays datasets limits
let MY_LOCAL_USER_SESSION_ID = "ID-9842"; // Mocked logged-in user identification signature token
let SEEDED_MEMBERS_CACHE = [];
let ACTIVE_SELECTED_ROOM_TARGET = "GLOBAL"; // Controls room context data channel filters loops lines

document.addEventListener("DOMContentLoaded", () => {
    initWhatsAppConnectHub();
});

/**
 * Main application setup pipeline orchestrator functions routine array
 */
async function initWhatsAppConnectHub() {
    // Print local assignment indicator down header parameters boundaries properties
    document.getElementById('myIdBadge').textContent = `Your ID: ${MY_LOCAL_USER_SESSION_ID}`;

    await loadConversationsDirectoryList();

    // Attach form execution interception handles to dispatch entries safely
    const chatSubmissionForm = document.getElementById('messageDispatchForm');
    if (chatSubmissionForm) {
        chatSubmissionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            executeSendMessagePacketWorkflow();
        });
    }
}

/**
 * Downloads profile metrics records directly from database endpoint tracking paths lines
 */
async function loadConversationsDirectoryList() {
    try {
        const response = await fetch('/api/connect/profiles');
        if (response.ok) {
            SEEDED_MEMBERS_CACHE = await response.json();
            renderWhatsAppSidebarChatsList(SEEDED_MEMBERS_CACHE);
        } else {
            loadStaticOfflineWhatsAppMembersMock();
        }
    } catch (e) {
        loadStaticOfflineWhatsAppMembersMock();
    }
}

/**
 * Injects 10 precisely populated static member profiles into the system
 */
function loadStaticOfflineWhatsAppMembersMock() {
    SEEDED_MEMBERS_CACHE = [
        { uid: "GLOBAL", name: "Global Fellowship Group", bio: "Open announcement channel for all connected IDs", initials: "G" },
        { uid: "ID-1001", name: "Pastor Charles", bio: "Shepherding the congregation with grace and truth.", initials: "PC" },
        { uid: "ID-1002", name: "Sister Mercy", bio: "Praise & Worship leader. Passionate about spiritual hymnody.", initials: "SM" },
        { uid: "ID-1003", name: "Elder John", bio: "Couples counseling coordinator and home cells supervisor.", initials: "EJ" },
        { uid: "ID-1004", name: "Evangelist Paul", bio: "Outreach logistics lead. Focused on spreading the Word.", initials: "EP" },
        { uid: "ID-1005", name: "Deaconess Ruth", bio: "Hospitality ministry lead and children's Sunday School overseer.", initials: "DR" },
        { uid: "ID-1006", name: "Brother Mwangi", bio: "Church Treasurer. Managing parameters data records and ledger balances.", initials: "BM" },
        { uid: "ID-1007", name: "Sister Sarah", bio: "Intercessory prayer warriors captain. Standing in the gap.", initials: "SS" },
        { uid: "ID-1008", name: "Brother David", bio: "Media, live-streaming operations and technical acoustics engineer.", initials: "BD" },
        { uid: "ID-1009", name: "Sister Grace", bio: "Youth fellowship advisor and campus evangelical movement head.", initials: "SG" },
        { uid: "ID-1010", name: "Deacon Samuel", bio: "Ushering management lead. Making the house of God welcoming.", initials: "DS" }
    ];
    renderWhatsAppSidebarChatsList(SEEDED_MEMBERS_CACHE);
}

/**
 * Iterates across profile datasets mapping them down the left panel canvas chat strip components fields loops
 */
function renderWhatsAppSidebarChatsList(chatItemsArray) {
    const targetSidebarContainer = document.getElementById('conversationsContainer');
    if (!targetSidebarContainer) return;
    
    targetSidebarContainer.innerHTML = '';

    chatItemsArray.forEach(item => {
        const itemInitials = item.initials || item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        const chatRowNode = document.createElement('div');
        chatRowNode.className = `chat-row-item ${ACTIVE_SELECTED_ROOM_TARGET === item.uid ? 'active' : ''}`;
        
        chatRowNode.innerHTML = `
            <div class="row-avatar">${itemInitials}</div>
            <div class="row-body-meta">
                <div class="row-top-line">
                    <h4>${escapeHTML(item.name)}</h4>
                    <span class="id-timestamp">${item.uid}</span>
                </div>
                <div class="row-bottom-line">
                    <p>${escapeHTML(item.bio)}</p>
                </div>
            </div>
        `;

        // Click Event: Clicking a WhatsApp style row switches rooms and context immediately
        chatRowNode.addEventListener('click', () => {
            ACTIVE_SELECTED_ROOM_TARGET = item.uid;
            document.getElementById('activeRoomTitle').textContent = item.name;
            document.getElementById('activeRoomMetadata').textContent = item.uid === 'GLOBAL' ? 'Open announcement channel for all connected IDs' : `Direct link lane locked to target profile: ${item.uid}`;
            document.getElementById('activeRoomAvatar').textContent = itemInitials;
            
            // Re-render sidebar elements rows to update active status highlights styling variables bounds
            renderWhatsAppSidebarChatsList(chatItemsArray);
            loadSelectedTargetChatHistoryTimeline();
        });

        targetSidebarContainer.appendChild(chatRowNode);
    });
}

/**
 * Downloads and clears out message feed canvas containers matching room selection rules matrices indicators loops
 */
async function loadSelectedTargetChatHistoryTimeline() {
    const streamCanvas = document.getElementById('messageStreamCanvas');
    if (!streamCanvas) return;
    
    streamCanvas.innerHTML = '';

    // Injects an atmospheric safety welcome notice bubble matching standard WhatsApp encryptions flags updates
    const securityShieldLabelNode = document.createElement('div');
    securityShieldLabelNode.style.cssText = "align-self: center; background: #ffeecd; color: #514227; font-size: 11.5px; padding: 6px 12px; border-radius: 6px; box-shadow: 0 1px 0.5px rgba(0,0,0,0.05); text-align: center; max-width: 85%; margin: 5px 0 15px 0; font-weight: 500;";
    securityShieldLabelNode.innerHTML = `<i class="fa-solid fa-lock"></i> Messages are safely compiled locally from your church.db SQLite instance repository database schemas configurations tracks rules.`;
    streamCanvas.appendChild(securityShieldLabelNode);

    // BACKEND INTEGRATION NOTE: Replace with your actual filtered messages retrieval sequence URL parameter paths
    try {
        const url = `/api/connect/messages?sender=${MY_LOCAL_USER_SESSION_ID}&target=${ACTIVE_SELECTED_ROOM_TARGET}`;
        const response = await fetch(url);
        if (response.ok) {
            const list = await response.json();
            list.forEach(msg => appendWhatsAppBubbleNodeToView(msg));
        }
    } catch (e) {
        // Drop standard baseline hello bubble if server connection is waiting on backend deployment setups loops 
        appendWhatsAppBubbleNodeToView({
            sender_id: "System Herald",
            message_text: `Welcome! You are now viewing the channel for context ID: ${ACTIVE_SELECTED_ROOM_TARGET}. Select any user row card above to alter chat contexts dynamically inside this interface layout viewport.`,
            timestamp: "12:00 PM"
        });
    }
}

/**
 * Formats, packs, and appends a messaging element strip node inside the timeline column viewport board grid canvas
 */
function appendWhatsAppBubbleNodeToView(msgData) {
    const streamCanvas = document.getElementById('messageStreamCanvas');
    if (!streamCanvas) return;

    const isOutgoing = msgData.sender_id === MY_LOCAL_USER_SESSION_ID;
    const directionClassIndicator = isOutgoing ? 'outgoing-bubble' : 'incoming-bubble';

    const bubbleNodeBlock = document.createElement('div');
    bubbleNodeBlock.className = `wa-bubble-node ${directionClassIndicator}`;

    // Conditional rendering: Print name identifiers only if the text belongs to other members inside global rooms channel lists
    const authorHeaderLabel = (!isOutgoing && ACTIVE_SELECTED_ROOM_TARGET === 'GLOBAL') ? `<span class="bubble-author-title">${escapeHTML(msgData.sender_id)}</span>` : '';

    bubbleNodeBlock.innerHTML = `
        ${authorHeaderLabel}
        <span>${escapeHTML(msgData.message_text)}</span>
        <span class="bubble-timestamp-line">${msgData.timestamp}</span>
    `;

    streamCanvas.appendChild(bubbleNodeBlock);
    streamCanvas.scrollTop = streamCanvas.scrollHeight; // Fast auto scroll drop execution loop lock
}

/**
 * Packages values and streams payloads outwards over network REST actions methods pipelines workflows
 */
async function executeSendMessagePacketWorkflow() {
    const msgField = document.getElementById('chatMessageField');
    if (!msgField || !msgField.value.trim()) return;

    const currentClockStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const payload = {
        sender_id: MY_LOCAL_USER_SESSION_ID,
        receiver_id: ACTIVE_SELECTED_ROOM_TARGET,
        message_text: msgField.value.trim(),
        timestamp: currentClockStamp
    };

    // Draw locally first to guarantee hyper fluid messaging response layouts user experience feedback 
    appendWhatsAppBubbleNodeToView(payload);
    msgField.value = '';

    try {
        await fetch('/api/connect/messages-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.warn("Server connection offline. Chat printed locally inside interface dashboard screen arrays canvas layers tracking.");
    }
}

/**
 * XSS Script Sanitization Tool encoders properties configurations maps fields bounds bounds checking structures context strings safely
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Client-Side Live Filtration Engine
 * Allows users to filter the 10 member IDs instantly using the search box at the top left.
 */
function attachSidebarSearchEngine() {
    const searchFieldInput = document.getElementById('chatSearchInput');
    if (!searchFieldInput) return;

    searchFieldInput.addEventListener('input', (event) => {
        const cleanQueryTextTermString = event.target.value.toLowerCase().trim();
        
        if (!cleanQueryTextTermString) {
            renderWhatsAppSidebarChatsList(SEEDED_MEMBERS_CACHE);
            return;
        }

        // Filters cached profiles based on matching terms in names, unique IDs, or bios
        const filteredOutputResultsArray = SEEDED_MEMBERS_CACHE.filter(item => {
            return item.name.toLowerCase().includes(cleanQueryTextTermString) ||
                   item.uid.toLowerCase().includes(cleanQueryTextTermString) ||
                   (item.bio && item.bio.toLowerCase().includes(cleanQueryTextTermString));
        });

        renderWhatsAppSidebarChatsList(filteredOutputResultsArray);
    });
}

// Extend the entry setup workflow loop to bind the live filter input field immediately on load
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        attachSidebarSearchEngine();
        // Load the default main global channel conversation history line on start
        loadSelectedTargetChatHistoryTimeline();
    }, 100);
});

console.log("Kingdom Ways Connect Hub: Core synchronization modules successfully completed below message transmission streams.");

/**
 * Kingdom Ways Connect Hub - Final Extension: Click Triggers, Admin Banner & Dynamic WhatsApp Routing
 */

/**
 * Attaches a direct click listener to the paper plane button icon 
 * so users can click to send messages instead of just pressing the "Enter" key.
 */
function initializeSendButtonClickTrigger() {
    const sendBtnElement = document.getElementById('sendBtn');
    const messageFormElement = document.getElementById('messageDispatchForm');
    
    if (sendBtnElement && messageFormElement) {
        sendBtnElement.addEventListener('click', (event) => {
            // Check if the form is valid before manual programmatic dispatch
            if (messageFormElement.checkValidity()) {
                event.preventDefault();
                executeSendMessagePacketWorkflow();
            }
        });
    }
}

/**
 * Automatically injects a beautifully styled inline admin guidance banner at the top 
 * of private conversation threads, complete with unique custom WhatsApp routing numbers.
 */
function injectInlineAdminGuidanceBanner(targetUID) {
    const streamCanvas = document.getElementById('messageStreamCanvas');
    if (!streamCanvas) return;

    // Remove any existing admin help banner before inserting a new one
    const oldBanner = document.getElementById('inlineAdminBanner');
    if (oldBanner) oldBanner.remove();

    // Do not show the admin guide banner if the user is in the open public Global Group room
    if (targetUID === 'GLOBAL') return;

    // Define unique corporate WhatsApp phone numbers based on which member ID is open
    // This allows different profiles to route to totally unique helplines
    let targetWhatsAppNumber = "254700000000"; // Default baseline fallback number
    
    if (targetUID === 'ID-1001') targetWhatsAppNumber = "254711111111"; // Pastor Charles Direct
    if (targetUID === 'ID-1003') targetWhatsAppNumber = "254733333333"; // Elder John Counseling
    if (targetUID === 'ID-1006') targetWhatsAppNumber = "254766666666"; // Treasurer Finance Help

    // Create the banner container with clean, robust inline styles
    const bannerNode = document.createElement('div');
    bannerNode.id = "inlineAdminBanner";
    bannerNode.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #e0f2fe;
        border: 1px solid #bae6fd;
        border-radius: 10px;
        padding: 12px 18px;
        margin: 10px 0 15px 0;
        box-shadow: 0 2px 5px rgba(0,0,0,0.04);
        width: 100%;
        box-sizing: border-box;
    `;

    bannerNode.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-user-shield" style="color: #0369a1; font-size: 18px;"></i>
            <div>
                <h5 style="margin: 0; font-size: 13px; color: #0369a1; font-weight: 600;">Admin Guidance Support</h5>
                <p style="margin: 2px 0 0 0; font-size: 11px; color: #0c4a6e;">Need direct assistance with ${targetUID}? Connect securely using our synced hotlines.</p>
            </div>
        </div>
        <a href="https://wa.me{targetWhatsAppNumber}" target="_blank" style="
            background-color: #25d366;
            color: white;
            text-decoration: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: opacity 0.2s;
        " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            <i class="fa-brands fa-whatsapp"></i> Chat Support
        </a>
    `;

    // Always append the inline banner right beneath the encryption notice layer at the top
    if (streamCanvas.firstChild) {
        streamCanvas.insertBefore(bannerNode, streamCanvas.childNodes[1] || null);
    } else {
        streamCanvas.appendChild(bannerNode);
    }
}

// Intercept page loading sequences to tie these final functional elements together
document.addEventListener("DOMContentLoaded", () => {
    initializeSendButtonClickTrigger();
});

// Create a hook inside your original room switching function to fire the admin banner updates
const originalLoadTimelineFunction = loadSelectedTargetChatHistoryTimeline;
loadSelectedTargetChatHistoryTimeline = async function() {
    await originalLoadTimelineFunction();
    injectInlineAdminGuidanceBanner(ACTIVE_SELECTED_ROOM_TARGET);
};

console.log("Kingdom Ways Connect Hub: All modules successfully linked and fully operational!");
