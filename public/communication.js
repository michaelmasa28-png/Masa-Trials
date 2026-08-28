/*==========================================================
KINGDOM WAYS CMS
COMMUNICATION CENTER
PART 1
==========================================================*/


/*==========================================================
API
==========================================================*/

// Change automatically in production
const API_URL = window.location.origin;


/*==========================================================
ENDPOINTS
==========================================================*/

const ENDPOINTS = {

    MEMBERS:
        `${API_URL}/communication/members`,

    SMS:
        `${API_URL}/communication/sms/send`,

    INTERNAL:
        `${API_URL}/communication/internal/send`,

    CONTACTS:
        `${API_URL}/communication/contacts`,

    HISTORY:
        `${API_URL}/communication/history`,

    STATISTICS:
        `${API_URL}/communication/statistics`,

    NOTIFICATIONS:
        `${API_URL}/communication/notifications`

};



/*==========================================================
GLOBAL DATA
==========================================================*/

let members=[];

let selectedMembers=[];

let communicationHistory=[];

let notifications=[];

let statistics={};

let contacts={};



/*==========================================================
DOM
==========================================================*/

// Tabs

const smsTab=document.getElementById("smsTab");

const internalTab=document.getElementById("internalTab");

const contactsTab=document.getElementById("contactsTab");



// Panels

const smsPanel=document.getElementById("smsPanel");

const internalPanel=document.getElementById("internalPanel");

const contactsPanel=document.getElementById("contactsPanel");



// SMS

const smsForm=document.getElementById("smsForm");

const smsMessage=document.getElementById("smsMessage");

const smsCategory=document.getElementById("smsCategory");

const characterCount=document.getElementById("characterCount");

const smsPages=document.getElementById("smsPages");

const previewSMS=document.getElementById("previewSMS");

const sendSMS=document.getElementById("sendSMS");



// Internal

const internalForm=document.getElementById("internalMessageForm");

const internalMessage=document.getElementById("internalMessage");

const internalSubject=document.getElementById("internalSubject");

const internalCharacters=document.getElementById("internalCharacters");



// Members

const memberTable=document.getElementById("memberTable");

const internalMemberTable=document.getElementById("internalMemberTable");

const memberSearch=document.getElementById("memberSearch");

const internalSearch=document.getElementById("internalSearch");

const selectAllMembers=document.getElementById("selectAllMembers");

const selectAllInternal=document.getElementById("selectAllInternal");



// Contacts

const contactForm=document.getElementById("contactForm");



// History

const historyTable=document.getElementById("historyTableBody");



// Statistics

const totalMembers=document.getElementById("totalMembers");

const smsToday=document.getElementById("smsToday");

const internalMessages=document.getElementById("internalMessages");

const pendingDelivery=document.getElementById("pendingDelivery");



/*==========================================================
MODALS
==========================================================*/

const smsPreviewModal=document.getElementById("smsPreviewModal");

const successModal=document.getElementById("successModal");



/*==========================================================
TOAST
==========================================================*/

const toast=document.getElementById("toast");



/*==========================================================
NOTIFICATION ENGINE
Future Backend Feature
==========================================================*/

const notificationCenter={

    unread:[],

    read:[],

    total:0

};



/*==========================================================
LOADING
==========================================================*/

function showLoader(){

    document.body.style.cursor="wait";

}



function hideLoader(){

    document.body.style.cursor="default";

}



/*==========================================================
TOAST
==========================================================*/

function showToast(message,color="#2563eb"){

    toast.innerText=message;

    toast.style.background=color;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3500);

}



/*==========================================================
ERROR
==========================================================*/

function showError(message){

    showToast(message,"#dc2626");

}



/*==========================================================
SUCCESS
==========================================================*/

function showSuccess(message){

    showToast(message,"#16a34a");

}



/*==========================================================
BACKEND READY
==========================================================*/

console.log(

"Kingdom Ways Communication Center Loaded."

);

