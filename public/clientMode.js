// ======================================================
// KINGDOM WAYS PENTECOSTAL CHURCH
// CLIENT MODE
// PART 1 - INITIALIZATION & SESSION
// ======================================================

console.log("CLIENT MODE STARTING...");

// ======================================================
// API
// ======================================================

const API = "";

// ======================================================
// SESSION
// ======================================================

const SESSION_KEY = "memberSession";

// ======================================================
// DOM
// ======================================================

const welcomePopup =
document.getElementById("welcomePopup");

const memberName =
document.getElementById("memberName");

const currentTime =
document.getElementById("currentTime");

const logoutBtn =
document.getElementById("logoutBtn");

const year =
document.getElementById("year");

// ======================================================
// FOOTER YEAR
// ======================================================

if(year){

    year.innerHTML =
    new Date().getFullYear();

}

// ======================================================
// GET MEMBER SESSION
// ======================================================

function getMemberSession(){

    const data =
    localStorage.getItem(
        SESSION_KEY
    );

    if(!data){

        return null;

    }

    try{

        return JSON.parse(data);

    }

    catch(error){

        console.error(error);

        localStorage.removeItem(
            SESSION_KEY
        );

        return null;

    }

}

// ======================================================
// SESSION VALIDATION
// ======================================================

const session =
getMemberSession();

if(!session){

    console.log(
        "NO ACTIVE SESSION"
    );

    window.location.href =
    "btn.html";

    throw new Error(
        "SESSION NOT FOUND"
    );

}

if(Date.now() >= session.expiresAt){

    localStorage.removeItem(
        SESSION_KEY
    );

    window.location.href =
    "btn.html";

    throw new Error(
        "SESSION EXPIRED"
    );

}

console.log(
    "SESSION VERIFIED"
);

// ======================================================
// WELCOME POPUP
// ======================================================

if(welcomePopup && memberName){

    memberName.innerHTML =
    session.full_name;

    welcomePopup.classList.add(
        "show"
    );

    setTimeout(()=>{

        welcomePopup.classList.remove(
            "show"
        );

    },4000);

}

// ======================================================
// LIVE CLOCK
// ======================================================

function updateClock(){

    if(!currentTime){

        return;

    }

    const now =
    new Date();

    currentTime.innerHTML =
    now.toLocaleTimeString(
        [],
        {

            hour:"2-digit",

            minute:"2-digit"

        }

    );

}

updateClock();

setInterval(

    updateClock,

    1000

);

// ======================================================
// TODAY
// ======================================================

const today =
new Date();

const options={

    weekday:"long",

    year:"numeric",

    month:"long",

    day:"numeric"

};

console.log(

    today.toLocaleDateString(

        "en-US",

        options

    )

);

// ======================================================
// LOGOUT
// ======================================================

if(logoutBtn){

    logoutBtn.addEventListener(

        "click",

        ()=>{

            localStorage.removeItem(

                SESSION_KEY

            );

            window.location.href =

            "btn.html";

        }

    );

}

console.log(

    "CLIENT INITIALIZATION COMPLETE"

);

// ======================================================
// PART 2 - BIBLE VERSE ROTATION
// ======================================================

// ======================================
// BIBLE VERSES
// ======================================

const verses = [

    '"I can do all things through Christ who strengthens me." — Philippians 4:13',

    '"The Lord is my Shepherd; I shall not want." — Psalm 23:1',

    '"Trust in the Lord with all your heart." — Proverbs 3:5',

    '"For with God nothing shall be impossible." — Luke 1:37',

    '"Be strong and courageous." — Joshua 1:9',

    '"The joy of the Lord is your strength." — Nehemiah 8:10',

    '"Cast all your anxiety on Him because He cares for you." — 1 Peter 5:7'

];

// ======================================
// CREATE VERSE ELEMENT
// ======================================

const hero =
document.querySelector(".hero-content");

const verse =
document.createElement("p");

verse.className =
"verse";

verse.style.opacity = "0";

verse.style.transition =
"opacity .8s ease";

if(hero){

    hero.appendChild(verse);

}

// ======================================
// ROTATE VERSES
// ======================================

