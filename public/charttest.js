// =====================================================
// KINGDOM WAYS CHURCH
// CONNECT HUB
// charttest.js
// Rebuilt from scratch
// =====================================================


// ===============================
// API
// ===============================

const API = "";

// ===============================
// XSS SANITIZE
// ===============================

function escapeHtml(val) {
    return String(val == null ? "" : val).replace(/[&<>"']/g, function(c) {
        return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c];
    });
}


// ===============================
// ELEMENTS
// ===============================

const memberPhoto = document.getElementById("memberPhoto");
const memberName = document.getElementById("memberName");
const memberNumber = document.getElementById("memberNumber");
const conversationList = document.getElementById("conversationList");
const messageContainer = document.getElementById("messageContainer");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const activeChatName = document.getElementById("activeChatName");
const activeChatInfo = document.getElementById("activeChatInfo");
const adminSection = document.getElementById("adminSection");
const newChatBtn = document.getElementById("newChatBtn");
const memberDirectoryList = document.getElementById("memberDirectoryList");
const chatSearch = document.getElementById("chatSearch");


// ===============================
// STATE
// ===============================

let currentMember = null;
let activeConversation = null;
let conversations = [];
let lastMessagesSignature = null;


// ===============================
// VIEW TABS (Members first, Messages behind icon)
// ===============================

const membersPanel = document.getElementById("membersPanel");
const messagesPanel = document.getElementById("messagesPanel");
const navUnread = document.getElementById("navUnread");

function switchView(view){

    const showMembers = view === "members";

    if(membersPanel){
        membersPanel.classList.toggle("hidden", !showMembers);
    }

    if(messagesPanel){
        messagesPanel.classList.toggle("hidden", showMembers);
    }

    document.querySelectorAll(".nav-tab").forEach(tab => {

        const isActive =
            tab.getAttribute("data-view") === view;

        tab.classList.toggle("active", isActive);

    });

}

document.querySelectorAll(".nav-tab").forEach(tab => {

    tab.addEventListener("click", () => {
        switchView(tab.getAttribute("data-view"));
        closeMobileChat();
    });

});

// Mobile: back button returns from chat to the list
const chatBackBtn = document.getElementById("chatBackBtn");

function closeMobileChat(){
    const wrapper = document.querySelector(".connect-wrapper");
    if(wrapper){
        wrapper.classList.remove("chat-open");
    }
}

if(chatBackBtn){
    chatBackBtn.addEventListener("click", closeMobileChat);
}

// Members are shown first by default (messages stay hidden)


// ===============================
// SESSION
// ===============================

function loadMemberSession(){

    const saved = localStorage.getItem("memberSession");

    if(!saved){
        window.location.href = "btn.html";
        return;
    }

    currentMember = JSON.parse(saved);

    if(currentMember.expiresAt && Date.now() >= currentMember.expiresAt){
        localStorage.removeItem("memberSession");
        window.location.href = "btn.html";
        return;
    }

    displayMember();

}


// ===============================
// DISPLAY MEMBER
// ===============================

function displayMember(){

    if(!currentMember) return;

    memberName.textContent =
        currentMember.full_name || currentMember.username;

    memberNumber.textContent =
        currentMember.member_number || "KWC MEMBER";

    if(memberPhoto){

        memberPhoto.src =
            currentMember.photo || "images/default-avatar.png";

        memberPhoto.onerror = function(){
            this.src = "images/default-avatar.png";
        };

    }

    checkAdminAccess();

}


// ===============================
// ADMIN CHECK
// ===============================

function checkAdminAccess(){

    if(!adminSection) return;

    if(
        currentMember.role === "admin" ||
        currentMember.role === "superadmin"
    ){
        adminSection.classList.remove("hidden");
    }

}


// ===============================
// LOAD CONVERSATIONS
// ===============================

async function loadConversations(){

    try{

        const response = await fetch(
            `${API}/api/chat/conversations/${currentMember.member_number}`
        );

        if(!response.ok){
            throw new Error("Conversation loading failed");
        }

        const data = await response.json();

        conversations = data.conversations || [];

        renderConversationList();

    }

    catch(error){

        createDemoConversations();

    }

}


// ===============================
// DEMO DATA (fallback only, network failure)
// ===============================

function createDemoConversations(){

    conversations = [
        {
            id: 1,
            name: "KINGDOM WAYS COMMUNITY",
            image: "images/logo.png",
            last_message: "Welcome to Connect Hub",
            unread_count: 0
        }
    ];

    renderConversationList();

}


// ===============================
// RENDER CHAT LIST
// ===============================