/*==========================================================
KINGDOM WAYS CMS
COMMUNICATION CENTER
PART 2
==========================================================*/


/*==========================================================
TAB SWITCHING
==========================================================*/

const tabs=document.querySelectorAll(".tab-btn");

const panels=document.querySelectorAll(".tab-panel");


tabs.forEach(tab=>{

    tab.addEventListener("click",()=>{

        tabs.forEach(btn=>btn.classList.remove("active"));

        panels.forEach(panel=>panel.classList.remove("active"));

        tab.classList.add("active");

        document
            .getElementById(tab.dataset.tab)
            .classList.add("active");

    });

});



/*==========================================================
LOAD MEMBERS
Backend:
GET /communication/members
==========================================================*/

async function loadMembers(){

    try{

        showLoader();

        const response=await fetch(

            ENDPOINTS.MEMBERS

        );

        const data=await response.json();

        members=data.members || [];

        renderMembers(members);

        renderInternalMembers(members);

        totalMembers.textContent=members.length;

    }

    catch(error){

        console.error(error);

        showError(

            "Unable to load members."

        );

    }

    finally{

        hideLoader();

    }

}



/*==========================================================
RENDER SMS MEMBERS
==========================================================*/

function renderMembers(list){

    memberTable.innerHTML="";

    if(list.length===0){

        memberTable.innerHTML=`

        <div class="empty-state">

            <i class="fas fa-users"></i>

            <h3>No Members Found</h3>

        </div>

        `;

        return;

    }



    list.forEach(member=>{

        memberTable.innerHTML+=`

        <div class="member-row">

            <input

            type="checkbox"

            class="memberCheckbox"

            value="${member.id}">

            <img

            src="${member.photo}"

            class="member-photo"

            onerror="this.src='images/default-user.png'">

            <div class="member-info">

                <h4>${member.full_name}</h4>

                <p>

                ${member.member_number}

                </p>

            </div>

            <span class="member-status

            ${member.online ? "online":"offline"}">

            ${member.online ? "Online":"Offline"}

            </span>

        </div>

        `;

    });

}



/*==========================================================
RENDER INTERNAL MEMBERS
==========================================================*/

function renderInternalMembers(list){

    internalMemberTable.innerHTML="";

    list.forEach(member=>{

        internalMemberTable.innerHTML+=`

        <div class="member-row">

            <input

            type="checkbox"

            class="internalCheckbox"

            value="${member.id}">

            <img

            src="${member.photo}"

            class="member-photo"

            onerror="this.src='images/default-user.png'">

            <div class="member-info">

                <h4>

                ${member.full_name}

                </h4>

                <p>

                ${member.member_number}

                </p>

            </div>

            <span class="member-status

            ${member.online?"online":"offline"}">

            ${member.online?"Online":"Offline"}

            </span>

        </div>

        `;

    });

}



/*==========================================================
SELECT ALL SMS
==========================================================*/

selectAllMembers.addEventListener(

"change",

function(){

document

.querySelectorAll(".memberCheckbox")

.forEach(box=>{

box.checked=this.checked;

});

updateSelectedMembers();

});



/*==========================================================
SELECT ALL INTERNAL
==========================================================*/

selectAllInternal.addEventListener(

"change",

function(){

document

.querySelectorAll(".internalCheckbox")

.forEach(box=>{

box.checked=this.checked;

});

updateInternalSelection();

});



/*==========================================================
UPDATE SMS SELECTION
==========================================================*/

function updateSelectedMembers(){

selectedMembers=[];

document

.querySelectorAll(".memberCheckbox")

.forEach(box=>{

if(box.checked){

selectedMembers.push(

parseInt(box.value)

);

}

});

document.getElementById(

"selectedCount"

).textContent=

selectedMembers.length;

document.getElementById(

"recipientCount"

).textContent=

selectedMembers.length;

}



/*==========================================================
UPDATE INTERNAL SELECTION
==========================================================*/

