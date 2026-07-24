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