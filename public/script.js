// ======================================================
// KINGDOM WAYS PENTECOSTAL CHURCH
// script.js - Optimized v3.0
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const header = document.querySelector("header");
    const hero = document.querySelector(".hero-content");
    const button = document.querySelector(".button button");
    const cards = document.querySelectorAll(".card");
    const navLinks = document.querySelectorAll('a[href^="#"]');

    // ============================================
    // Smooth Scrolling
    // ============================================

    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            const target = document.querySelector(this.getAttribute("href"));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    // ============================================
    // Hero Entrance Animation (fast)
    // ============================================

    if (hero) {
        hero.animate([
            { opacity: 0, transform: "translateY(30px)" },
            { opacity: 1, transform: "translateY(0)" }
        ], {
            duration: 600,
            easing: "ease-out",
            fill: "forwards"
        });
    }

    // ============================================
    // Button Hover Effects (CSS handles most now)
    // ============================================

    if (button) {
        button.addEventListener("mouseenter", () => {
            button.style.transform = "translateY(-5px) scale(1.05)";
        });
        button.addEventListener("mouseleave", () => {
            button.style.transform = "";
        });
    }

    // ============================================
    // Scroll Reveal (fast, using will-change only during animation)
    // ============================================

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.10 });

    cards.forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(card);
    });

    // ============================================
    // Header Scroll Effect (throttled with rAF)
    // ============================================

    let ticking = false;

    function updateHeader() {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    // ============================================
    // Active Navigation Highlight
    // ============================================

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // ============================================
    // Image Fade-In
    // ============================================

    const images = document.querySelectorAll("img");
    images.forEach(img => {
        if (img.complete) return;
        img.style.opacity = "0";
        img.style.transition = "opacity 0.3s ease";
        img.addEventListener("load", () => {
            img.style.opacity = "1";
        });
    });

});

// ============================================
// Window Loaded
// ============================================

window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});