let currentVerse = 0;

function rotateVerse(){

    if(!hero){

        return;

    }

    verse.style.opacity = "0";

    setTimeout(()=>{

        verse.innerHTML =

        verses[currentVerse];

        verse.style.opacity = "1";

        currentVerse++;

        if(currentVerse >= verses.length){

            currentVerse = 0;

        }

    },400);

}

// ======================================
// START
// ======================================

rotateVerse();

// Change every 8 seconds
setInterval(

    rotateVerse,

    8000

);

// ======================================
// HERO FADE IN
// ======================================

if(hero){

    hero.style.opacity = "0";

    hero.style.transform =

    "translateY(30px)";

    setTimeout(()=>{

        hero.style.transition =

        "all .8s ease";

        hero.style.opacity = "1";

        hero.style.transform =

        "translateY(0)";

    },300);

}

// ======================================
// THEME & VISION HOVER EFFECT
// ======================================

document

.querySelectorAll(

".theme-box,.vision-box"

)

.forEach(box=>{

    box.addEventListener(

        "mouseenter",

        ()=>{

            box.style.transform =

            "translateY(-5px)";

        }

    );

    box.addEventListener(

        "mouseleave",

        ()=>{

            box.style.transform =

            "translateY(0)";

        }

    );

});

console.log(

    "Bible Verse Rotation Ready"

);

// ======================================================
// PART 3 - LOAD CHURCH THEME & VISION
// ======================================================

// ======================================
// DOM
// ======================================

const churchTheme =
document.getElementById("churchTheme");

const churchVision =
document.getElementById("churchVision");

// ======================================
// DEFAULT VALUES
// ======================================

const DEFAULT_THEME =

"Walking by Faith.";

const DEFAULT_VISION =

"To know Christ and make Him known.";

// ======================================
// LOAD CHURCH THEME
// ======================================

async function loadChurchTheme(){

    if(!churchTheme){

        return;

    }

    try{

        const response =
        await fetch(

            `${API}/theme`

        );

        if(!response.ok){

            throw new Error(

                "Unable to load theme."

            );

        }

        const data =
        await response.json();

        churchTheme.innerHTML =

        data.theme ||

        DEFAULT_THEME;

    }

    catch(error){

        console.error(

            "Theme Error:",

            error

        );

        churchTheme.innerHTML =

        DEFAULT_THEME;

    }

}

// ======================================
// LOAD CHURCH VISION
// ======================================

async function loadChurchVision(){

    if(!churchVision){

        return;

    }

    try{

        const response =
        await fetch(

            `${API}/vision`

        );

        if(!response.ok){

            throw new Error(

                "Unable to load vision."

            );

        }

        const data =
        await response.json();

        churchVision.innerHTML =

        data.vision ||

        DEFAULT_VISION;

    }

    catch(error){

        console.error(

            "Vision Error:",

            error

        );

        churchVision.innerHTML =

        DEFAULT_VISION;

    }

}

// ======================================
// LOAD BOTH AT THE SAME TIME
// ======================================

Promise.all([

    loadChurchTheme(),

    loadChurchVision()

])

.then(()=>{

    console.log(

        "Theme & Vision Loaded"

    );

});

// ======================================
// OPTIONAL REFRESH
// (Secretary updates become visible)
// ======================================

// Refresh every 5 minutes

setInterval(()=>{

    loadChurchTheme();

    loadChurchVision();

},

300000);

// ======================================================
// PART 3 COMPLETE
// ======================================================

console.log(

    "Church Information Ready"

);

// ======================================================
// PART 4 - CARDS, NAVIGATION & SECRET ADMIN
// ======================================================

// ======================================
// CARD ANIMATION
// ======================================

const cards =
document.querySelectorAll(".card");

function animateCards(){

    cards.forEach((card,index)=>{

        card.style.opacity = "0";

        card.style.transform =
        "translateY(40px)";

        setTimeout(()=>{

            card.style.transition =
            ".7s ease";

            card.style.opacity =
            "1";

            card.style.transform =
            "translateY(0)";

        },200 * index);

    });

}

animateCards();

// ======================================
// CARD HOVER EFFECT
// ======================================

