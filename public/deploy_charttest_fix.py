import os

BASE = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE, "public")

JS_CONTENT = """// =====================================================
// KINGDOM WAYS CHURCH
// CONNECT HUB
// charttest.js
// PART 1
// =====================================================



// ===============================
// API
// ===============================

const API = "";




// ===============================
// ELEMENTS
// ===============================


const memberPhoto =
document.getElementById("memberPhoto");


const memberName =
document.getElementById("memberName");


const memberNumber =
document.getElementById("memberNumber");


const conversationList =
document.getElementById("conversationList");


const messageContainer =
document.getElementById("messageContainer");


const messageForm =
document.getElementById("messageForm");


const messageInput =
document.getElementById("messageInput");


const activeChatName =
document.getElementById("activeChatName");


const activeChatInfo =
document.getElementById("activeChatInfo");


const adminSection =
document.getElementById("adminSection");


const newChatBtn =
document.getElementById("newChatBtn");





// ===============================
// CURRENT MEMBER
// ===============================


let currentMember = null;


let activeConversation = null;


let conversations = [];




function loadMemberSession(){


    const saved =
    localStorage.getItem("memberSession");



    if(!saved){


        console.log(
            "No member session found"
        );


        window.location.href="btn.html";


        return;


    }




    currentMember =
    JSON.parse(saved);




    if(Date.now() >= currentMember.expiresAt){


        console.log(
            "Member session expired"
        );


        localStorage.removeItem("memberSession");


        window.location.href="btn.html";


        return;


    }




    console.log(
        "CURRENT MEMBER:",
        currentMember
    );



    displayMember();

}





// ===============================
// DISPLAY MEMBER
// ===============================


function displayMember(){


    if(!currentMember)
    return;



    memberName.textContent =
    currentMember.full_name ||
    currentMember.username;



    memberNumber.textContent =
    currentMember.member_number ||
    "KWC MEMBER";




    if(currentMember.photo){


        memberPhoto.src =
        currentMember.photo;


    }

    else{


        memberPhoto.src =
        "images/default-avatar.png";


    }




    checkAdminAccess();


}








// ===============================
// ADMIN CHECK
// ===============================


function checkAdminAccess(){



    if(
        currentMember.role === "admin" ||
        currentMember.role === "superadmin"
    ){


        adminSection.classList.remove(
            "hidden"
        );



    }



}







// ===============================
// LOAD CONVERSATIONS
// ===============================


async function loadConversations(){



    try{


        const response =
        await fetch(
        `${API}/api/chat/conversations/${currentMember.member_number}`
        );



        if(!response.ok){


            throw new Error(
            "Conversation loading failed"
            );


        }




        const data =
        await response.json();


        conversations =
        data.conversations || [];




        renderConversationList();



    }

    catch(error){



        console.log(
            "Using offline conversations"
        );



        createDemoConversations();



    }



}








// ===============================
// DEMO DATA
// REMOVE AFTER API READY
// ===============================


function createDemoConversations(){



    conversations = [


        {

            id:1,

            name:"KINGDOM WAYS COMMUNITY",

            image:"images/logo.png",

            last:"Welcome to Connect Hub"

        },


        {

            id:2,

            name:"Youth Fellowship",

            image:"images/default-avatar.png",

            last:"Weekly discussion"

        },


        {

            id:3,

            name:"Prayer Group",

            image:"images/default-avatar.png",

            last:"Share prayer requests"

        }


    ];



    renderConversationList();



}







// ===============================
// RENDER CHAT LIST
// ===============================


function renderConversationList(){


    conversationList.innerHTML="";



    conversations.forEach(chat=>{



        const item =
        document.createElement("div");



        item.className =
        "conversation-item";



        item.innerHTML = `


        <img src="${chat.image || 'images/default-avatar.png'}">


        <div>

        <h4>

        ${chat.name}

        </h4>


        <p>

        ${chat.last_message || ""}

        </p>


        </div>


        `;



        item.onclick = ()=>{


            openConversation(chat);


        };



        conversationList.appendChild(item);



    });



}


// ===============================
// START NEW PRIVATE CHAT
// ===============================

async function startNewChat(){

    const receiverNumber =
    prompt(
        "Enter the member number to start a chat with (e.g. KWC-2026-000004):"
    );

    if(!receiverNumber){
        return;
    }

    const trimmed = receiverNumber.trim();

    if(!trimmed){
        return;
    }

    if(trimmed === currentMember.member_number){
        alert("You can't start a chat with yourself.");
        return;
    }

    try{

        const response =
        await fetch(
            `${API}/api/chat/private`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    sender_number: currentMember.member_number,
                    receiver_number: trimmed
                })
            }
        );

        const data =
        await response.json();

        if(!response.ok || !data.success){
            alert(
                data.detail ||
                data.message ||
                "Could not start conversation. Check the member number."
            );
            return;
        }

        await loadConversations();

        const opened =
        conversations.find(c => c.id === data.conversation_id);

        if(opened){
            openConversation(opened);
        }

    }

    catch(error){

        console.error(
            "Start Chat Error:",
            error
        );

        alert("Unable to connect to the server.");

    }

}

if(newChatBtn){

    newChatBtn.addEventListener(
        "click",
        startNewChat
    );

}


// =====================================================
// KINGDOM WAYS CHURCH
// CONNECT HUB
// charttest.js
// PART 2
// =====================================================


// ===============================
// OPEN CONVERSATION
// ===============================


function openConversation(chat){


    activeConversation = chat;



    activeChatName.textContent =
    chat.name;



    activeChatInfo.textContent =
    "Kingdom Ways Connect";



    loadMessages(chat.id);



}





// ===============================
// LOAD MESSAGES
// ===============================


async function loadMessages(chatId){



    messageContainer.innerHTML="";



    try{


        const response =
        await fetch(
        `${API}/api/chat/messages/${chatId}`
        );



        if(!response.ok){

            throw new Error(
            "Message API unavailable"
            );

        }



        const data =
        await response.json();



        renderMessages(data.messages || []);



    }


    catch(error){



        console.log(
        "Using empty conversation"
        );



        renderMessages([]);



    }



}








// ===============================
// DISPLAY MESSAGES
// ===============================


function renderMessages(messages){



    messageContainer.innerHTML="";



    if(messages.length===0){


        messageContainer.innerHTML=`


        <div class="no-conversation">


        <i class="fa-solid fa-comments"></i>


        <p>
        Start your conversation
        </p>


        </div>


        `;



        return;


    }







    messages.forEach(message=>{


        createMessageBubble(message);


    });



}








// ===============================
// CREATE MESSAGE BUBBLE
// ===============================


function createMessageBubble(message){



    const bubble =
    document.createElement("div");



    const sender =
    message.member_number ==
    currentMember.member_number;



    bubble.className =
    sender

    ?

    "message-bubble sender"

    :

    "message-bubble receiver";






    bubble.innerHTML = `


    <strong>

    ${message.sender_name || "Member"}

    </strong>


    <p>

    ${message.message}

    </p>



    <span class="message-time">

    ${formatTime(message.created_at)}

    </span>



    `;



    messageContainer.appendChild(
    bubble
    );



    messageContainer.scrollTop =
    messageContainer.scrollHeight;



}









// ===============================
// SEND MESSAGE
// ===============================


messageForm.addEventListener(
"submit",
async function(e){


    e.preventDefault();



    const text =
    messageInput.value.trim();



    if(!text)
    return;



    if(!activeConversation){


        alert(
        "Select a conversation first"
        );


        return;


    }






    const newMessage = {



        member_number:
        currentMember.member_number,



        sender_name:
        currentMember.full_name,



        message:text,



        created_at:
        new Date().toISOString()



    };





    // Display instantly


    createMessageBubble(
    newMessage
    );



    messageInput.value="";




    // Send to server


    try{


        await fetch(
        `${API}/api/chat/messages`,
        {


            method:"POST",


            headers:{


            "Content-Type":
            "application/json"


            },


            body:JSON.stringify({


                conversation_id:
                activeConversation.id,


                member_number:
                currentMember.member_number,


                sender_name:
                currentMember.full_name,


                text:text


            })


        });



    }



    catch(error){



        console.log(
        "Offline message saved locally"
        );



        saveOfflineMessage(
        newMessage
        );


    }




});









// ===============================
// OFFLINE STORAGE
// ===============================


function saveOfflineMessage(message){



    let saved =
    JSON.parse(
    localStorage.getItem(
    "offlineMessages"
    ) || "[]"
    );



    saved.push(message);



    localStorage.setItem(

    "offlineMessages",

    JSON.stringify(saved)

    );



}








// ===============================
// TIME FORMAT
// ===============================


function formatTime(date){



    if(!date)

    return "";



    return new Date(date)

    .toLocaleTimeString(

    [],

    {

        hour:"2-digit",

        minute:"2-digit"

    }

    );



}

// =====================================================
// KINGDOM WAYS CHURCH
// CONNECT HUB
// charttest.js
// PART 3
// =====================================================



// ===============================
// PHOTO UPLOAD SUPPORT
// ===============================


function updateMemberPhoto(file){



    if(!file)

    return;




    const reader =
    new FileReader();



    reader.onload = function(e){



        memberPhoto.src =
        e.target.result;



        currentMember.photo =
        e.target.result;



        localStorage.setItem(

        "member",

        JSON.stringify(currentMember)

        );



    };



    reader.readAsDataURL(file);



}







// ===============================
// SEARCH CONVERSATIONS
// ===============================


const chatSearch =
document.getElementById(
"chatSearch"
);



if(chatSearch){



chatSearch.addEventListener(
"input",
()=>{


    const value =
    chatSearch.value
    .toLowerCase();



    const items =
    document.querySelectorAll(
    ".conversation-item"
    );



    items.forEach(item=>{


        const text =
        item.innerText
        .toLowerCase();



        if(
        text.includes(value)
        ){


            item.style.display =
            "flex";


        }

        else{


            item.style.display =
            "none";


        }



    });



});



}









// ===============================
// AUTO MESSAGE REFRESH
// ===============================


let refreshTimer = null;



function startMessageRefresh(){



    if(refreshTimer)

    clearInterval(refreshTimer);




    refreshTimer =

    setInterval(()=>{



        if(activeConversation){


            loadMessages(
            activeConversation.id
            );


        }



    },5000);



}







// ===============================
// ADMIN ACTION HOOKS
// ===============================


const adminButtons =
document.querySelectorAll(
".admin-section button"
);



adminButtons.forEach(button=>{



    button.addEventListener(
    "click",
    ()=>{



        console.log(
        "Admin action:",
        button.innerText
        );



        alert(

        button.innerText +

        " feature will connect to CMS admin panel"

        );



    });



});









// ===============================
// SEND ENTER KEY
// ===============================


if(messageInput){



messageInput.addEventListener(
"keydown",
function(e){



    if(
    e.key==="Enter" &&
    !e.shiftKey
    ){


        e.preventDefault();


        messageForm.dispatchEvent(

        new Event(
        "submit"

        )

        );


    }



});



}









// ===============================
// ONLINE MEMBER PLACEHOLDER
// ===============================


function updateOnlineStatus(){



    if(!currentMember)

    return;



    console.log(

    "Member active:",

    currentMember.member_number

    );



}







// ==========================================
// MASA7 3D INTRO SIGNATURE
// CONNECT HUB ENTRY ANIMATION
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

    intro.style.animation =
    "masaFade 3s forwards";



    const logo = document.createElement("div");


    logo.innerHTML = "MASA7";


    logo.style.fontSize =
    "clamp(70px,12vw,160px)";


    logo.style.fontWeight = "900";


    logo.style.letterSpacing = "15px";


    logo.style.fontFamily =
    "Arial Black,Arial,sans-serif";


    logo.style.color =
    "#FFD700";


    logo.style.textShadow =
    `
    0 0 20px gold,
    0 0 50px #00ff88,
    0 0 100px #2477ff
    `;


    logo.style.animation =
    "masa3D 2.5s ease";



    intro.appendChild(logo);


    document.body.appendChild(intro);



    setTimeout(()=>{


        intro.remove();


    },3000);



}




// Inject animation styles automatically

const masaStyle =
document.createElement("style");


masaStyle.innerHTML = `


@keyframes masa3D{


0%{

opacity:0;

transform:
perspective(900px)
rotateX(80deg)
scale(.2);

}


50%{

opacity:1;

transform:
perspective(900px)
rotateX(0deg)
scale(1.15);

}


100%{

transform:
perspective(900px)
rotateY(360deg)
scale(1);

}


}



@keyframes masaFade{


0%{

opacity:1;

}


80%{

opacity:1;

}


100%{

opacity:0;

}


}


`;


document.head.appendChild(masaStyle);




// Run when Connect Hub opens

window.addEventListener(
"load",
()=>{


    showMasa7Intro();


});

// ===============================
// PAGE START
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{



    console.log(
    "KINGDOM WAYS CONNECT HUB LOADED"
    );



    loadMemberSession();



    loadConversations();



    startMessageRefresh();



    updateOnlineStatus();



});







// ===============================
// SECURITY CHECK
// ===============================


window.addEventListener(
"beforeunload",
()=>{



    if(currentMember){



        console.log(

        "Leaving Connect Hub:",

        currentMember.member_number

        );



    }



});





"""

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">