function updateInternalSelection(){

const selected=[];

document

.querySelectorAll(".internalCheckbox")

.forEach(box=>{

if(box.checked){

selected.push(box.value);

}

});

document.getElementById(

"internalSelectedCount"

).textContent=

selected.length;

document.getElementById(

"internalRecipientCount"

).textContent=

selected.length;

}



/*==========================================================
LIVE EVENTS
==========================================================*/

document.addEventListener(

"change",

event=>{

if(

event.target.classList.contains(

"memberCheckbox"

)

){

updateSelectedMembers();

}



if(

event.target.classList.contains(

"internalCheckbox"

)

){

updateInternalSelection();

}

});



/*==========================================================
SEARCH MEMBERS
==========================================================*/

memberSearch.addEventListener(

"keyup",

function(){

const search=this.value

.toLowerCase();

const filtered=

members.filter(member=>

member.full_name

.toLowerCase()

.includes(search)

||

member.member_number

.toLowerCase()

.includes(search)

);

renderMembers(filtered);

});



/*==========================================================
SEARCH INTERNAL
==========================================================*/

internalSearch.addEventListener(

"keyup",

function(){

const search=this.value

.toLowerCase();

const filtered=

members.filter(member=>

member.full_name

.toLowerCase()

.includes(search)

||

member.member_number

.toLowerCase()

.includes(search)

);

renderInternalMembers(filtered);

});



/*==========================================================
START
==========================================================*/

loadMembers();

/*==========================================================
KINGDOM WAYS CMS
COMMUNICATION CENTER
PART 3
SMS • INTERNAL • NOTIFICATIONS
==========================================================*/


/*==========================================================
SMS CHARACTER COUNTER
==========================================================*/

smsMessage.addEventListener("input",()=>{

    const length=smsMessage.value.length;

    characterCount.textContent=length;

    smsPages.textContent=Math.max(1,Math.ceil(length/160));

});



/*==========================================================
INTERNAL CHARACTER COUNTER
==========================================================*/

internalMessage.addEventListener("input",()=>{

    internalCharacters.textContent=

    internalMessage.value.length;

});



/*==========================================================
SMS PREVIEW
==========================================================*/

previewSMS.addEventListener("click",()=>{

    if(selectedMembers.length===0){

        return showError(

            "Select at least one member."

        );

    }

    if(smsMessage.value.trim()===""){

        return showError(

            "Type an SMS first."

        );

    }

    document.getElementById(

        "previewRecipients"

    ).textContent=

    selectedMembers.length+" Members";


    document.getElementById(

        "previewCategory"

    ).textContent=

    smsCategory.value;


    document.getElementById(

        "previewMessage"

    ).textContent=

    smsMessage.value;


    smsPreviewModal.classList.add("active");

});



/*==========================================================
CLOSE PREVIEW
==========================================================*/

document

.getElementById("closePreview")

.addEventListener("click",()=>{

    smsPreviewModal.classList.remove("active");

});



/*==========================================================
SEND SMS
Backend
POST /communication/sms/send
==========================================================*/

sendSMS.addEventListener(

"click",

async()=>{

if(selectedMembers.length===0){

return showError(

"No recipients selected."

);

}

try{

showLoader();

const response=await fetch(

ENDPOINTS.SMS,

{

method:"POST",

headers:{

"Content-Type":

"application/json"

},

body:JSON.stringify({

members:selectedMembers,

category:

smsCategory.value,

message:

smsMessage.value

})

}

);

const result=

await response.json();

if(result.success){

showSuccess(

"SMS queued successfully."

);

smsPreviewModal

.classList.remove(

"active"

);

smsForm.reset();

characterCount.textContent=0;

smsPages.textContent=1;

loadStatistics();

loadHistory();

}

else{

showError(

result.message

);

}

}

catch(error){

console.error(error);

showError(

"SMS sending failed."

);

}

finally{

hideLoader();

}

});



/*==========================================================
SEND INTERNAL MESSAGE
Backend
POST /communication/internal/send
==========================================================*/