cards.forEach(card=>{

    card.addEventListener(

        "mouseenter",

        ()=>{

            card.style.transform =
            "translateY(-10px) scale(1.03)";

        }

    );

    card.addEventListener(

        "mouseleave",

        ()=>{

            card.style.transform =
            "translateY(0)";

        }

    );

});

// ======================================
// CARD CLICK EFFECT
// ======================================

cards.forEach(card=>{

    card.addEventListener(

        "mousedown",

        ()=>{

            card.style.transform =
            "scale(.98)";

        }

    );

    card.addEventListener(

        "mouseup",

        ()=>{

            card.style.transform =
            "translateY(-6px)";

        }

    );

});

// ======================================
// SECRET ADMIN ENTRY
// Five clicks opens Admin Login
// ======================================

window.addEventListener(

    "load",

    ()=>{

        let adminClicks = 0;

        let resetTimer;

        const secret =

        document.getElementById(

            "secretAdmin"

        );

        if(!secret){

            return;

        }

        secret.addEventListener(

            "click",

            ()=>{

                adminClicks++;

                console.log(

                    "SECRET CLICK:",

                    adminClicks

                );

                clearTimeout(

                    resetTimer

                );

                if(adminClicks >= 5){

                    adminClicks = 0;

                    window.location.href =

                    "login.html";

                }

                resetTimer =

                setTimeout(()=>{

                    adminClicks = 0;

                },3000);

            }

        );

    }

);

// ======================================
// BACK BUTTON
// ======================================

const backButton =

document.querySelector(

    ".back-btn"

);

if(backButton){

    backButton.addEventListener(

        "click",

        ()=>{

            window.location.href =

            "index.html";

        }

    );

}

// ======================================
// PAGE FADE-IN
// ======================================

window.addEventListener(

    "load",

    ()=>{

        document.body.style.opacity =

        "0";

        document.body.style.transition =

        "opacity .7s ease";

        requestAnimationFrame(()=>{

            document.body.style.opacity =

            "1";

        });

    }

);

// ======================================
// FUTURE FEATURES
// ======================================
//
// • Notifications
// • Prayer Requests
// • Daily Devotion
// • Member Profile
// • Attendance History
// • Gallery
// • Live Streaming
// • Push Notifications
//
// ======================================

console.log(

    "Cards & Navigation Ready"

);

// ======================================================
// PART 5 - SESSION MANAGEMENT & SECURITY
// ======================================================


// ======================================
// SESSION SETTINGS
// ======================================

const SESSION_DURATION =

6 * 60 * 60 * 1000; // 6 hours



// ======================================
// CHECK SESSION STATUS
// ======================================

function checkSession(){

    const activeSession =
    getMemberSession();


    if(!activeSession){

        console.log(
            "No active member session"
        );

        redirectToLogin();

        return false;

    }



    if(

        activeSession.expiresAt &&

        Date.now() >= activeSession.expiresAt

    ){

        console.log(
            "Member session expired"
        );


        logoutMember();


        return false;

    }


    return true;

}



// ======================================
// REDIRECT LOGIN
// ======================================

function redirectToLogin(){

    window.location.href =
    "btn.html";

}



// ======================================
// LOGOUT MEMBER
// ======================================

function logoutMember(){

    console.log(

        "Logging out member"

    );


    localStorage.removeItem(

        SESSION_KEY

    );


    window.location.href =

    "btn.html";

}



// ======================================
// SESSION REMAINING TIME
// ======================================

function sessionRemaining(){


    const session =

    getMemberSession();



    if(!session ||

       !session.expiresAt){

        return 0;

    }



    return Math.max(

        0,

        session.expiresAt - Date.now()

    );


}



// ======================================
// FORMAT SESSION TIME
// ======================================

function formatSessionTime(){

    const milliseconds =

    sessionRemaining();



    if(milliseconds <= 0){

        return "Expired";

    }



    const hours =

    Math.floor(

        milliseconds /

        (1000 * 60 * 60)

    );



    const minutes =

    Math.floor(

        (milliseconds %

        (1000 * 60 * 60))

        /

        (1000 * 60)

    );



    return (

        hours +

        "h " +

        minutes +

        "m"

    );


}