<title>
Kingdom Ways | Connect Hub
</title>


<!-- Icons -->
<link rel="stylesheet"
href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">


<!-- Connect Hub Style -->
<link rel="stylesheet" href="charttest.css">


</head>



<body>


<div class="connect-wrapper">



<!-- =================================================
     LEFT PANEL
     CHAT / GROUP LIST
================================================== -->


<aside class="connect-sidebar">


<header class="connect-header">


<div class="member-profile">


<img 
id="memberPhoto"
src="images/default-avatar.png"
alt="Member Photo">


<div>

<h3 id="memberName">
Loading...
</h3>


<p id="memberNumber">
KWC-000000
</p>


</div>


</div>




<div class="header-actions">


<button id="newChatBtn" title="Start New Chat">

<i class="fa-solid fa-users"></i>

</button>



<button title="Search">

<i class="fa-solid fa-magnifying-glass"></i>

</button>



<button title="More">

<i class="fa-solid fa-ellipsis"></i>

</button>


</div>


</header>





<!-- SEARCH -->


<div class="chat-search">


<input

type="search"

id="chatSearch"

placeholder="Search conversations..."

>


</div>






<!-- CHAT LIST -->


<div 
class="conversation-list"
id="conversationList">


<!-- JavaScript loads chats -->


</div>