internalForm.addEventListener(

"submit",

async(event)=>{

event.preventDefault();

const recipients=[];

document

.querySelectorAll(

".internalCheckbox"

)

.forEach(box=>{

if(box.checked)

recipients.push(

parseInt(box.value)

);

});

if(recipients.length===0){

return showError(

"Select members."

);

}

try{

showLoader();

const response=

await fetch(

ENDPOINTS.INTERNAL,

{

method:"POST",

headers:{

"Content-Type":

"application/json"

},

body:JSON.stringify({

members:recipients,

subject:

internalSubject.value,

message:

internalMessage.value

})

}

);

const result=

await response.json();

if(result.success){

showSuccess(

"Internal message sent."

);

internalForm.reset();

internalCharacters.textContent=0;

loadHistory();

}

else{

showError(

result.message

);

}

}

catch(error){

console.error(error);

showError(

"Internal message failed."

);

}

finally{

hideLoader();

}

});



/*==========================================================
NOTIFICATION ENGINE
Future CMS Notification
==========================================================*/

async function sendNotification(

title,

message,

type="announcement"

){

try{

await fetch(

ENDPOINTS.NOTIFICATIONS,

{

method:"POST",

headers:{

"Content-Type":

"application/json"

},

body:JSON.stringify({

title,

message,

type

})

}

);

console.log(

"Notification queued."

);

}

catch(error){

console.log(

"Notification unavailable."

);

}

}



/*==========================================================
AUTO NOTIFICATION
==========================================================*/

async function notifyMembers(){

await sendNotification(

"Church Announcement",

smsMessage.value,

smsCategory.value

);

}



/*==========================================================
SUCCESS MODAL
==========================================================*/

function showSuccessModal(text){

document

.getElementById(

"successMessage"

)

.textContent=text;

successModal

.classList.add(

"active"

);

}



document

.getElementById(

"closeSuccess"

)

.addEventListener(

"click",

()=>{

successModal

.classList.remove(

"active"

);

});



/*==========================================================
AUTO CLOSE MODAL
==========================================================*/

window.addEventListener(

"click",

(event)=>{

if(

event.target===smsPreviewModal

){

smsPreviewModal

.classList.remove(

"active"

);

}

if(

event.target===successModal

){

successModal

.classList.remove(

"active"

);

}

});

/*==========================================================
KINGDOM WAYS CMS
COMMUNICATION CENTER
PART 4
==========================================================*/


/*==========================================================
LOAD DASHBOARD STATISTICS
GET /communication/statistics
==========================================================*/

async function loadStatistics(){

    try{

        const response=await fetch(

            ENDPOINTS.STATISTICS

        );

        const data=await response.json();

        statistics=data;

        totalMembers.textContent=

            data.total_members || 0;

        smsToday.textContent=

            data.sms_today || 0;

        internalMessages.textContent=

            data.internal_messages || 0;

        pendingDelivery.textContent=

            data.pending_sms || 0;

    }

    catch(error){

        console.error(error);

    }

}



/*==========================================================
LOAD HISTORY
GET /communication/history
==========================================================*/

async function loadHistory(){

    try{

        const response=await fetch(

            ENDPOINTS.HISTORY

        );

        const data=await response.json();

        communicationHistory=

            data.history || [];

        renderHistory();

    }

    catch(error){

        console.error(error);

    }

}



/*==========================================================
RENDER HISTORY TABLE
==========================================================*/

function renderHistory(){

    historyTable.innerHTML="";

    if(communicationHistory.length===0){

        historyTable.innerHTML=`

        <tr>

            <td colspan="6">

                No communication history available.

            </td>

        </tr>

        `;

        return;

    }

    communicationHistory.forEach(item=>{

        historyTable.innerHTML+=`

        <tr>

            <td>${item.date}</td>

            <td>${item.category}</td>

            <td>${item.recipients}</td>

            <td>${item.channel}</td>

            <td>

                <span class="badge ${item.status}">

                    ${item.status}

                </span>

            </td>

            <td>${item.sent_by}</td>

        </tr>

        `;

    });

}



