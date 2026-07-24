//==========================================================
// KINGDOM WAYS CHURCH
// CONNECT WITH US
// CLIENT
// PART 1
//==========================================================


//==========================================================
// API
//==========================================================

// Change this later if needed.
// Keeping it relative makes it work locally and in production.

const API_URL = "";


//==========================================================
// ELEMENTS
//==========================================================

const whatsappBtn = document.getElementById("openWhatsapp");

const facebookBtn = document.getElementById("openFacebook");

const emailBtn = document.getElementById("openEmail");

const websiteBtn = document.getElementById("openWebsite");

const youtubeBtn = document.getElementById("openYoutube");

const mapBtn = document.getElementById("openMap");

const phoneBtn = document.getElementById("callChurch");

const instagramBtn = document.getElementById("openInstagram");


//==========================================================
// TEXT
//==========================================================

const whatsappText = document.getElementById("whatsappText");

const facebookText = document.getElementById("facebookText");

const emailText = document.getElementById("emailText");

const websiteText = document.getElementById("websiteText");

const youtubeText = document.getElementById("youtubeText");

const mapText = document.getElementById("mapText");

const phoneText = document.getElementById("phoneText");

const instagramText = document.getElementById("instagramText");


//==========================================================
// CONTACT DATA
//==========================================================

let churchContact = {};


//==========================================================
// DEFAULT VALUES
//==========================================================

const DEFAULT_CONTACT = {

    whatsapp: "",

    facebook: "",

    email: "info@kingdomways.org",

    website: "",

    youtube: "",

    maps: "",

    phone: "",

    instagram: ""

};


//==========================================================
// LOAD CONTACTS
//==========================================================

async function loadChurchContacts(){

    try{

        const response = await fetch(

            API_URL + "/church/contact"

        );

        if(!response.ok){

            throw new Error("Server Error");

        }

        churchContact = await response.json();

    }

    catch(error){

        console.log(

            "Using default contact information."

        );

        churchContact = DEFAULT_CONTACT;

    }

    populatePage();

}

//==========================================================
// KINGDOM WAYS CHURCH
// CONNECT WITH US
// CLIENT
// PART 2
//==========================================================


//==========================================================
// POPULATE PAGE
//==========================================================

function populatePage(){

    // ------------------------------------
    // TEXT
    // ------------------------------------

    whatsappText.textContent =
        churchContact.whatsapp_name ||
        "Chat with Church Office";

    facebookText.textContent =
        churchContact.facebook_name ||
        "Official Facebook Page";

    emailText.textContent =
        churchContact.email ||
        "info@kingdomways.org";

    websiteText.textContent =
        churchContact.website_name ||
        "Official Church Website";

    youtubeText.textContent =
        churchContact.youtube_name ||
        "Watch Sermons";

    mapText.textContent =
        churchContact.location_name ||
        "Find Our Church";

    phoneText.textContent =
        churchContact.phone ||
        "Not Available";

    instagramText.textContent =
        churchContact.instagram_name ||
        "Official Instagram";


    // ------------------------------------
    // BUTTON EVENTS
    // ------------------------------------

    whatsappBtn.onclick = openWhatsapp;

    facebookBtn.onclick = openFacebook;

    emailBtn.onclick = openEmail;

    websiteBtn.onclick = openWebsite;

    youtubeBtn.onclick = openYoutube;

    mapBtn.onclick = openMaps;

    phoneBtn.onclick = callChurch;

    instagramBtn.onclick = openInstagram;

}


//==========================================================
// ENABLE / DISABLE BUTTON
//==========================================================

function toggleButton(button, enabled){

    if(enabled){

        button.disabled = false;

        button.style.opacity = "1";

        button.style.cursor = "pointer";

    }

    else{

        button.disabled = true;

        button.style.opacity = ".55";

        button.style.cursor = "not-allowed";

    }

}


//==========================================================
// VALIDATE AVAILABLE LINKS
//==========================================================

function validateButtons(){

    toggleButton(

        whatsappBtn,

        !!churchContact.whatsapp

    );

    toggleButton(

        facebookBtn,

        !!churchContact.facebook

    );

    toggleButton(

        emailBtn,

        !!churchContact.email

    );

    toggleButton(

        websiteBtn,

        !!churchContact.website

    );

    toggleButton(

        youtubeBtn,

        !!churchContact.youtube

    );

    toggleButton(

        mapBtn,

        !!churchContact.maps

    );

    toggleButton(

        phoneBtn,

        !!churchContact.phone

    );

    toggleButton(

        instagramBtn,

        !!churchContact.instagram

    );

}


//==========================================================
// UPDATE EVERYTHING
//==========================================================

