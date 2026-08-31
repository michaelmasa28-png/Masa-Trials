/*==========================================================
 KINGDOM WAYS CHURCH
 EVENT CLIENT PORTAL JS
 MEMBER DISPLAY ONLY
==========================================================*/

console.log("eventclient.js loaded");

//==================================
// CONFIG
//==================================

const API_URL = "";

//==================================
// ELEMENTS
//==================================

const eventsContainer = document.getElementById("eventsContainer");
const featuredZone = document.getElementById("featuredZone");
const featuredContainer = document.getElementById("featuredContainer");
const searchInput = document.getElementById("searchEvent");

//==================================
// DATA
//==================================

let allEvents = [];

//==================================
// LOAD EVENTS
//==================================

async function loadEvents() {

    eventsContainer.innerHTML = `
        <div class="loading">
            Loading church events...
        </div>
    `;

    try {

        const response = await fetch(`${API_URL}/api/events/`);

        console.log("Status:", response.status);

        if (!response.ok) {
            throw new Error("Unable to load events.");
        }

        const data = await response.json();

        console.log("API Response:", data);

        allEvents = data.events || [];

        displayFeatured(allEvents);
        displayEvents(allEvents);

    } catch (error) {

        console.error(error);

        eventsContainer.innerHTML = `
            <div class="loading">
                Unable to load church events.
            </div>
        `;
    }

}

//==================================
// DISPLAY EVENTS
//==================================

function displayEvents(events) {

    eventsContainer.innerHTML = "";

    if (!events.length) {

        eventsContainer.innerHTML = `
            <div class="loading">
                No upcoming events available.
            </div>
        `;

        return;
    }

    events.forEach(event => {

        eventsContainer.appendChild(
            createEventCard(event)
        );

    });

}

//==================================
// CREATE CARD
//==================================

function createEventCard(event) {

    const card = document.createElement("div");

    card.className = "event-card";

    const rawImage = event.banner || event.image || "";
    const image = rawImage &&
                  (rawImage.startsWith("http") || rawImage.startsWith("/"))
        ? rawImage
        : "/" + rawImage;

    card.innerHTML = `

        <img
            class="event-image"
            src="${image}"
            onerror="this.onerror=null;this.src='images/default-event.jpg'"
        >

        <div class="event-content">

            ${event.featured ? `
                <span class="badge">
                    ⭐ Featured Event
                </span>
            ` : ""}

            <h3>${event.title}</h3>

            <p class="event-description">
                ${event.description || ""}
            </p>

            <div class="event-info">

                <div>
                    <i class="fa-solid fa-calendar-days"></i>
                    <span>${formatDate(event.start_date)}</span>
                </div>

                <div>
                    <i class="fa-solid fa-clock"></i>
                    <span>${formatTime(event.start_time)}</span>
                </div>

                <div>
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${event.venue || "Main Church"}</span>
                </div>

                <div>
                    <i class="fa-solid fa-microphone"></i>
                    <span>${event.speaker || "To be announced"}</span>
                </div>

            </div>

        </div>

    `;

    return card;

}

//==================================
// FEATURED EVENTS
//==================================

function displayFeatured(events) {

    const featured = events.filter(event => event.featured);

    if (!featured.length) {

        featuredZone.style.display = "none";
        return;

    }

    featuredZone.style.display = "block";

    featuredContainer.innerHTML = "";

    featured.forEach(event => {

        featuredContainer.appendChild(
            createEventCard(event)
        );

    });

}

//==================================
// SEARCH
//==================================

searchInput.addEventListener("input", () => {

    const value = searchInput.value
        .toLowerCase()
        .trim();

    if (!value) {

        displayEvents(allEvents);
        return;

    }

    const filtered = allEvents.filter(event => {

        return (

            (event.title || "")
                .toLowerCase()
                .includes(value)

            ||

            (event.description || "")
                .toLowerCase()
                .includes(value)

            ||

            (event.venue || "")
                .toLowerCase()
                .includes(value)

            ||

            (event.speaker || "")
                .toLowerCase()
                .includes(value)

        );

    });

    displayEvents(filtered);

});

//==================================
// DATE FORMAT
//==================================

function formatDate(date) {

    if (!date) return "Date not set";

    return new Date(date).toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}

//==================================
// TIME FORMAT
//==================================

function formatTime(time) {

    if (!time) return "Time not set";

    try {

        return time.substring(0,5);

    } catch {

        return time;

    }

}

//==================================
// START
//==================================

document.addEventListener("DOMContentLoaded", () => {

    loadEvents();

});