/*==========================================================
LOAD CHURCH CONTACTS
GET /communication/contacts
==========================================================*/

async function loadContacts(){

    try{

        const response=await fetch(

            ENDPOINTS.CONTACTS

        );

        contacts=await response.json();

        fillContactPreview();

    }

    catch(error){

        console.error(error);

    }

}



/*==========================================================
UPDATE CONTACT PREVIEW
==========================================================*/

function fillContactPreview(){

    document.getElementById(

        "churchPhonePreview"

    ).textContent=

    contacts.phone || "-";


    document.getElementById(

        "churchEmailPreview"

    ).textContent=

    contacts.email || "-";


    document.getElementById(

        "churchWhatsappPreview"

    ).textContent=

    contacts.whatsapp || "-";


    document.getElementById(

        "churchFacebookPreview"

    ).textContent=

    contacts.facebook || "-";


    document.getElementById(

        "churchYoutubePreview"

    ).textContent=

    contacts.youtube || "-";


    document.getElementById(

        "churchWebsitePreview"

    ).textContent=

    contacts.website || "-";

}



/*==========================================================
SAVE CONTACTS
POST /communication/contacts
==========================================================*/

contactForm.addEventListener(

"submit",

async(event)=>{

event.preventDefault();

try{

showLoader();

const response=

await fetch(

ENDPOINTS.CONTACTS,

{

method:"POST",

headers:{

"Content-Type":

"application/json"

},

body:JSON.stringify({

phone:

document.getElementById(

"churchPhone"

).value,

email:

document.getElementById(

"churchEmail"

).value,

website:

document.getElementById(

"churchWebsite"

).value,

facebook:

document.getElementById(

"churchFacebook"

).value,

whatsapp:

document.getElementById(

"churchWhatsapp"

).value,

youtube:

document.getElementById(

"churchYoutube"

).value,

instagram:

document.getElementById(

"churchInstagram"

).value,

address:

document.getElementById(

"churchAddress"

).value

})

}

);

const result=

await response.json();

if(result.success){

showSuccess(

"Church contacts updated."

);

loadContacts();

}

else{

showError(

result.message

);

}

}

catch(error){

console.error(error);

showError(

"Unable to save contacts."

);

}

finally{

hideLoader();

}

});



/*==========================================================
AUTO REFRESH
==========================================================*/

setInterval(()=>{

loadStatistics();

loadHistory();

},60000);



/*==========================================================
INITIAL LOAD
==========================================================*/

window.addEventListener(

"load",

()=>{

loadStatistics();

loadHistory();

loadContacts();

});

/*==========================================================
KINGDOM WAYS CMS
COMMUNICATION CENTER
PART 5
FINAL PRODUCTION
==========================================================*/


/*==========================================================
SMS DELIVERY POLLING
==========================================================*/

async function checkDeliveryStatus(){

    try{

        const response=await fetch(

            `${API_URL}/communication/delivery-status`

        );

        if(!response.ok) return;

        const data=await response.json();

        if(data.updated){

            loadHistory();

            loadStatistics();

        }

    }

    catch(error){

        console.log("Delivery polling skipped.");

    }

}



/*==========================================================
BACKGROUND POLLING
==========================================================*/

setInterval(checkDeliveryStatus,30000);



/*==========================================================
EXPORT HISTORY
==========================================================*/

document

.getElementById("exportHistory")

?.addEventListener(

"click",

()=>{

window.open(

`${API_URL}/communication/history/export`,

"_blank"

);

});



/*==========================================================
REFRESH HISTORY
==========================================================*/

document

.getElementById("refreshHistory")

?.addEventListener(

"click",

()=>{

loadHistory();

loadStatistics();

showSuccess(

"Communication history refreshed."

);

});



/*==========================================================
LIVE NOTIFICATION BADGE
==========================================================*/