function refreshPage(){

    populatePage();

    validateButtons();

}

//==========================================================
// KINGDOM WAYS CHURCH
// CONNECT WITH US
// CLIENT
// PART 3
//==========================================================


//==========================================================
// OPEN URL
//==========================================================

function openLink(url){

    if(!url){

        alert("This service is not available yet.");

        return;

    }

    window.open(

        url,

        "_blank",

        "noopener,noreferrer"

    );

}


//==========================================================
// WHATSAPP
//==========================================================

function openWhatsapp(){

    openLink(

        churchContact.whatsapp

    );

}


//==========================================================
// FACEBOOK
//==========================================================

function openFacebook(){

    openLink(

        churchContact.facebook

    );

}


//==========================================================
// EMAIL
//==========================================================

function openEmail(){

    if(!churchContact.email){

        alert("Church email is unavailable.");

        return;

    }

    window.location.href =

        "mailto:" + churchContact.email;

}


//==========================================================
// WEBSITE
//==========================================================

function openWebsite(){

    openLink(

        churchContact.website

    );

}


//==========================================================
// YOUTUBE
//==========================================================

function openYoutube(){

    openLink(

        churchContact.youtube

    );

}


//==========================================================
// GOOGLE MAPS
//==========================================================

function openMaps(){

    openLink(

        churchContact.maps

    );

}


//==========================================================
// OFFICE PHONE
//==========================================================

function callChurch(){

    if(!churchContact.phone){

        alert("Church office phone is unavailable.");

        return;

    }

    window.location.href =

        "tel:" + churchContact.phone;

}


//==========================================================
// INSTAGRAM
//==========================================================

function openInstagram(){

    openLink(

        churchContact.instagram

    );

}

//==========================================================
// KINGDOM WAYS CHURCH
// CONNECT WITH US
// CLIENT
// PART 4
//==========================================================


//==========================================================
// LOADING
//==========================================================

function showLoading(){

    document.body.style.cursor = "wait";

}


function hideLoading(){

    document.body.style.cursor = "default";

}


//==========================================================
// TOAST
//==========================================================

function showToast(message,type="success"){

    let toast = document.getElementById("toast");

    if(!toast){

        toast = document.createElement("div");

        toast.id = "toast";

        toast.style.position="fixed";
        toast.style.top="25px";
        toast.style.right="25px";
        toast.style.padding="15px 22px";
        toast.style.borderRadius="14px";
        toast.style.color="#fff";
        toast.style.fontWeight="600";
        toast.style.zIndex="999999";
        toast.style.transition=".35s";
        toast.style.opacity="0";
        toast.style.transform="translateY(-20px)";
        toast.style.boxShadow="0 15px 35px rgba(0,0,0,.18)";

        document.body.appendChild(toast);

    }

    if(type==="success"){

        toast.style.background="#10b981";

    }

    else if(type==="warning"){

        toast.style.background="#f59e0b";

    }

    else{

        toast.style.background="#ef4444";

    }

    toast.textContent = message;

    toast.style.opacity="1";

    toast.style.transform="translateY(0)";

    setTimeout(()=>{

        toast.style.opacity="0";

        toast.style.transform="translateY(-20px)";

    },3500);

}



//==========================================================
// CONNECTION STATUS
//==========================================================

function updateConnectionStatus(){

    if(navigator.onLine){

        showToast(

            "Connected to Kingdom Ways Church",

            "success"

        );

    }

    else{

        showToast(

            "You are offline",

            "warning"

        );

    }

}



//==========================================================
// ONLINE EVENT
//==========================================================

window.addEventListener(

    "online",

    ()=>{

        showToast(

            "Internet connection restored."

        );

        loadChurchContacts();

    }

);


//==========================================================
// OFFLINE EVENT
//==========================================================

window.addEventListener(

    "offline",

    ()=>{

        showToast(

            "No Internet Connection",

            "warning"

        );

    }

);


//==========================================================
// SAFE FETCH
//==========================================================

async function safeLoadContacts(){

    showLoading();

    try{

        await loadChurchContacts();

        refreshPage();

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to load church contacts.",

            "error"

        );

    }

    finally{

        hideLoading();

    }

}
//==========================================================
// KINGDOM WAYS CHURCH
// CONNECT WITH US
// CLIENT
// PART 5
//==========================================================


//==========================================================
// SEARCH CONTACTS
//==========================================================

const searchInput = document.getElementById("searchContact");

if(searchInput){

    searchInput.addEventListener("input", filterContacts);

}


function filterContacts(){

    const keyword = searchInput.value
        .toLowerCase()
        .trim();

    const cards = document.querySelectorAll(".contact-card");

    cards.forEach(card=>{

        const text = card.innerText.toLowerCase();

        if(text.includes(keyword)){

            card.style.display="block";

        }

        else{

            card.style.display="none";

        }

    });

}



