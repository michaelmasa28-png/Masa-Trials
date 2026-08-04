// ======================================================
// KINGDOM WAYS PENTECOSTAL CHURCH
// script.js
// Homepage Controller
// Version 2.0
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("✅ Kingdom Ways Church Website Loaded");

    // ============================================
    // Cache DOM Elements
    // ============================================

    const header = document.querySelector("header");
    const hero = document.querySelector(".hero-content");
    const button = document.querySelector(".button button");
    const cards = document.querySelectorAll(".card");
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const year = document.getElementById("year");

    // ============================================
    // Current Year
    // ============================================

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // ============================================
    // Smooth Scrolling
    // ============================================

    navLinks.forEach(link => {

        link.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth",
                block: "start"

            });

        });

    });

    // ============================================
    // Hero Entrance Animation
    // ============================================

    if (hero) {

        hero.animate([

            {
                opacity: 0,
                transform: "translateY(60px)"
            },

            {
                opacity: 1,
                transform: "translateY(0)"
            }

        ], {

            duration: 1200,

            easing: "ease-out",

            fill: "forwards"

        });

    }

    // ============================================
    // Professional Button Effect
    // ============================================

    if (button) {

        button.addEventListener("mouseenter", () => {

            button.style.transform = "translateY(-5px) scale(1.05)";

        });

        button.addEventListener("mouseleave", () => {

            button.style.transform = "";

        });

        button.addEventListener("mousedown", () => {

            button.style.transform = "scale(.97)";

        });

        button.addEventListener("mouseup", () => {

            button.style.transform = "translateY(-5px) scale(1.05)";

        });

    }

    // ============================================
    // Scroll Reveal Animation
    // ============================================

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";

                entry.target.style.transform = "translateY(0)";

            }

        });

    }, {

        threshold: .20

    });

    cards.forEach(card => {

        card.style.opacity = "0";

        card.style.transform = "translateY(40px)";

        card.style.transition = ".8s ease";

        observer.observe(card);

    });

    // ============================================
    // Header Scroll Effect
    // ============================================

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 50) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }

    updateHeader();

    window.addEventListener("scroll", updateHeader);

    // ============================================
    // Active Navigation Highlight
    // ============================================

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            navLinks.forEach(item => {

                item.classList.remove("active");

            });

            link.classList.add("active");

        });

    });

    // ============================================
    // Image Fade-In
    // ============================================

    const images = document.querySelectorAll("img");

    images.forEach(img => {

        img.addEventListener("load", () => {

            img.style.opacity = "1";

        });

    });

    // ============================================
    // Console Signature
    // ============================================

    console.log(
        "%cKingdom Ways Pentecostal Church",
        "color:#D4AF37;font-size:18px;font-weight:bold;"
    );

    console.log(
        "%cFrontend Loaded Successfully",
        "color:#103B73;font-size:13px;"
    );

});

// ======================================================
// Window Finished Loading
// ======================================================

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

});


        
// ======================================================
// PREMIUM FEEDBACK INTRO
// Paste at the END of script.js
// ======================================================

window.addEventListener("load", () => {

    const style = document.createElement("style");

    style.innerHTML = `

    #kwIntro{
        position:fixed;
        inset:0;
        z-index:999999999;
        display:flex;
        justify-content:center;
        align-items:center;
        overflow:hidden;
        perspective:2000px;

        background:linear-gradient(
        -45deg,
        #ff6b6b,
        #ffb347,
        #6a11cb,
        #2575fc,
        #00c9ff,
        #43e97b);

        background-size:600% 600%;
        animation:bgMove 12s ease infinite;
    }

    #kwFlash{
        position:absolute;
        inset:0;
        background:white;
        animation:flash .5s ease forwards;
    }

    #kwCard{

        position:relative;

        padding:45px 70px;

        border-radius:30px;

        background:rgba(255,255,255,.18);

        border:2px solid rgba(255,255,255,.35);

        backdrop-filter:blur(18px);

        -webkit-backdrop-filter:blur(18px);

        box-shadow:
        0 25px 80px rgba(0,0,0,.45),
        0 0 60px rgba(255,255,255,.2);

        text-align:center;

        color:white;

        font-family:"Segoe UI",sans-serif;

        transform-style:preserve-3d;

        opacity:0;
    }

    #kwCard h1{

        margin:0;

        font-size:clamp(34px,5vw,68px);

        letter-spacing:2px;

        text-transform:uppercase;

        text-shadow:
        0 5px 15px rgba(0,0,0,.4);

    }

    #kwCard p{

        margin-top:15px;

        color:#ffe66d;

        font-size:20px;

        letter-spacing:5px;

        text-transform:uppercase;

    }

    .particle{

        position:absolute;

        width:10px;

        height:10px;

        border-radius:50%;

        background:white;

        opacity:.8;

        animation:float linear infinite;

    }

    @keyframes flash{

        0%{opacity:1;}

        100%{opacity:0;}

    }

    @keyframes bgMove{

        0%{background-position:0% 50%;}

        50%{background-position:100% 50%;}

        100%{background-position:0% 50%;}

    }

    @keyframes float{

        from{

            transform:translateY(100vh) scale(.2);

        }

        to{

            transform:translateY(-120vh) scale(1.5);

        }

    }

    @keyframes intro{

        0%{

            transform:
            translateZ(-1800px)
            rotateX(90deg)
            rotateY(-90deg)
            scale(.05);

            opacity:0;

        }

        20%{

            transform:
            translateZ(200px)
            rotateX(0)
            rotateY(0)
            scale(1.15);

            opacity:1;

        }

        35%{

            transform:scale(1);

            opacity:1;

        }

        75%{

            transform:scale(1);

            opacity:1;

        }

        83%{

            transform:scale(1);

            opacity:1;

        }

        100%{

            transform:
            translateZ(-1800px)
            rotateY(1080deg)
            rotateX(720deg)
            scale(.05);

            opacity:0;

        }

    }

    `;

    document.head.appendChild(style);

    const intro=document.createElement("div");

    intro.id="kwIntro";

    intro.innerHTML=`
        <div id="kwFlash"></div>

        <div id="kwCard">

            <h1>💬 Share With Us</h1>

            <p>Your Feedback</p>

        </div>
    `;

    document.body.appendChild(intro);

    // Floating particles

    for(let i=0;i<80;i++){

        const p=document.createElement("div");

        p.className="particle";

        p.style.left=Math.random()*100+"vw";

        p.style.animationDuration=(4+Math.random()*6)+"s";

        p.style.animationDelay=(Math.random()*3)+"s";

        p.style.opacity=Math.random();

        p.style.width=(4+Math.random()*10)+"px";

        p.style.height=p.style.width;

        intro.appendChild(p);

    }

    const card=document.getElementById("kwCard");

    card.style.animation="intro 6s cubic-bezier(.22,1,.36,1) forwards";

    setTimeout(()=>{

        intro.style.transition="opacity .8s ease";

        intro.style.opacity="0";

        setTimeout(()=>intro.remove(),800);

    },6000);

});