<!-- ADMIN AREA -->


<div 
id="adminSection"
class="admin-section hidden">


<h4>

<i class="fa-solid fa-shield-halved"></i>

Admin Control

</h4>



<button>

Create Group

</button>


<button>

Manage Members

</button>


</div>



</aside>







<!-- =================================================
     RIGHT PANEL
     ACTIVE CHAT
================================================== -->


<main class="chat-area">





<header class="chat-header">


<div class="active-chat-profile">


<div 
class="group-avatar"
id="activeAvatar">

KW

</div>



<div>


<h2 id="activeChatName">

KINGDOM WAYS CONNECT

</h2>


<p id="activeChatInfo">

Select conversation

</p>



</div>


</div>



</header>









<!-- MESSAGE DISPLAY -->


<section

class="message-container"

id="messageContainer">


<div class="empty-chat">


<i class="fa-solid fa-comments"></i>


<p>

Choose a conversation to start

</p>


</div>



</section>









<!-- MESSAGE INPUT -->


<footer class="message-box">



<form id="messageForm">



<button 
type="button"
class="attach-btn">


<i class="fa-solid fa-paperclip"></i>


</button>





<input


type="text"

id="messageInput"

placeholder="Write a message..."

autocomplete="off"


required>



<button

type="submit"

class="send-btn">


<i class="fa-solid fa-paper-plane"></i>


</button>



</form>



</footer>







</main>



</div>





<script src="charttest.js"></script>


</body>


</html>"""

if not os.path.isdir(PUBLIC_DIR):
    print(f"ERROR: could not find a 'public' folder next to this script at {PUBLIC_DIR}")
    print("Move this script into your churchweb project root (same folder as main.py's parent) and run it again.")
    raise SystemExit(1)

js_path = os.path.join(PUBLIC_DIR, "charttest.js")
html_path = os.path.join(PUBLIC_DIR, "charttest.html")

with open(js_path, "w", encoding="utf-8", newline="") as f:
    f.write(JS_CONTENT)

with open(html_path, "w", encoding="utf-8", newline="") as f:
    f.write(HTML_CONTENT)

print(f"Wrote {js_path}")
print(f"Wrote {html_path}")
print("Done. Hard refresh your browser (Ctrl+Shift+R) and try again.")