//==========================================================
// CHECK URL
//==========================================================

function isValidUrl(url){

    if(!url) return false;

    try{

        new URL(url);

        return true;

    }

    catch{

        return false;

    }

}



//==========================================================
// VERIFY LINKS
//==========================================================

function verifyLinks(){

    if(churchContact.whatsapp){

        toggleButton(

            whatsappBtn,

            isValidUrl(churchContact.whatsapp)

        );

    }

    if(churchContact.facebook){

        toggleButton(

            facebookBtn,

            isValidUrl(churchContact.facebook)

        );

    }

    if(churchContact.website){

        toggleButton(

            websiteBtn,

            isValidUrl(churchContact.website)

        );

    }

    if(churchContact.youtube){

        toggleButton(

            youtubeBtn,

            isValidUrl(churchContact.youtube)

        );

    }

    if(churchContact.maps){

        toggleButton(

            mapBtn,

            isValidUrl(churchContact.maps)

        );

    }

    if(churchContact.instagram){

        toggleButton(

            instagramBtn,

            isValidUrl(churchContact.instagram)

        );

    }

}



//==========================================================
// CARD HOVER
//==========================================================

document.querySelectorAll(".contact-card")

.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-8px)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0)";

    });

});



//==========================================================
// COPY EMAIL
//==========================================================

if(emailText){

    emailText.style.cursor="pointer";

    emailText.title="Click to copy";

    emailText.addEventListener("click",()=>{

        navigator.clipboard.writeText(

            emailText.textContent

        );

        showToast(

            "Email copied to clipboard."

        );

    });

}



//==========================================================
// COPY PHONE
//==========================================================

if(phoneText){

    phoneText.style.cursor="pointer";

    phoneText.title="Click to copy";

    phoneText.addEventListener("click",()=>{

        navigator.clipboard.writeText(

            phoneText.textContent

        );

        showToast(

            "Phone number copied."

        );

    });

}



//==========================================================
// PRELOAD LINKS
//==========================================================

function preloadLinks(){

    [

        churchContact.website,

        churchContact.youtube,

        churchContact.facebook

    ]

    .forEach(link=>{

        if(isValidUrl(link)){

            const preload=document.createElement("link");

            preload.rel="prefetch";

            preload.href=link;

            document.head.appendChild(preload);

        }

    });

}

//==========================================================
// KINGDOM WAYS CHURCH
// CONNECT WITH US
// CLIENT
// PART 6
//==========================================================


//==========================================================
// INITIALIZE PAGE
//==========================================================

async function initializePage(){

    try{

        showLoading();

        await loadChurchContacts();

        refreshPage();

        verifyLinks();

        preloadLinks();

        updateConnectionStatus();

    }

    catch(error){

        console.error(

            "Initialization Error:",

            error

        );

        showToast(

            "Unable to initialize church contacts.",

            "error"

        );

    }

    finally{

        hideLoading();

    }

}


//==========================================================
// AUTO REFRESH CONTACTS
//==========================================================
// Every 5 minutes the page checks whether the
// administrator has changed any official links.
//==========================================================

setInterval(async()=>{

    try{

        await loadChurchContacts();

        refreshPage();

    }

    catch(error){

        console.log(

            "Automatic refresh skipped."

        );

    }

},300000);



//==========================================================
// PAGE VISIBLE
//==========================================================
// Refresh immediately when the member returns
// to the browser tab.
//==========================================================

document.addEventListener(

    "visibilitychange",

    async()=>{

        if(document.visibilityState==="visible"){

            try{

                await loadChurchContacts();

                refreshPage();

            }

            catch(error){

                console.log(

                    "Unable to refresh contacts."

                );

            }

        }

    }

);



//==========================================================
// DOM READY
//==========================================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        initializePage();

    }

);



//==========================================================
// KEYBOARD SHORTCUTS
//==========================================================

document.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="F5"){

            showLoading();

        }

    }

);



//==========================================================
// PREVENT DOUBLE CLICK
//==========================================================

document.querySelectorAll(".openBtn")

.forEach(button=>{

    button.addEventListener("click",()=>{

        button.disabled=true;

        setTimeout(()=>{

            button.disabled=false;

        },1200);

    });

});



//==========================================================
// VERSION
//==========================================================

console.log(

"=========================================="

);

console.log(

" Kingdom Ways Church"

);

console.log(

" Connect With Us Client"

);

console.log(

" Version 2.0"

);

console.log(

" Backend Ready"

);

console.log(

"=========================================="

);