function renderConversationList(){

    conversationList.innerHTML = "";

    let totalUnread = 0;

    conversations.forEach(chat => {

        if(chat.unread_count > 0){
            totalUnread += chat.unread_count;
        }

        const item = document.createElement("div");

        item.className = "conversation-item";

        item.innerHTML = `

            <img src="${escapeHtml(chat.image || 'images/default-avatar.png')}">

            <div>
                <h4>${escapeHtml(chat.name)}</h4>
                <p>${escapeHtml(chat.last_message || "")}</p>
            </div>

            ${
                chat.unread_count > 0
                ? `<span class="unread-badge">${Number(chat.unread_count) || 0}</span>`
                : ""
            }

        `;

        item.onclick = () => {
            openConversation(chat);
        };

        conversationList.appendChild(item);

    });

    // Update unread badge on the Messages tab
    if(navUnread){
        if(totalUnread > 0){
            navUnread.textContent = totalUnread > 99 ? "99+" : totalUnread;
            navUnread.style.display = "flex";
        }
        else{
            navUnread.style.display = "none";
        }
    }

}


// ===============================
// LOAD APPROVED MEMBERS DIRECTORY
// ===============================

async function loadMemberDirectory(){

    if(!memberDirectoryList) return;

    try{

        const response = await fetch(
            `${API}/api/chat/members/${currentMember.member_number}`
        );

        if(!response.ok){
            throw new Error("Member directory unavailable");
        }

        const data = await response.json();

        renderMemberDirectory(data.members || []);

    }

    catch(error){

        memberDirectoryList.innerHTML =
            `<p class="member-directory-empty">Unable to load members.</p>`;

    }

}


// ===============================
// RENDER APPROVED MEMBERS DIRECTORY
// ===============================

function renderMemberDirectory(members){

    memberDirectoryList.innerHTML = "";

    if(members.length === 0){
        memberDirectoryList.innerHTML =
            `<p class="member-directory-empty">No other approved members yet.</p>`;
        return;
    }

    members.forEach(member => {

        const item = document.createElement("div");

        item.className = "member-directory-item";

        const initials = (member.full_name || "?")
            .split(" ")
            .map(part => part.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase();

        const statusClass = member.is_online ? "online" : "offline";

        item.innerHTML = `
            <div class="member-directory-avatar-wrap">
                <div class="member-directory-avatar">${escapeHtml(initials)}</div>
                <span class="status-dot ${escapeHtml(statusClass)}"></span>
            </div>
            <span class="member-directory-name">${escapeHtml(member.full_name)}</span>
        `;

        item.onclick = () => {
            startChatWith(member.member_number);
        };

        memberDirectoryList.appendChild(item);

    });

}


// ===============================
// START OR OPEN A CHAT WITH A GIVEN MEMBER NUMBER
// ===============================

async function startChatWith(receiverNumber){

    if(receiverNumber === currentMember.member_number){
        alert("You can't start a chat with yourself.");
        return;
    }

    try{

        const response = await fetch(
            `${API}/api/chat/private`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_number: currentMember.member_number,
                    receiver_number: receiverNumber
                })
            }
        );

        const data = await response.json();

        if(!response.ok || !data.success){
            alert(
                data.detail || data.message ||
                "Could not start conversation. Check the member number."
            );
            return;
        }

        await loadConversations();

        const opened = conversations.find(c => c.id === data.conversation_id);

        if(opened){
            openConversation(opened);
        }

    }

    catch(error){

        console.error("Start Chat Error:", error);
        alert("Unable to connect to the server.");

    }

}


// ===============================
// NEW CHAT BUTTON (manual fallback)
// ===============================

async function startNewChat(){

    const receiverNumber = prompt(
        "Enter the member number to start a chat with (e.g. KWC-2026-000004):"
    );

    if(!receiverNumber) return;

    const trimmed = receiverNumber.trim();

    if(!trimmed) return;

    await startChatWith(trimmed);

}

if(newChatBtn){
    newChatBtn.addEventListener("click", startNewChat);
}


// ===============================
// OPEN CONVERSATION
// ===============================

function openConversation(chat){

    activeConversation = chat;

    lastMessagesSignature = null;

    activeChatName.textContent = chat.name;
    activeChatInfo.textContent = "Kingdom Ways Connect";

    switchView("messages");

    // Mobile: bring the chat pane to the front (full-screen)
    const wrapper = document.querySelector(".connect-wrapper");
    if(wrapper){
        wrapper.classList.add("chat-open");
    }

    loadMessages(chat.id);

    markConversationRead(chat.id);

}


// ===============================
// MARK CONVERSATION READ
// ===============================

async function markConversationRead(conversationId){

    try{

        await fetch(
            `${API}/api/chat/conversations/${conversationId}/read/${currentMember.member_number}`,
            { method: "PUT" }
        );

        await loadConversations();

    }

    catch(error){


    }

}


