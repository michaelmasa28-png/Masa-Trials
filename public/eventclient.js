/*==========================================================
 KINGDOM WAYS CHURCH
 EVENT CLIENT PORTAL JS
 MEMBER DISPLAY ONLY
==========================================================*/

//==================================
// CONFIG
//==================================

const API_URL = "";

// XSS sanitize
function escapeHtml(val) {
    return String(val == null ? "" : val).replace(/[&<>"']/g, function(c) {
        return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c];
    });
}

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

        if (!response.ok) {
            throw new Error("Unable to load events.");
        }

        const data = await response.json();

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

    const image = resolveEventImage(event);

    if (image) {

        const img = document.createElement("img");

        img.className = "event-image";

        img.src = image;

        img.alt = event.title || "Event";

        img.onerror = () => {

            const placeholder = document.createElement("div");

            placeholder.className = "event-image event-image-placeholder";

            placeholder.innerHTML =
                '<i class="fa-solid fa-calendar-days"></i>';

            img.replaceWith(placeholder);

        };

        card.appendChild(img);

    } else {

        const placeholder = document.createElement("div");

        placeholder.className = "event-image event-image-placeholder";

        placeholder.innerHTML =
            '<i class="fa-solid fa-calendar-days"></i>';

        card.appendChild(placeholder);

    }

    const content = document.createElement("div");

    content.className = "event-content";

    content.innerHTML = `

            ${event.featured ? `
                <span class="badge">
                    ⭐ Featured Event
                </span>
            ` : ""}

            <h3>${escapeHtml(event.title)}</h3>

            <p class="event-description">
                ${escapeHtml(event.description || "")}
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
                    <span>${escapeHtml(event.venue || "Main Church")}</span>
                </div>

                <div>
                    <i class="fa-solid fa-microphone"></i>
                    <span>${escapeHtml(event.speaker || "To be announced")}</span>
                </div>

            </div>

        `;

    card.appendChild(content);

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
// IMAGE URL RESOLVER
//==================================

function resolveEventImage(event) {

    const rawImage = event.banner || event.image || "";

    if (!rawImage) return "";

    return (
        rawImage.startsWith("http") ||
        rawImage.startsWith("/")
    )
        ? rawImage
        : "/" + rawImage;

}

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

//==================================
// SHARE / INVITE
//==================================

function currentPageUrl() {
    return window.location.origin + window.location.pathname;
}

function shareMessage() {
    return "Kingdom Ways Church — join us! Check out our upcoming events.";
}

function showShareToast(message) {

    let toast = document.getElementById("shareToast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "shareToast";

        toast.className = "share-toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 2500);

}

document.getElementById("shareWhatsApp")?.addEventListener("click", () => {

    const url = "https://wa.me/?text=" +
        encodeURIComponent(shareMessage() + " " + currentPageUrl());

    window.open(url, "_blank", "noopener");

});

document.getElementById("shareFacebook")?.addEventListener("click", () => {

    const url = "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(currentPageUrl());

    window.open(url, "_blank", "noopener");

});

document.getElementById("shareX")?.addEventListener("click", () => {

    const url = "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(shareMessage()) +
        "&url=" +
        encodeURIComponent(currentPageUrl());

    window.open(url, "_blank", "noopener");

});

document.getElementById("copyShareLink")?.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(currentPageUrl());

    } catch (err) {

        const input = document.createElement("input");

        input.value = currentPageUrl();

        document.body.appendChild(input);

        input.select();

        document.execCommand("copy");

        document.body.removeChild(input);

    }

    showShareToast("Share link copied!");

});