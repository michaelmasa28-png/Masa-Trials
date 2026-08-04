// =====================================================
// KINGDOM WAYS CHURCH
// CONNECT HUB
// PRODUCTION WEBSOCKET CLIENT
// PART 1 - APPLICATION FOUNDATION
// =====================================================

"use strict";

console.log("========================================");
console.log("KINGDOM WAYS CONNECT HUB");
console.log("PART 1 - APPLICATION FOUNDATION");
console.log("========================================");

// =====================================================
// CONFIGURATION
// =====================================================

const API = window.location.origin;
const SESSION_KEY = "memberSession";

// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================

const APP = {

    socket: null,

    connected: false,

    reconnectTimer: null,

    heartbeatTimer: null,

    pageClosing: false,

    currentMember: null,

    currentConversation: null,

    conversations: [],

    messages: [],

    onlineMembers: []

};

// =====================================================
// DOM CACHE
// =====================================================

const DOM = {

    currentMemberNumber:
        document.getElementById("currentMemberNumber"),

    currentConversationId:
        document.getElementById("currentConversationId"),

    currentConversationType:
        document.getElementById("currentConversationType"),

    currentUsername:
        document.getElementById("currentUsername"),

    currentRole:
        document.getElementById("currentRole"),

    memberName:
        document.getElementById("memberName"),

    memberNumber:
        document.getElementById("memberNumber"),

    memberStatus:
        document.getElementById("memberStatus"),

    memberPhoto:
        document.getElementById("memberPhoto"),

    onlineIndicator:
        document.getElementById("onlineIndicator"),

    conversationList:
        document.getElementById("conversationList"),

    activeChatName:
        document.getElementById("activeChatName"),

    activeChatInfo:
        document.getElementById("activeChatInfo"),

    activeChatPhoto:
        document.getElementById("activeChatPhoto"),

    messageContainer:
        document.getElementById("messageContainer"),

    messageForm:
        document.getElementById("messageForm"),

    messageInput:
        document.getElementById("messageInput"),

    sendBtn:
        document.getElementById("sendBtn"),

    typingArea:
        document.getElementById("typingArea"),

    connectionStatus:
        document.getElementById("connectionStatus")

};

// =====================================================
// PROFILE IMAGE
// =====================================================