// ===============================
// LOAD MESSAGES
// ===============================

async function loadMessages(chatId){

    try{

        const response = await fetch(
            `${API}/api/chat/messages/${chatId}`
        );

        if(!response.ok){
            throw new Error("Message API unavailable");
        }

        const data = await response.json();

        renderMessages(data.messages || []);

    }

    catch(error){

        renderMessages([]);

    }

}


// ===============================
// DISPLAY MESSAGES
// ===============================

function renderMessages(messages){

    const signature =
        messages.map(m => `${m.id}:${m.message}:${m.edited ? 1 : 0}`).join(",");

    if(signature === lastMessagesSignature){
        return;
    }

    lastMessagesSignature = signature;

    messageContainer.innerHTML = "";

    if(messages.length === 0){

        messageContainer.innerHTML = `
            <div class="no-conversation">
                <i class="fa-solid fa-comments"></i>
                <p>Start your conversation</p>
            </div>
        `;

        return;

    }

    messages.forEach(message => {
        createMessageBubble(message);
    });

}


// ===============================
// CREATE MESSAGE BUBBLE
// ===============================

function createMessageBubble(message){

    const bubble = document.createElement("div");

    const sender =
        message.member_number == currentMember.member_number;

    bubble.className = sender
        ? "message-bubble sender"
        : "message-bubble receiver";

    bubble.innerHTML = `

        <strong>${escapeHtml(message.sender_name || "Member")}</strong>

        <p>${escapeHtml(message.message)}</p>

        <span class="message-time">
            ${formatTime(message.created_at)}
            ${message.edited ? '<span class="edited-tag">(edited)</span>' : ""}
        </span>

        ${
            sender
            ? `<span class="message-actions">
                <button class="msg-edit-btn" title="Edit">&#9998;</button>
                <button class="msg-delete-btn" title="Delete">&#128465;</button>
            </span>`
            : ""
        }

    `;

    if(sender){

        const editBtn = bubble.querySelector(".msg-edit-btn");
        const deleteBtn = bubble.querySelector(".msg-delete-btn");

        if(editBtn){
            editBtn.onclick = () => {
                editMessage(message.id, message.message);
            };
        }

        if(deleteBtn){
            deleteBtn.onclick = () => {
                deleteMessageBubble(message.id);
            };
        }

    }

    messageContainer.appendChild(bubble);

    messageContainer.scrollTop = messageContainer.scrollHeight;

}


// ===============================
// EDIT MESSAGE
// ===============================

