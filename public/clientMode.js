// ======================================
// KINGDOM WAYS CHURCH
// CLIENT MODE
// ======================================

const API = "http://127.0.0.1:8000";


// ======================================
// DATE
// ======================================

const today = new Date();

const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
};

console.log(
    today.toLocaleDateString("en-US", options)
);


// ======================================
// BIBLE VERSES
// ======================================

const verses = [

    '"I can do all things through Christ who strengthens me." — Philippians 4:13',

    '"The Lord is my Shepherd; I shall not want." — Psalm 23:1',

    '"Trust in the Lord with all your heart." — Proverbs 3:5',

    '"For with God nothing shall be impossible." — Luke 1:37',

    '"Be strong and courageous." — Joshua 1:9'

];


let verse = document.createElement("p");

verse.className = "verse";


const hero = document.querySelector(".hero-content");


if(hero){

    hero.appendChild(verse);

}



let index = 0;


function rotateVerse(){


    verse.style.opacity = 0;


    setTimeout(()=>{


        verse.innerHTML = verses[index];


        verse.style.opacity = 1;


        index++;


        if(index >= verses.length){

            index = 0;

        }


    },500);


}



rotateVerse();


setInterval(
    rotateVerse,
    1000
);




// ======================================
// LOAD CHURCH THEME
// ======================================

fetch(`${API}/theme`)

.then(res=>{


    if(!res.ok){

        throw new Error();

    }


    return res.json();


})


.then(data=>{


    const themeBox =
    document.getElementById("churchTheme");


    if(themeBox){

        themeBox.innerHTML =
        data.theme;

    }


})


.catch(()=>{


    const themeBox =
    document.getElementById("churchTheme");


    if(themeBox){

        themeBox.innerHTML =
        "Walking by Faith.";

    }


});




// ======================================
// LOAD CHURCH VISION
// ======================================

fetch(`${API}/vision`)

.then(res=>{


    if(!res.ok){

        throw new Error();

    }


    return res.json();


})


.then(data=>{


    const visionBox =
    document.getElementById("churchVision");


    if(visionBox){

        visionBox.innerHTML =
        data.vision;

    }


})


.catch(()=>{


    const visionBox =
    document.getElementById("churchVision");


    if(visionBox){

        visionBox.innerHTML =
        "To know Christ and make Him known.";

    }


});




// ======================================
// CARD ANIMATION
// ======================================

const cards =
document.querySelectorAll(".card");


cards.forEach((card,i)=>{


    card.style.opacity = "0";


    card.style.transform =
    "translateY(40px)";


    setTimeout(()=>{


        card.style.transition =
        ".7s";


        card.style.opacity =
        "1";


        card.style.transform =
        "translateY(0px)";


    },300 * i);


});




// ======================================
// SECRET ADMIN ENTRY
// 5 clicks opens admin login
// ======================================

window.addEventListener("load",()=>{


    let adminClicks = 0;


    const secret =
    document.getElementById("secretAdmin");



    if(secret){


        secret.addEventListener("click",()=>{


            adminClicks++;


            console.log(
                "SECRET ADMIN CLICK:",
                adminClicks
            );



            if(adminClicks >= 5){


                window.location.href =
                "login.html";


            }



            setTimeout(()=>{


                adminClicks = 0;


            },3000);



        });



    }



});



// ======================================
// BACK BUTTON
// ======================================

const back =
document.querySelector(".back-btn");

if(back){

    back.addEventListener("click",()=>{

        window.location.href = "index.html";

    });

}


// ======================================
// FUTURE FEATURES
// ======================================
//
// Live Stream API
// Notifications
// Prayer Requests
// Daily Devotion
// Member Profile
// Church Announcements
//
// ======================================

// ==========================================
// KINGDOM WAYS CLIENT MODE INTRO
// ==========================================


window.addEventListener("load",()=>{


    console.log(
        "CLIENT MODE LOADED"
    );



    const memberSession =
    localStorage.getItem("member");



    console.log(
        "MEMBER SESSION:",
        memberSession
    );



    if(memberSession){


        console.log(
            "STARTING KINGDOM WAYS INTRO"
        );


        showChurchAnimation();



    }else{


        console.log(
            "NO MEMBER SESSION"
        );


    }



});





function showChurchAnimation(){



    const overlay =
    document.createElement("div");



    overlay.style.position =
    "fixed";


    overlay.style.left =
    "0";


    overlay.style.top =
    "0";


    overlay.style.width =
    "100vw";


    overlay.style.height =
    "100vh";


    overlay.style.background =
    "radial-gradient(circle,#0d5c2f,#020805)";


    overlay.style.display =
    "flex";


    overlay.style.alignItems =
    "center";


    overlay.style.justifyContent =
    "center";


    overlay.style.zIndex =
    "999999";


    overlay.style.overflow =
    "hidden";





    const orb =
    document.createElement("div");



    orb.innerHTML =
    "✦";



    orb.style.fontSize =
    "35px";



    orb.style.color =
    "#FFD700";



    orb.style.textShadow =
    "0 0 20px gold,0 0 60px cyan,0 0 120px #00ff88";



    orb.style.transition =
    "all 2s ease";




    overlay.appendChild(orb);



    document.body.appendChild(overlay);






    // ==================================
    // SMALL ICON EXPLODES TO FULL SCREEN
    // ==================================


    setTimeout(()=>{


        orb.style.transform =
        "scale(80) rotate(1440deg)";


        orb.style.opacity =
        "0.15";



    },100);






    // ==================================
    // RETURN TO CENTER
    // ==================================


    setTimeout(()=>{


        orb.style.transform =
        "scale(1) rotate(2880deg)";


        orb.style.opacity =
        "1";



    },2200);







    // ==================================
    // SHOW CHURCH NAME
    // ==================================


    setTimeout(()=>{


        orb.style.display =
        "none";



        const title =
        document.createElement("div");



        title.innerHTML = `


        <div style="
        font-size:52px;
        font-weight:900;
        letter-spacing:7px;
        color:#FFD700;
        text-align:center;
        font-family:Arial Black,Arial;
        text-shadow:
        0 0 20px gold,
        0 0 50px #00ff88;
        ">
        KINGDOM WAYS
        </div>



        <div style="
        margin-top:15px;
        font-size:34px;
        font-weight:700;
        letter-spacing:6px;
        color:white;
        text-align:center;
        text-shadow:
        0 0 25px #00ff88;
        ">
        PENTECOSTAL CHURCH
        </div>



        <div style="
        margin-top:25px;
        font-size:18px;
        letter-spacing:10px;
        color:#8cffb7;
        text-align:center;
        ">
        WELCOME HOME
        </div>



        `;




        title.style.animation =
        "kwFade 1s ease";



        overlay.appendChild(title);



    },2500);








    // ==================================
    // CLOSE INTRO
    // ==================================


    setTimeout(()=>{


        overlay.style.opacity =
        "0";



        setTimeout(()=>{


            overlay.remove();



        },1000);



    },6000);



}







// ==========================================
// ANIMATION STYLE
// ==========================================


const style =
document.createElement("style");



style.innerHTML = `


@keyframes kwFade{


from{


opacity:0;

transform:scale(.3);


}


to{


opacity:1;

transform:scale(1);


}


}


`;



document.head.appendChild(style);