async function updateNotificationBadge(){

    try{

        const response=await fetch(

            ENDPOINTS.NOTIFICATIONS

        );

        if(!response.ok) return;

        const data=await response.json();

        notificationCenter.unread=data.unread || [];

        notificationCenter.total=

        notificationCenter.unread.length;

        const badge=document.getElementById(

            "notificationBadge"

        );

        if(badge){

            badge.textContent=

            notificationCenter.total;

            badge.style.display=

            notificationCenter.total>0

            ?"inline-flex"

            :"none";

        }

    }

    catch(error){

        console.log("Notification badge unavailable.");

    }

}



/*==========================================================
KEYBOARD SHORTCUTS
==========================================================*/

document.addEventListener(

"keydown",

(event)=>{

    if(event.ctrlKey && event.key==="s"){

        event.preventDefault();

        if(contactForm){

            contactForm.requestSubmit();

        }

    }

    if(event.key==="Escape"){

        document

        .querySelectorAll(".modal.active")

        .forEach(modal=>{

            modal.classList.remove("active");

        });

    }

});



/*==========================================================
SERVER HEALTH CHECK
==========================================================*/

async function serverHealth(){

    try{

        const response=await fetch(

            `${API_URL}/health`

        );

        if(response.ok){

            console.log(

                "Backend Connected"

            );

        }

    }

    catch(error){

        console.warn(

            "Waiting for backend..."

        );

    }

}



/*==========================================================
AUTO RECONNECT
==========================================================*/

setInterval(serverHealth,60000);



/*==========================================================
MEMBER FILTERS
Future Backend
==========================================================*/

async function filterMembers(type){

    try{

        const response=await fetch(

            `${ENDPOINTS.MEMBERS}?filter=${type}`

        );

        if(!response.ok) return;

        const data=await response.json();

        members=data.members || [];

        renderMembers(members);

        renderInternalMembers(members);

    }

    catch(error){

        console.log(error);

    }

}



/*==========================================================
AUTO SAVE DRAFT
==========================================================*/

setInterval(()=>{

    localStorage.setItem(

        "communication_sms_draft",

        smsMessage?.value || ""

    );



    localStorage.setItem(

        "communication_internal_draft",

        internalMessage?.value || ""

    );

},10000);



/*==========================================================
RESTORE DRAFT
==========================================================*/

window.addEventListener(

"load",

()=>{

    const smsDraft=

    localStorage.getItem(

        "communication_sms_draft"

    );



    if(smsDraft && smsMessage){

        smsMessage.value=smsDraft;

        if(characterCount){

            characterCount.textContent=smsDraft.length;

        }

        if(smsPages){

            smsPages.textContent=

            Math.max(1,

            Math.ceil(smsDraft.length/160));

        }

    }



    const internalDraft=

    localStorage.getItem(

        "communication_internal_draft"

    );



    if(internalDraft && internalMessage){

        internalMessage.value=internalDraft;

        if(internalCharacters){

            internalCharacters.textContent=

            internalDraft.length;

        }

    }

});



/*==========================================================
SYSTEM STARTUP
==========================================================*/

async function initializeCommunicationCenter(){

    console.log(

        "===================================="

    );

    console.log(

        "KINGDOM WAYS COMMUNICATION CENTER"

    );

    console.log(

        "Production Version 2.0"

    );

    console.log(

        "===================================="

    );



    await Promise.all([

        loadMembers(),

        loadStatistics(),

        loadHistory()

    ]);

    await loadContacts();

    await updateNotificationBadge();

    await serverHealth();

}



initializeCommunicationCenter();



/*==========================================================
BACKEND READY
==========================================================*/

/*

Expected FastAPI Endpoints

GET    /communication/members
POST   /communication/sms/send
POST   /communication/internal/send
POST   /communication/notifications
GET    /communication/history
GET    /communication/history/export
GET    /communication/statistics
GET    /communication/delivery-status
GET    /communication/contacts
POST   /communication/contacts
GET    /health

*/