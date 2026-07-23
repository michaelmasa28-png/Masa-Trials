// =========================================
// KINGDOM WAYS PENTECOSTAL CHURCH
// script.js
// =========================================

// Wait until the page has loaded
document.addEventListener("DOMContentLoaded", () => {

    console.log("Kingdom Ways Church Website Loaded Successfully!");

    // ======================================
    // Smooth scrolling
    // ======================================
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener("click", function(e) {
            const target = document.querySelector(this.getAttribute("href"));
            if(target){
                e.preventDefault();
                target.scrollIntoView({
                    behavior:"smooth"
                });
            }
        });
    });

    // ======================================
    // Hero fade in
    // ======================================
    const hero = document.querySelector(".hero-content");
    if(hero){
        hero.style.opacity = "0";
        hero.style.transform = "translateY(40px)";
        setTimeout(()=>{
            hero.style.transition = "1.2s";
            hero.style.opacity = "1";
            hero.style.transform = "translateY(0)";
        },300);
    }

    // ======================================
    // Button animation (FIXED SELECTOR)
    // ======================================
    const button = document.querySelector(".button button"); // Matches your index.html button
    if(button){
        button.style.transition = "transform 0.3s ease"; // Smooth out the scaling transition
        button.addEventListener("mouseenter",()=>{
            button.style.transform="scale(1.08)";
        });
        button.addEventListener("mouseleave",()=>{
            button.style.transform="scale(1)";
        });
    }

});

// =========================================
// Header shadow while scrolling
// =========================================
window.addEventListener("scroll",()=>{
    const header=document.querySelector("header");
    if(window.scrollY>40){
        header.style.boxShadow="0 8px 25px rgba(0,0,0,.35)";
    }
    else{
        header.style.boxShadow="0 4px 15px rgba(0,0,0,.20)";
    }
});

// =========================================
// Current Year
// =========================================
const year=document.getElementById("year");
if(year){
    year.textContent=new Date().getFullYear();
}

// =========================================
// Welcome Message
// =========================================
setTimeout(()=>{
    alert("Welcome to Kingdom Ways Pentecostal Church.\nMay God richly bless you!");
},1500);