function profileImage(path) {

    if (!path || path.trim() === "") {

        return "images/default-avatar.png";

    }

    return path;

}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeMessage(text) {

    if (!text) {

        return "";

    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// =====================================================
// FORMAT CHAT TIME
// =====================================================

function formatConversationTime(date) {

    if (!date) {

        return "";

    }

    return new Date(date).toLocaleTimeString([], {

        hour: "2-digit",
        minute: "2-digit"

    });

}

// =====================================================
// CONNECTION STATUS
// =====================================================

function setConnectionStatus(text, online) {

    if (!DOM.connectionStatus) {

        return;

    }

    DOM.connectionStatus.classList.remove(

        "hidden",
        "online",
        "offline"

    );

    DOM.connectionStatus.classList.add(

        online ? "online" : "offline"

    );

    DOM.connectionStatus.innerHTML =

        `<i class="fa-solid fa-wifi"></i> ${text}`;

}

// =====================================================
// RESTORE MEMBER SESSION
// =====================================================

function restoreSession() {

    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) {

        console.warn("No member session found.");

        location.href = "login.html";

        return false;

    }

    try {

        APP.currentMember = JSON.parse(raw);

        console.log("Session Restored");

        return true;

    }

    catch (error) {

        console.error(error);

        localStorage.removeItem(SESSION_KEY);

        location.href = "login.html";

        return false;

    }

}

// =====================================================
// LOAD CURRENT MEMBER
// =====================================================

function loadCurrentMember() {

    if (!APP.currentMember) {

        return;

    }

    const member = APP.currentMember;

    if (DOM.memberName)
        DOM.memberName.textContent = member.full_name;

    if (DOM.memberNumber)
        DOM.memberNumber.textContent = member.member_number;

    if (DOM.memberStatus)
        DOM.memberStatus.textContent = "Available";

    if (DOM.memberPhoto)
        DOM.memberPhoto.src = profileImage(member.profile_picture);

    if (DOM.currentMemberNumber)
        DOM.currentMemberNumber.value = member.member_number;

    if (DOM.currentUsername)
        DOM.currentUsername.value = member.username;

    if (DOM.currentRole)
        DOM.currentRole.value = member.role || "member";

    console.log("Member Loaded");

}

// =====================================================
// INITIALIZE APPLICATION
// =====================================================

function initializeApplication() {

    console.log("Initializing Connect Hub...");

    if (!restoreSession()) {

        return;

    }

    loadCurrentMember();

    setConnectionStatus(

        "Offline",

        false

    );

    console.log("Application Foundation Ready");

}

// =====================================================
// APPLICATION START
// =====================================================

window.addEventListener(

    "load",

    initializeApplication

);

// =====================================================
// PART 2 - PRODUCTION WEBSOCKET ENGINE
// =====================================================

console.log("WebSocket Engine Loaded");

// =====================================================
// CONNECT TO SERVER
// =====================================================

function connectWebSocket() {

    if (!APP.currentMember) {

        console.error("No authenticated member.");

        return;

    }

    if (

        APP.socket &&

        (

            APP.socket.readyState === WebSocket.OPEN ||

            APP.socket.readyState === WebSocket.CONNECTING

        )

    ) {

        return;

    }

    const protocol =

        window.location.protocol === "https:"

            ? "wss:"

            : "ws:";

    const socketURL =

        `${protocol}//${window.location.host}/ws/chat/${APP.currentMember.member_number}`;

    console.log("Connecting:", socketURL);

    setConnectionStatus(

        "Connecting...",

        false

    );

    APP.socket = new WebSocket(socketURL);

    // ==========================================
    // OPEN
    // ==========================================

    APP.socket.onopen = function () {

        console.log("✅ Connected");

        APP.connected = true;

        setConnectionStatus(

            "Connected",

            true

        );

        if (APP.reconnectTimer) {

            clearTimeout(APP.reconnectTimer);

            APP.reconnectTimer = null;

        }

        if (APP.heartbeatTimer) {

            clearInterval(APP.heartbeatTimer);

        }

        APP.heartbeatTimer = setInterval(function () {

            socketSend({

                type: "ping"

            });

        }, 30000);

        socketSend({

            type: "ping"

        });

    };

    // ==========================================
    // MESSAGE
    // ==========================================

    APP.socket.onmessage = function (event) {

        try {

            const packet = JSON.parse(event.data);

            console.log("WS:", packet);

            handleSocketPacket(packet);

        }

        catch (error) {

            console.error("Invalid packet:", error);

        }

    };

    // ==========================================
    // ERROR
    // ==========================================

    APP.socket.onerror = function (error) {

        console.error("WebSocket Error:", error);

    };

    // ==========================================
    // CLOSED
    // ==========================================

    APP.socket.onclose = function (event) {

        console.warn("Socket Closed");

        console.log("Code:", event.code);

        console.log("Reason:", event.reason);

        APP.connected = false;

        APP.socket = null;

        setConnectionStatus(

            "Disconnected",

            false

        );

        if (APP.heartbeatTimer) {

            clearInterval(APP.heartbeatTimer);

            APP.heartbeatTimer = null;

        }

        if (APP.pageClosing) {

            return;

        }

        reconnectWebSocket();

    };

}

// =====================================================
// RECONNECT
// =====================================================

function reconnectWebSocket() {

    if (APP.reconnectTimer) {

        clearTimeout(APP.reconnectTimer);

    }

    APP.reconnectTimer = setTimeout(function () {

        console.log("Reconnecting...");

        connectWebSocket();

    }, 3000);

}

// =====================================================
// SOCKET SEND
// =====================================================

function socketSend(packet) {

    if (

        !APP.socket ||

        APP.socket.readyState !== WebSocket.OPEN

    ) {

        return false;

    }

    APP.socket.send(

        JSON.stringify(packet)

    );

    return true;

}

// =====================================================
// CLEAN EXIT
// =====================================================

window.addEventListener(

    "beforeunload",

    function () {

        APP.pageClosing = true;

        if (APP.reconnectTimer) {

            clearTimeout(APP.reconnectTimer);

        }

        if (APP.heartbeatTimer) {

            clearInterval(APP.heartbeatTimer);

        }

        if (APP.socket) {

            APP.socket.close(

                1000,

                "Leaving page"

            );

        }

    }

);

// =====================================================
// START WEBSOCKET
// =====================================================

window.addEventListener(

    "load",

    function () {

        connectWebSocket();

    }

);


// =====================================================
// PART 3 - CONVERSATION MANAGER
// =====================================================

console.log("Conversation Manager Loaded");

// =====================================================
// LOAD CONVERSATIONS
// =====================================================

async function loadConversations() {

    if (!APP.currentMember) {

        console.error("Current member missing.");

        return;

    }

    try {

        const response = await fetch(

            `${API}/api/chat/conversations/${APP.currentMember.member_number}`

        );

        if (!response.ok) {

            throw new Error(`HTTP ${response.status}`);

        }

        const data = await response.json();

        if (!data.success) {

            console.error("Conversation request failed.");

            return;

        }

        APP.conversations = data.conversations || [];

        console.log(

            "Loaded Conversations:",

            APP.conversations.length

        );

        renderConversationList();

    }

    catch (error) {

        console.error(

            "Conversation Load Error:",

            error

        );

    }

}

// =====================================================
// RENDER CONVERSATIONS
// =====================================================

function renderConversationList() {

    if (!DOM.conversationList) {

        return;

    }

    DOM.conversationList.innerHTML = "";

    if (APP.conversations.length === 0) {

        DOM.conversationList.innerHTML = `
            <div class="empty-chat">

                <i class="fa-solid fa-comments"></i>

                <h3>No Conversations</h3>

                <p>Create or join a conversation.</p>

            </div>
        `;

        return;

    }

    APP.conversations.forEach(function (conversation) {

        const template = document.getElementById(

            conversation.type === "private"

                ? "privateConversationTemplate"

                : "conversationTemplate"

        );

        if (!template) {

            console.error(

                "Conversation template missing:",

                conversation.type

            );

            return;

        }

        const card =

            template.content.firstElementChild.cloneNode(true);

        card.classList.add("conversation-item");

        card.dataset.id = conversation.id;

        card.dataset.type = conversation.type;

        card.dataset.otherMember =

            conversation.other_member || "";

        const image = card.querySelector(".conversation-image");

        if (image) {

            image.src = profileImage(

                conversation.image

            );

        }

        const title = card.querySelector(".conversation-name");

        if (title) {

            title.textContent =

                conversation.name || "Conversation";

        }

        const preview = card.querySelector(".conversation-last-message");

        if (preview) {

            preview.textContent =

                conversation.last_message || "No messages yet";

        }

        const time = card.querySelector(".conversation-time");

        if (time) {

            time.textContent =

                formatConversationTime(

                    conversation.last_message_at

                );

        }

        card.addEventListener(

            "click",

            function () {

                selectConversation(

                    conversation,

                    card

                );

            }

        );

        DOM.conversationList.appendChild(card);

    });

}

// =====================================================
// SELECT CONVERSATION
// =====================================================

function selectConversation(conversation, card) {

    APP.currentConversation = conversation;

    document

        .querySelectorAll(".conversation-item")

        .forEach(function (item) {

            item.classList.remove("active");

        });

    card.classList.add("active");

    if (DOM.currentConversationId) {

        DOM.currentConversationId.value =

            conversation.id;

    }

    if (DOM.currentConversationType) {

        DOM.currentConversationType.value =

            conversation.type;

    }

    if (DOM.activeChatName) {

        DOM.activeChatName.textContent =

            conversation.name;

    }

    if (DOM.activeChatPhoto) {

        DOM.activeChatPhoto.src =

            profileImage(conversation.image);

    }

    if (DOM.activeChatInfo) {

        DOM.activeChatInfo.textContent =

            conversation.type === "private"

                ? "Private Conversation"

                : "Group Conversation";

    }

    console.log(

        "Conversation Selected:",

        conversation.id

    );

    if (typeof loadMessages === "function") {

        loadMessages(

            conversation.id

        );

    }

    if (

        conversation.type === "private" &&

        typeof loadMemberPresence === "function"

    ) {

        loadMemberPresence(

            conversation.other_member

        );

    }

}

// =====================================================
// FORMAT CONVERSATION TIME
// =====================================================

function formatConversationTime(date) {

    if (!date) {

        return "";

    }

    return new Date(date).toLocaleTimeString(

        [],

        {

            hour: "2-digit",

            minute: "2-digit"

        }

    );

}

// =====================================================
// INITIAL LOAD
// =====================================================

window.addEventListener(

    "load",

    function () {

        loadConversations();

    }

);


// =====================================================
// PART 4 - REAL-TIME MESSAGE DISPATCHER
// =====================================================

console.log("Real-Time Dispatcher Loaded");

// =====================================================
// HANDLE SOCKET PACKETS
// =====================================================

function handleSocketPacket(packet) {

    if (!packet || !packet.type) {

        return;

    }

    switch (packet.type) {

        case "connected":

            console.log(packet.message || "Connected");

            break;

        case "pong":

            // Heartbeat reply
            break;

        case "online_members":

            APP.onlineMembers = packet.members || [];

            updateOnlineStatus();

            if (typeof updateActiveChatPresence === "function") {

                updateActiveChatPresence();

            }

            break;

        case "member_online":

            dispatchMemberOnline(packet);

            break;

        case "member_offline":

            dispatchMemberOffline(packet);

            break;

        case "message":

            dispatchIncomingMessage(packet);

            break;

        case "typing":

            dispatchTyping(packet);

            break;

        case "message_read":

            handleMessageRead(packet);

            break;

        default:

            console.log("Unhandled packet:", packet);

    }

}

// =====================================================
// INCOMING MESSAGE
// =====================================================

function dispatchIncomingMessage(packet) {

    console.log("Incoming Message:", packet);

    if (typeof window.receiveSocketMessage === "function") {

        window.receiveSocketMessage(packet);

    }

}

// =====================================================
// TYPING EVENT
// =====================================================

function dispatchTyping(packet) {

    if (!packet.sender_number) {

        return;

    }

    if (typeof window.showTypingIndicator === "function") {

        window.showTypingIndicator(

            packet.sender_number

        );

    }

}

// =====================================================
// MEMBER ONLINE
// =====================================================

function dispatchMemberOnline(packet) {

    if (!packet.member_number) {

        return;

    }

    if (

        !APP.onlineMembers.includes(

            packet.member_number

        )

    ) {

        APP.onlineMembers.push(

            packet.member_number

        );

    }

    updateOnlineStatus();

    if (typeof updateActiveChatPresence === "function") {

        updateActiveChatPresence();

    }

}

// =====================================================
// MEMBER OFFLINE
// =====================================================

function dispatchMemberOffline(packet) {

    if (!packet.member_number) {

        return;

    }

    APP.onlineMembers =

        APP.onlineMembers.filter(

            function(member){

                return member !== packet.member_number;

            }

        );

    updateOnlineStatus();

    if (typeof updateActiveChatPresence === "function") {

        updateActiveChatPresence();

    }

}

// =====================================================
// SOCKET MESSAGE CALLBACK
// =====================================================

window.receiveSocketMessage = function(packet){

    if (

        !APP.currentConversation ||

        packet.conversation_id !==

        APP.currentConversation.id

    ) {

        return;

    }

    APP.messages.push(packet);

    if (typeof createMessageBubble === "function") {

        createMessageBubble(packet);

    }

    if (typeof scrollChatBottom === "function") {

        scrollChatBottom();

    }

};

// =====================================================
// SOCKET CONNECTED CALLBACK
// =====================================================

function socketConnected(){

    console.log("Socket Ready");

    APP.connected = true;

}

// =====================================================
// SOCKET DISCONNECTED CALLBACK
// =====================================================

function socketDisconnected(){

    console.log("Socket Disconnected");

    APP.connected = false;

}


// =====================================================
// PART 5 - MESSAGE MANAGER
// LOAD • RENDER • SEND
// =====================================================

console.log("Message Manager Loaded");

// =====================================================
// LOAD MESSAGES
// =====================================================

async function loadMessages(conversationId) {

    if (!conversationId) {

        return;

    }

    try {

        const response = await fetch(

            `${API}/api/chat/messages/${conversationId}`

        );

        if (!response.ok) {

            throw new Error(

                `HTTP ${response.status}`

            );

        }

        const data = await response.json();

        if (!data.success) {

            console.error(

                "Unable to load messages."

            );

            return;

        }

        APP.messages = data.messages || [];

        renderMessages();

        scrollChatBottom();

    }

    catch (error) {

        console.error(

            "Message Load Error:",

            error

        );

    }

}

// =====================================================
// RENDER MESSAGES
// =====================================================

function renderMessages() {

    if (!DOM.messageContainer) {

        return;

    }

    DOM.messageContainer.innerHTML = "";

    if (APP.messages.length === 0) {

        DOM.messageContainer.innerHTML = `

            <div class="empty-chat">

                <i class="fa-solid fa-comment-dots"></i>

                <p>No messages yet.</p>

            </div>

        `;

        return;

    }

    APP.messages.forEach(

        createMessageBubble

    );

}

// =====================================================
// CREATE MESSAGE BUBBLE
// =====================================================

function createMessageBubble(message) {

    if (!DOM.messageContainer) {

        return;

    }

    const mine =

        message.sender_number ===

        APP.currentMember.member_number;

    const bubble =

        document.createElement("div");

    bubble.className =

        mine

            ? "message-bubble mine"

            : "message-bubble other";

    if (message.id) {

        bubble.dataset.messageId =

            message.id;

    }

    bubble.innerHTML = `

        <div class="message-text">

            ${escapeMessage(

                message.text ||

                message.message ||

                ""

            )}

        </div>

        <div class="message-footer">

            <span class="message-time">

                ${formatConversationTime(

                    message.created_at

                )}

            </span>

            ${mine ? `

                <span class="message-status">

                    ✓

                </span>

            ` : ""}

        </div>

    `;

    DOM.messageContainer.appendChild(

        bubble

    );

    if (

        !mine &&

        message.id

    ) {

        markMessageRead(

            message.id

        );

    }

}

// =====================================================
// SEND MESSAGE
// =====================================================

function sendMessage() {

    if (!APP.currentConversation) {

        return;

    }

    if (!DOM.messageInput) {

        return;

    }

    const text =

        DOM.messageInput.value.trim();

    if (text.length === 0) {

        return;

    }

    const packet = {

        type: "message",

        conversation_id:

            APP.currentConversation.id,

        sender_number:

            APP.currentMember.member_number,

        text: text

    };

    if (

        socketSend(packet)

    ) {

        DOM.messageInput.value = "";

    }

}

// =====================================================
// RECEIVE SOCKET MESSAGE
// =====================================================

window.receiveSocketMessage = function(packet) {

    if (

        !APP.currentConversation ||

        packet.conversation_id !==

        APP.currentConversation.id

    ) {

        return;

    }

    APP.messages.push(packet);

    createMessageBubble(packet);

    scrollChatBottom();

};

// =====================================================
// SCROLL CHAT
// =====================================================

function scrollChatBottom() {

    if (!DOM.messageContainer) {

        return;

    }

    DOM.messageContainer.scrollTop =

        DOM.messageContainer.scrollHeight;

}

// =====================================================
// SEND MESSAGE EVENTS
// =====================================================

window.addEventListener(

    "load",

    function () {

        if (DOM.sendBtn) {

            DOM.sendBtn.addEventListener(

                "click",

                sendMessage

            );

        }

        if (DOM.messageForm) {

            DOM.messageForm.addEventListener(

                "submit",

                function (event) {

                    event.preventDefault();

                    sendMessage();

                }

            );

        }

        if (DOM.messageInput) {

            DOM.messageInput.addEventListener(

                "keydown",

                function(event){

                    if (

                        event.key === "Enter" &&

                        !event.shiftKey

                    ) {

                        event.preventDefault();

                        sendMessage();

                    }

                }

            );

        }

    }

);


// =====================================================
// PART 6 - TYPING INDICATOR + READ RECEIPTS
// =====================================================

console.log("Typing & Read Receipt Manager Loaded");

// =====================================================
// TYPING STATE
// =====================================================

let typingTimeout = null;

let typingActive = false;

// =====================================================
// SEND TYPING STATUS
// =====================================================

function sendTypingStatus(status) {

    if (

        !APP.currentConversation ||

        !APP.currentMember

    ) {

        return;

    }

    socketSend({

        type: "typing",

        conversation_id:

            APP.currentConversation.id,

        sender_number:

            APP.currentMember.member_number,

        typing: status

    });

}

// =====================================================
// MESSAGE INPUT EVENT
// =====================================================

function handleTypingInput() {

    if (!typingActive) {

        typingActive = true;

        sendTypingStatus(true);

    }

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(function () {

        typingActive = false;

        sendTypingStatus(false);

    }, 2000);

}

// =====================================================
// SHOW TYPING INDICATOR
// =====================================================

window.showTypingIndicator = function (senderNumber) {

    if (

        !APP.currentConversation ||

        senderNumber ===

        APP.currentMember.member_number

    ) {

        return;

    }

    if (!DOM.typingArea) {

        return;

    }

    DOM.typingArea.textContent = "Typing...";

    DOM.typingArea.style.display = "block";

    clearTimeout(DOM.typingArea.timer);

    DOM.typingArea.timer = setTimeout(function () {

        DOM.typingArea.style.display = "none";

        DOM.typingArea.textContent = "";

    }, 2500);

};

// =====================================================
// MARK MESSAGE AS READ
// =====================================================

function markMessageRead(messageId) {

    if (!messageId) {

        return;

    }

    socketSend({

        type: "message_read",

        message_id: messageId,

        member_number:

            APP.currentMember.member_number

    });

}

// =====================================================
// HANDLE READ RECEIPT
// =====================================================

function handleMessageRead(packet) {

    if (!packet.message_id) {

        return;

    }

    const bubble = document.querySelector(

        `[data-message-id="${packet.message_id}"]`

    );

    if (!bubble) {

        return;

    }

    const status = bubble.querySelector(

        ".message-status"

    );

    if (status) {

        status.textContent = "✓✓";

        status.classList.add("read");

    }

}

// =====================================================
// ATTACH INPUT EVENTS
// =====================================================

window.addEventListener(

    "load",

    function () {

        if (DOM.messageInput) {

            DOM.messageInput.addEventListener(

                "input",

                handleTypingInput

            );

        }

    }

);


// =====================================================
// PART 7 - PRESENCE SYSTEM
// ONLINE • OFFLINE • LAST SEEN
// =====================================================

console.log("Presence Manager Loaded");

// =====================================================
// UPDATE ONLINE STATUS
// =====================================================

function updateOnlineStatus() {

    // Current member indicator

    if (

        DOM.onlineIndicator &&

        APP.currentMember

    ) {

        const meOnline =

            APP.onlineMembers.includes(

                APP.currentMember.member_number

            );

        DOM.onlineIndicator.classList.remove(

            "online",

            "offline"

        );

        DOM.onlineIndicator.classList.add(

            meOnline

                ? "online"

                : "offline"

        );

    }

    // Conversation list indicators

    document

        .querySelectorAll(".conversation-item")

        .forEach(function (item) {

            const memberNumber =

                item.dataset.otherMember;

            if (!memberNumber) {

                return;

            }

            const online =

                APP.onlineMembers.includes(

                    memberNumber

                );

            const indicator =

                item.querySelector(

                    ".online-indicator"

                );

            if (indicator) {

                indicator.classList.toggle(

                    "online",

                    online

                );

                indicator.classList.toggle(

                    "offline",

                    !online

                );

            }

        });

    updateActiveChatPresence();

}

// =====================================================
// ACTIVE CHAT PRESENCE
// =====================================================

function updateActiveChatPresence() {

    if (!APP.currentConversation) {

        return;

    }

    if (

        APP.currentConversation.type !==

        "private"

    ) {

        return;

    }

    const otherMember =

        APP.currentConversation.other_member;

    if (!otherMember) {

        return;

    }

    const online =

        APP.onlineMembers.includes(

            otherMember

        );

    if (DOM.activeChatInfo) {

        DOM.activeChatInfo.textContent =

            online

                ? "Online"

                : "Offline";

    }

}

// =====================================================
// REQUEST ONLINE MEMBERS
// =====================================================

function requestOnlineMembers() {

    socketSend({

        type: "get_online_members"

    });

}

// =====================================================
// FORMAT LAST SEEN
// =====================================================

function formatLastSeen(date) {

    if (!date) {

        return "Last seen unavailable";

    }

    return "Last seen " +

        new Date(date)

        .toLocaleString();

}

// =====================================================
// LOAD MEMBER PRESENCE
// =====================================================

async function loadMemberPresence(memberNumber) {

    if (!memberNumber) {

        return;

    }

    try {

        const response = await fetch(

            `${API}/api/members/${memberNumber}/presence`

        );

        if (!response.ok) {

            return;

        }

        const data = await response.json();

        if (!data.success) {

            return;

        }

        if (!DOM.activeChatInfo) {

            return;

        }

        if (data.online) {

            DOM.activeChatInfo.textContent =

                "Online";

        }

        else {

            DOM.activeChatInfo.textContent =

                formatLastSeen(

                    data.last_seen

                );

        }

    }

    catch (error) {

        console.error(

            "Presence Error:",

            error

        );

    }

}

// =====================================================
// START PRESENCE
// =====================================================

window.addEventListener(

    "load",

    function () {

        requestOnlineMembers();

    }

);


// =====================================================
// PART 8 - SECURITY + FINAL INTEGRATION
// =====================================================

console.log("Security & Integration Layer Loaded");

// =====================================================
// VALIDATE MEMBER
// =====================================================

function validateChatMember() {

    return !!(

        APP.currentMember &&

        APP.currentMember.member_number

    );

}

// =====================================================
// VALIDATE MESSAGE
// =====================================================

function validateOutgoingMessage(text) {

    if (!text) {

        return false;

    }

    text = text.trim();

    if (text.length === 0) {

        return false;

    }

    if (text.length > 2000) {

        console.warn("Message exceeds 2000 characters.");

        return false;

    }

    return true;

}

// =====================================================
// SECURE SOCKET SEND
// =====================================================

function secureSocketSend(packet) {

    if (!validateChatMember()) {

        console.error("Member validation failed.");

        return false;

    }

    if (!packet) {

        return false;

    }

    packet.sender_number =

        APP.currentMember.member_number;

    return socketSend(packet);

}

// =====================================================
// AUTO-FOCUS MESSAGE BOX
// =====================================================

function focusMessageInput() {

    if (DOM.messageInput) {

        DOM.messageInput.focus();

    }

}

// =====================================================
// CLEAR CHAT INPUT
// =====================================================

function clearMessageInput() {

    if (DOM.messageInput) {

        DOM.messageInput.value = "";

    }

}

// =====================================================
// LOGOUT CLEANUP
// =====================================================

function disconnectChat() {

    APP.pageClosing = true;

    if (APP.heartbeatTimer) {

        clearInterval(APP.heartbeatTimer);

    }

    if (APP.reconnectTimer) {

        clearTimeout(APP.reconnectTimer);

    }

    if (

        APP.socket &&

        APP.socket.readyState === WebSocket.OPEN

    ) {

        APP.socket.close(

            1000,

            "Member logged out"

        );

    }

}

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

window.addEventListener(

    "error",

    function (event) {

        console.error(

            "Connect Hub Error:",

            event.error

        );

    }

);

// =====================================================
// STARTUP
// =====================================================

window.addEventListener(

    "load",

    function () {

        console.log("========================================");
        console.log("KINGDOM WAYS CONNECT HUB READY");
        console.log("========================================");

        focusMessageInput();

    }

);