// ======================================
// REFRESH SESSION
// ======================================

function refreshSession(){


    const session =

    getMemberSession();



    if(!session){

        return;

    }



    session.expiresAt =

    Date.now() +

    SESSION_DURATION;



    localStorage.setItem(

        SESSION_KEY,

        JSON.stringify(session)

    );


}



// ======================================
// USER ACTIVITY TRACKING
// ======================================

let activityTimer;



function registerActivity(){


    if(!checkSession()){

        return;

    }



    clearTimeout(

        activityTimer

    );



    activityTimer =

    setTimeout(()=>{


        console.log(

            "Session active:",

            formatSessionTime()

        );


    },1000);


}



// Track normal user actions

[

"click",

"keypress",

"mousemove",

"touchstart"

]

.forEach(event=>{


    document.addEventListener(

        event,

        registerActivity

    );


});




// ======================================
// AUTO SESSION CHECK
// ======================================


// Check every minute

setInterval(()=>{


    checkSession();


},60000);



// ======================================
// LOGOUT BUTTON SUPPORT
// ======================================

const logoutButton =

document.getElementById(

    "logoutBtn"

);



if(logoutButton){


    logoutButton.onclick =

    ()=>{


        logoutMember();


    };


}



// ======================================
// EXPORT FOR OTHER PAGES
// ======================================

window.KingdomSession = {


    getMemberSession,

    checkSession,

    logoutMember,

    refreshSession,

    sessionRemaining,

    formatSessionTime


};



// ======================================
// PART 5 COMPLETE
// ======================================


console.log(

    "Session Security Ready"

);

// ======================================================
// PART 6 - FINAL CLEANUP & FUTURE READY SYSTEM
// ======================================================


// ======================================
// SESSION COMPATIBILITY BRIDGE
// Supports old "member" storage
// and new "memberSession"
// ======================================

function migrateOldSession(){


    const newSession =

    localStorage.getItem(

        "memberSession"

    );


    const oldSession =

    localStorage.getItem(

        "member"

    );



    if(!newSession && oldSession){


        console.log(

            "Migrating old member session"

        );


        try{


            const member =

            JSON.parse(oldSession);



            const updatedSession = {


                ...member,


                expiresAt:

                Date.now()

                +

                (6 *

                60 *

                60 *

                1000)


            };



            localStorage.setItem(

                "memberSession",

                JSON.stringify(

                    updatedSession

                )

            );



            localStorage.removeItem(

                "member"

            );


        }

        catch(error){


            console.error(

                "Session migration failed",

                error

            );


        }


    }


}



migrateOldSession();



// ======================================
// INTERNET CONNECTION STATUS
// ======================================

function connectionStatus(){


    if(navigator.onLine){


        console.log(

            "Internet connection available"

        );


    }

    else{


        console.log(

            "Offline mode"

        );


    }


}



window.addEventListener(

    "online",

    ()=>{


        console.log(

            "Connection restored"

        );


    }

);



window.addEventListener(

    "offline",

    ()=>{


        console.log(

            "No internet connection"

        );


    }

);



// ======================================
// LAZY FEATURE LOADER
// Future modules
// ======================================


const KingdomFeatures = {


    sermons:false,

    events:false,

    gallery:false,

    notifications:false,

    profile:false


};



window.KingdomFeatures =

KingdomFeatures;



// ======================================
// PREVENT DOUBLE CLICK ERRORS
// ======================================

document

.querySelectorAll(

"button"

)

.forEach(button=>{


    button.addEventListener(

        "dblclick",

        event=>{


            event.preventDefault();


        }


    );


});



// ======================================
// ERROR HANDLER
// ======================================

window.addEventListener(

"error",

(event)=>{


    console.error(

        "Kingdom Ways Error:",

        event.error

    );


});



// ======================================
// FINAL READY MESSAGE
// ======================================

console.log(

"%c KINGDOM WAYS CLIENT MODE READY ",

"background:#0b1f3a;color:#ffd700;font-size:16px;font-weight:bold;"

);



// ======================================================
// END CLIENT MODE
// ======================================================