async function editMessage(messageId, currentText){

    const newText = prompt("Edit your message:", currentText);

    if(newText === null) return;

    const trimmed = newText.trim();

    if(!trimmed || trimmed === currentText) return;

    try{

        const response = await fetch(
            `${API}/api/chat/messages/${messageId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    member_number: currentMember.member_number,
                    text: trimmed
                })
            }
        );

        const data = await response.json();

        if(!response.ok || !data.success){
            alert(data.detail || data.message || "Could not edit message.");
            return;
        }

        if(activeConversation){
            loadMessages(activeConversation.id);
        }

    }

    catch(error){

        console.error("Edit message error:", error);
        alert("Unable to connect to the server.");

    }

}


// ===============================
// DELETE MESSAGE
// ===============================

async function deleteMessageBubble(messageId){

    if(!confirm("Delete this message?")) return;

    try{

        const response = await fetch(
            `${API}/api/chat/messages/${messageId}?member_number=${encodeURIComponent(currentMember.member_number)}`,
            { method: "DELETE" }
        );

        const data = await response.json();

        if(!response.ok || !data.success){
            alert(data.detail || data.message || "Could not delete message.");
            return;
        }

        if(activeConversation){
            loadMessages(activeConversation.id);
        }

    }

    catch(error){

        console.error("Delete message error:", error);
        alert("Unable to connect to the server.");

    }

}


// ===============================
// SEND MESSAGE
// ===============================

messageForm.addEventListener("submit", async function(e){

    e.preventDefault();

    const text = messageInput.value.trim();

    if(!text) return;

    if(!activeConversation){
        alert("Select a conversation first");
        return;
    }

    messageInput.value = "";

    try{

        const response = await fetch(
            `${API}/api/chat/messages`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversation_id: activeConversation.id,
                    member_number: currentMember.member_number,
                    sender_name: currentMember.full_name,
                    text: text
                })
            }
        );

        const data = await response.json();

        if(!response.ok || !data.success){
            alert(data.detail || data.message || "Message failed to send.");
            return;
        }

        loadMessages(activeConversation.id);

    }

    catch(error){

        console.error("Send message error:", error);
        alert("Unable to connect to the server.");

    }

});


// ===============================
// TIME FORMAT
// ===============================

function formatTime(date){

    if(!date) return "";

    return new Date(date).toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
    );

}


// ===============================
// SEARCH CONVERSATIONS
// ===============================

if(chatSearch){

    chatSearch.addEventListener("input", () => {

        const value = chatSearch.value.toLowerCase();

        const items = document.querySelectorAll(".conversation-item");

        items.forEach(item => {

            const text = item.innerText.toLowerCase();

            item.style.display = text.includes(value) ? "flex" : "none";

        });

    });

}


// ===============================
// AUTO MESSAGE REFRESH
// ===============================

let refreshTimer = null;

function startMessageRefresh(){

    if(refreshTimer) clearInterval(refreshTimer);

    refreshTimer = setInterval(() => {

        if(activeConversation){
            loadMessages(activeConversation.id);
        }

    }, 5000);

}


// ===============================
// HEARTBEAT (KEEP MEMBER ONLINE)
// ===============================

let heartbeatTimer = null;

async function sendHeartbeat(){

    if(!currentMember) return;

    try{

        await fetch(
            `${API}/api/chat/heartbeat`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    member_number: currentMember.member_number
                })
            }
        );

    }

    catch(error){


    }

}

function startHeartbeat(){

    if(heartbeatTimer) clearInterval(heartbeatTimer);

    sendHeartbeat();

    heartbeatTimer = setInterval(sendHeartbeat, 20000);

}


// ===============================
// DIRECTORY REFRESH
// ===============================

let directoryRefreshTimer = null;

function startDirectoryRefresh(){

    if(directoryRefreshTimer) clearInterval(directoryRefreshTimer);

    directoryRefreshTimer = setInterval(loadMemberDirectory, 20000);

}


// ===============================
// ADMIN ACTION HOOKS
// ===============================

const adminButtons = document.querySelectorAll(".admin-section button");

adminButtons.forEach(button => {

    button.addEventListener("click", () => {

        alert(button.innerText + " feature will connect to CMS admin panel");

    });

});


// ===============================
// SEND ENTER KEY
// ===============================

if(messageInput){

    messageInput.addEventListener("keydown", function(e){

        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            messageForm.dispatchEvent(new Event("submit"));
        }

    });

}


// ===============================
// ONLINE MEMBER PLACEHOLDER
// ===============================

function updateOnlineStatus(){

    if(!currentMember) return;

}


// ==========================================
// MASA7 3D INTRO SIGNATURE
// Shows once per browser session
// ==========================================

function showMasa7Intro(){

    const intro = document.createElement("div");

    intro.style.position = "fixed";
    intro.style.inset = "0";
    intro.style.display = "flex";
    intro.style.alignItems = "center";
    intro.style.justifyContent = "center";
    intro.style.background =
        "radial-gradient(circle,rgba(0,255,170,.25),rgba(5,10,30,.96))";
    intro.style.zIndex = "999999";
    intro.style.animation = "masaFade 3s forwards";

    const logo = document.createElement("div");

    logo.innerHTML = "MASA7";
    logo.style.fontSize = "clamp(70px,12vw,160px)";
    logo.style.fontWeight = "900";
    logo.style.letterSpacing = "15px";
    logo.style.fontFamily = "Arial Black,Arial,sans-serif";
    logo.style.color = "#FFD700";
    logo.style.textShadow = `
        0 0 20px gold,
        0 0 50px #00ff88,
        0 0 100px #2477ff
    `;
    logo.style.animation = "masa3D 2.5s ease";

    intro.appendChild(logo);
    document.body.appendChild(intro);

    setTimeout(() => {
        intro.remove();
    }, 3000);

}

const masaStyle = document.createElement("style");

masaStyle.innerHTML = `

@keyframes masa3D{
    0%{ opacity:0; transform:perspective(900px) rotateX(80deg) scale(.2); }
    50%{ opacity:1; transform:perspective(900px) rotateX(0deg) scale(1.15); }
    100%{ transform:perspective(900px) rotateY(360deg) scale(1); }
}

@keyframes masaFade{
    0%{ opacity:1; }
    80%{ opacity:1; }
    100%{ opacity:0; }
}

`;

document.head.appendChild(masaStyle);

window.addEventListener("load", () => {

    const alreadyShown = sessionStorage.getItem("masa7IntroShown");

    if(!alreadyShown){
        showMasa7Intro();
        sessionStorage.setItem("masa7IntroShown", "true");
    }

});


// ===============================
// PAGE START
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    loadMemberSession();
    loadConversations();
    loadMemberDirectory();
    startMessageRefresh();
    startHeartbeat();
    startDirectoryRefresh();
    updateOnlineStatus();

});


// ===============================
// SECURITY CHECK
// ===============================

window.addEventListener("beforeunload", () => {

    if(currentMember){
    }

});