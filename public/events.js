// =====================================
// Kingdom Ways Church CMS
// Events Admin JavaScript
// PART 1
// =====================================

// ===============================
// ELEMENTS
// ===============================

const eventForm = document.getElementById("eventForm");
const eventId = document.getElementById("eventId");

const titleInput = document.getElementById("eventTitle");
const dateInput = document.getElementById("eventDate");
const timeInput = document.getElementById("eventTime");
const locationInput = document.getElementById("eventLocation");
const speakerInput = document.getElementById("eventSpeaker");
const guestsInput = document.getElementById("eventGuests");
const featuredInput = document.getElementById("featuredEvent");
const descriptionInput = document.getElementById("eventDescription");

const imageInput = document.getElementById("eventImage");

const saveButton = document.getElementById("saveEventBtn");
const cancelButton = document.getElementById("cancelBtn");

const uploadImageBtn = document.getElementById("uploadImageBtn");

const galleryModal = document.getElementById("galleryModal");
const galleryGrid = document.getElementById("galleryGrid");
const closeGallery = document.getElementById("closeGallery");

const eventsContainer = document.getElementById("eventsContainer");

const searchInput = document.getElementById("searchEvent");

const totalEvents = document.getElementById("totalEvents");
const totalGuests = document.getElementById("totalGuests");
const totalLocations = document.getElementById("totalLocations");
const featuredEvents = document.getElementById("featuredEvents");

const previewImage = document.getElementById("previewImage");
const previewTitle = document.getElementById("previewTitle");
const previewDate = document.getElementById("previewDate");
const previewTime = document.getElementById("previewTime");
const previewVenue = document.getElementById("previewVenue");
const previewSpeaker = document.getElementById("previewSpeaker");
const previewDescription = document.getElementById("previewDescription");
const previewStatus = document.getElementById("previewStatus");

const toast = document.getElementById("toast");


// ===============================
// GLOBAL VARIABLES
// ===============================

let editingEventId = null;

let selectedGalleryImage = "";

let uploadedImage = "";

let events = [];


// ===============================
// SHOW TOAST
// ===============================

function showToast(message, color = "#2563eb") {

    if (!toast) return;

    toast.textContent = message;

    toast.style.background = color;

    toast.style.display = "block";

    toast.style.opacity = "1";

    toast.style.transform = "translateY(0)";

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform = "translateY(-20px)";

        setTimeout(() => {

            toast.style.display = "none";

        }, 300);

    }, 2500);

}


// ===============================
// IMAGE UPLOAD
// ===============================

if (uploadImageBtn && imageInput) {

    uploadImageBtn.addEventListener("click", () => {

        imageInput.click();

    });

}


if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        uploadedImage = file;

        const reader = new FileReader();

        reader.onload = function (e) {

            if (previewImage) {

                previewImage.src = e.target.result;

            }

        };

        reader.readAsDataURL(file);

    });

}


// ===============================
// GALLERY MODAL
// ===============================

if (closeGallery) {

    closeGallery.addEventListener("click", () => {

        galleryModal.style.display = "none";

    });

}


window.addEventListener("click", function (e) {

    if (e.target === galleryModal) {

        galleryModal.style.display = "none";

    }

});


// ===============================
// LIVE PREVIEW
// ===============================

function updatePreview() {

    if (previewTitle) {

        previewTitle.textContent =
            titleInput.value.trim() ||
            "Sunday Worship Service";

    }

    if (previewDate) {

        previewDate.textContent =
            dateInput.value ||
            "Select Date";

    }

    if (previewTime) {

        previewTime.textContent =
            timeInput.value ||
            "Select Time";

    }

    if (previewVenue) {

        previewVenue.textContent =
            locationInput.value.trim() ||
            "Venue";

    }

    if (previewSpeaker) {

        previewSpeaker.textContent =
            speakerInput.value.trim() ||
            "To be announced";

    }

    if (previewDescription) {

        previewDescription.textContent =
            descriptionInput.value.trim() ||
            "Your event description will appear here while typing.";

    }

    if (previewStatus) {

        if (featuredInput.checked) {

            previewStatus.textContent = "⭐ Featured Event";

        } else {

            previewStatus.textContent = "Upcoming Event";

        }

    }

}

// ===============================
// LOAD GALLERY IMAGES
// ===============================

async function loadGallery() {

    if (!galleryGrid) return;

    galleryGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading gallery...</p>
        </div>
    `;

    try {

        const response = await fetch("/api/gallery/");

        const images = await response.json();

        galleryGrid.innerHTML = "";

        if (!images.length) {

            galleryGrid.innerHTML = `
                <div class="loading">
                    <i class="fas fa-image"></i>
                    <p>No gallery images found.</p>
                </div>
            `;

            return;

        }

        images.forEach(image => {

            const card = document.createElement("div");

            card.className = "gallery-item";

            card.innerHTML = `

                <img
                    src="${image.image}"
                    alt="${image.title}"
                    style="
                        width:100%;
                        height:170px;
                        object-fit:cover;
                        border-radius:12px;
                        cursor:pointer;
                        transition:.3s;
                    ">

            `;

            card.onclick = () => {

                selectedGalleryImage = image.image;

                uploadedImage = "";

                if (previewImage) {

                    previewImage.src = image.image;

                }

                galleryModal.style.display = "none";

                showToast("Gallery image selected");

            };

            galleryGrid.appendChild(card);

        });

    }

    catch (error) {

        console.error(error);

        galleryGrid.innerHTML = `
            <div class="loading">
                Failed to load gallery.
            </div>
        `;

    }

}



// ===============================
// OPEN GALLERY
// ===============================

if (previewImage) {

    previewImage.style.cursor = "pointer";

    previewImage.title = "Click to choose from gallery";

    previewImage.addEventListener("click", () => {

        galleryModal.style.display = "flex";

        loadGallery();

    });

}



// ===============================
// LOAD EVENTS
// ===============================

async function loadEvents() {

    try {

        const response = await fetch("/api/events");

        events = await response.json();

        displayEvents(events);

        updateDashboard(events);

    }

    catch (error) {

        console.error("Failed to load events", error);

        showToast("Unable to load events", "#dc2626");

    }

}



// ===============================
// DASHBOARD COUNTERS
// ===============================

function updateDashboard(eventList) {

    if (totalEvents) {

        totalEvents.textContent = eventList.length;

    }


    if (totalGuests) {

        let guests = 0;

        eventList.forEach(event => {

            guests += Number(event.registered_guests || 0);

        });

        totalGuests.textContent = guests;

    }


    if (totalLocations) {

        const venues = [

            ...new Set(

                eventList.map(event => event.venue)

            )

        ];

        totalLocations.textContent = venues.length;

    }


    if (featuredEvents) {

        const totalFeatured = eventList.filter(event =>

            Number(event.featured_event) === 1

        ).length;

        featuredEvents.textContent = totalFeatured;

    }

}



// ===============================
// LIVE PREVIEW LISTENERS
// ===============================

titleInput.addEventListener("input", updatePreview);

dateInput.addEventListener("input", updatePreview);

timeInput.addEventListener("input", updatePreview);

locationInput.addEventListener("input", updatePreview);

speakerInput.addEventListener("input", updatePreview);

descriptionInput.addEventListener("input", updatePreview);

guestsInput.addEventListener("input", updatePreview);

featuredInput.addEventListener("change", updatePreview);
// ===============================
// SAVE / UPDATE EVENT
// ===============================

if (eventForm) {

    eventForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const formData = new FormData();

        formData.append("title", titleInput.value.trim());

        formData.append("event_date", dateInput.value);

        formData.append("event_time", timeInput.value);

        formData.append("venue", locationInput.value.trim());

        formData.append(
            "speaker",
            speakerInput.value.trim() || "To be announced"
        );

        formData.append(
            "description",
            descriptionInput.value.trim()
        );

        formData.append(
            "registered_guests",
            guestsInput.value || 0
        );

        formData.append(
            "featured_event",
            featuredInput.checked ? 1 : 0
        );

        formData.append(
            "status",
            featuredInput.checked
                ? "Featured"
                : "Upcoming"
        );

        if (uploadedImage instanceof File) {

            formData.append(
                "image",
                uploadedImage
            );

        }

        else if (selectedGalleryImage !== "") {

            formData.append(
                "galleryImage",
                selectedGalleryImage
            );

        }

        try {

            let response;

            // ===========================
            // CREATE
            // ===========================

            if (!editingEventId) {

                response = await fetch("/api/events", {

                    method: "POST",

                    body: formData

                });

            }

            // ===========================
            // UPDATE
            // ===========================

            else {

                formData.append(
                    "keepImage",
                    previewImage.src
                );

                response = await fetch(

                    `/api/events/${editingEventId}`,

                    {

                        method: "PUT",

                        body: formData

                    }

                );

            }

            const result = await response.json();

            if (!response.ok) {

                showToast(

                    result.message ||
                    "Failed to save event.",

                    "#dc2626"

                );

                return;

            }

            showToast(

                editingEventId
                    ? "Event updated successfully."
                    : "Event created successfully.",

                "#16a34a"

            );

            editingEventId = null;

            selectedGalleryImage = "";

            uploadedImage = "";

            eventForm.reset();

            updatePreview();

            previewImage.src = "images/default-event.jpg";

            loadEvents();

        }

        catch (error) {

            console.error(error);

            showToast(

                "Server error.",

                "#dc2626"

            );

        }

    });

}



// ===============================
// CANCEL / RESET FORM
// ===============================

if (cancelButton) {

    cancelButton.addEventListener("click", function () {

        editingEventId = null;

        selectedGalleryImage = "";

        uploadedImage = "";

        eventForm.reset();

        previewImage.src = "images/default-event.jpg";

        updatePreview();

        showToast(

            "Form cleared.",

            "#64748b"

        );

    });

}

// ===============================
// DISPLAY EVENTS
// ===============================

function displayEvents(eventList) {

    if (!eventsContainer) return;

    eventsContainer.innerHTML = "";

    if (eventList.length === 0) {

        eventsContainer.innerHTML = `

            <div class="empty-events">

                <i class="fas fa-calendar-times"></i>

                <h3>No Events Found</h3>

                <p>Create your first church event.</p>

            </div>

        `;

        return;

    }

    eventList.forEach(event => {

        const card = document.createElement("div");

        card.className = "event-card";

        card.dataset.id = event.id;

        card.innerHTML = `

            <div class="event-image">

                <img
                    src="${event.image || "images/default-event.jpg"}"
                    alt="${event.title}">

                ${Number(event.featured_event) === 1 ?

                `<span class="featured-badge">
                    ⭐ Featured
                </span>`

                :

                ``}

            </div>

            <div class="event-content">

                <h3>${event.title}</h3>

                <p>

                    ${event.description}

                </p>

                <div class="event-meta">

                    <span>

                        <i class="fas fa-calendar"></i>

                        ${event.event_date}

                    </span>

                    <span>

                        <i class="fas fa-clock"></i>

                        ${event.event_time}

                    </span>

                    <span>

                        <i class="fas fa-location-dot"></i>

                        ${event.venue}

                    </span>

                    <span>

                        <i class="fas fa-microphone"></i>

                        ${event.speaker}

                    </span>

                    <span>

                        <i class="fas fa-users"></i>

                        ${event.registered_guests} Guests

                    </span>

                </div>

                <div class="event-actions">

                    <button

                        class="editBtn"

                        onclick="editEvent(${event.id})">

                        <i class="fas fa-pen"></i>

                        Edit

                    </button>

                    <button

                        class="deleteBtn"

                        onclick="deleteEvent(${event.id})">

                        <i class="fas fa-trash"></i>

                        Delete

                    </button>

                </div>

            </div>

        `;

        eventsContainer.appendChild(card);

    });

}



// ===============================
// EDIT EVENT
// ===============================

async function editEvent(id) {

    try {

        const response = await fetch(

            `/api/events/${id}`

        );

        const event = await response.json();

        editingEventId = event.id;

        eventId.value = event.id;

        titleInput.value = event.title;

        dateInput.value = event.event_date;

        timeInput.value = event.event_time;

        locationInput.value = event.venue;

        speakerInput.value = event.speaker;

        guestsInput.value =

            event.registered_guests;

        featuredInput.checked =

            Number(event.featured_event) === 1;

        descriptionInput.value =

            event.description;

        if (event.image) {

            previewImage.src = event.image;

            selectedGalleryImage = event.image;

        }

        updatePreview();

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

        showToast(

            "Editing event..."

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Unable to load event.",

            "#dc2626"

        );

    }

}

// ===============================
// DELETE EVENT
// ===============================

async function deleteEvent(id) {

    const confirmed = confirm(

        "Are you sure you want to delete this event?"

    );

    if (!confirmed) return;

    try {

        const response = await fetch(

            `/api/events/${id}`,

            {

                method: "DELETE"

            }

        );

        const result = await response.json();

        if (!response.ok) {

            showToast(

                result.message ||

                "Failed to delete event.",

                "#dc2626"

            );

            return;

        }

        showToast(

            "Event deleted successfully.",

            "#16a34a"

        );

        loadEvents();

    }

    catch (error) {

        console.error(error);

        showToast(

            "Server error.",

            "#dc2626"

        );

    }

}



// ===============================
// SEARCH EVENTS
// ===============================

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const keyword =

            this.value

            .trim()

            .toLowerCase();

        if (keyword === "") {

            displayEvents(events);

            return;

        }

        const filtered = events.filter(event => {

            return (

                event.title

                    .toLowerCase()

                    .includes(keyword)

                ||

                event.venue

                    .toLowerCase()

                    .includes(keyword)

                ||

                event.speaker

                    .toLowerCase()

                    .includes(keyword)

                ||

                event.description

                    .toLowerCase()

                    .includes(keyword)

            );

        });

        displayEvents(filtered);

    });

}



// ===============================
// REFRESH EVENTS
// ===============================

async function refreshEvents() {

    await loadEvents();

    updatePreview();

}



// ===============================
// AUTO REFRESH
// ===============================

setInterval(() => {

    loadEvents();

}, 30000);



// ===============================
// RESET PREVIEW
// ===============================

function resetPreview() {

    previewTitle.textContent =

        "Sunday Worship Service";

    previewDate.textContent =

        "Select Date";

    previewTime.textContent =

        "Select Time";

    previewVenue.textContent =

        "Venue";

    previewSpeaker.textContent =

        "To be announced";

    previewDescription.textContent =

        "Your event description will appear here while typing.";

    previewStatus.textContent =

        "Upcoming Event";

    previewImage.src =

        "images/default-event.jpg";

}

// =====================================
// PART 6
// PAGE STARTUP & EVENT BANNER
// =====================================


// ===============================
// DEFAULT BANNER
// ===============================

const DEFAULT_EVENT_IMAGE =

"images/default-event.jpg";



// ===============================
// GET EVENT IMAGE
// ===============================

function getEventImage(event){

    if(

        event.image &&

        event.image.trim() !== ""

    ){

        return event.image;

    }

    return DEFAULT_EVENT_IMAGE;

}



// ===============================
// EVENT BANNER HTML
// ===============================

function createEventBanner(event){

    return `

    <div style="

        position:relative;

        height:230px;

        overflow:hidden;

        border-radius:18px 18px 0 0;

        background:#111827;

    ">

        <img

            src="${getEventImage(event)}"

            alt="${event.title}"

            style="

                width:100%;

                height:100%;

                object-fit:cover;

                transition:.5s;

            ">

        <div style="

            position:absolute;

            inset:0;

            background:

            linear-gradient(

            rgba(0,0,0,.15),

            rgba(0,0,0,.75)

            );

        ">

        </div>

        ${Number(event.featured_event)===1?

        `

        <div style="

            position:absolute;

            top:18px;

            right:18px;

            background:#f59e0b;

            color:white;

            padding:8px 16px;

            border-radius:50px;

            font-size:13px;

            font-weight:bold;

            box-shadow:0 10px 20px rgba(0,0,0,.25);

        ">

            ⭐ FEATURED EVENT

        </div>

        `

        :""}

        <div style="

            position:absolute;

            left:25px;

            bottom:20px;

            color:white;

        ">

            <h2 style="

                margin:0;

                font-size:28px;

                font-weight:800;

                text-shadow:0 3px 12px rgba(0,0,0,.45);

            ">

                ${event.title}

            </h2>

            <div style="

                margin-top:8px;

                display:flex;

                gap:18px;

                flex-wrap:wrap;

                font-size:14px;

            ">

                <span>

                    <i class="fas fa-calendar"></i>

                    ${event.event_date}

                </span>

                <span>

                    <i class="fas fa-clock"></i>

                    ${event.event_time}

                </span>

            </div>

        </div>

    </div>

    `;

}



// ===============================
// PAGE STARTUP
// ===============================

document.addEventListener(

"DOMContentLoaded",

async()=>{

    updatePreview();

    await loadEvents();

});



// ===============================
// NEW EVENT BUTTON
// ===============================

const newEventBtn =

document.getElementById(

"newEventBtn"

);

if(newEventBtn){

    newEventBtn.onclick=()=>{

        editingEventId=null;

        eventForm.reset();

        uploadedImage="";

        selectedGalleryImage="";

        previewImage.src=

        DEFAULT_EVENT_IMAGE;

        resetPreview();

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    };

}


// =====================================
// PART 7
// MODERN EVENT CARDS
// =====================================

function displayEvents(eventList) {

    if (!eventsContainer) return;

    eventsContainer.innerHTML = "";

    if (eventList.length === 0) {

        eventsContainer.innerHTML = `

        <div style="
        text-align:center;
        padding:80px 30px;
        color:#64748b;
        ">

            <i class="fas fa-calendar-times"
            style="
            font-size:70px;
            color:#cbd5e1;
            margin-bottom:20px;
            display:block;
            "></i>

            <h2>No Events Yet</h2>

            <p>Create your first church event.</p>

        </div>

        `;

        return;

    }

    eventList.forEach(event => {

        const image = getEventImage(event);

        const card = document.createElement("div");

        card.style = `
        background:#fff;
        border-radius:22px;
        overflow:hidden;
        margin-bottom:35px;
        box-shadow:0 15px 45px rgba(15,23,42,.08);
        transition:.35s;
        border:1px solid #eef2f7;
        `;

        card.onmouseenter = () => {

            card.style.transform = "translateY(-8px)";

            card.style.boxShadow =
            "0 25px 55px rgba(37,99,235,.18)";

        };

        card.onmouseleave = () => {

            card.style.transform = "";

            card.style.boxShadow =
            "0 15px 45px rgba(15,23,42,.08)";

        };

        card.innerHTML = `

        ${createEventBanner(event)}

        <div style="padding:28px;">

            <div style="
            display:flex;
            flex-wrap:wrap;
            gap:14px;
            margin-bottom:18px;
            ">

                <span style="
                background:#eff6ff;
                color:#2563eb;
                padding:10px 15px;
                border-radius:50px;
                font-weight:600;
                ">

                    <i class="fas fa-location-dot"></i>

                    ${event.venue}

                </span>

                <span style="
                background:#ecfdf5;
                color:#059669;
                padding:10px 15px;
                border-radius:50px;
                font-weight:600;
                ">

                    <i class="fas fa-user"></i>

                    ${event.speaker}

                </span>

                <span style="
                background:#fff7ed;
                color:#ea580c;
                padding:10px 15px;
                border-radius:50px;
                font-weight:600;
                ">

                    <i class="fas fa-users"></i>

                    ${event.registered_guests} Guests

                </span>

            </div>

            <p style="
            line-height:1.8;
            color:#475569;
            font-size:15px;
            margin-bottom:28px;
            ">

                ${event.description}

            </p>

            <div style="
            display:flex;
            justify-content:flex-end;
            gap:15px;
            flex-wrap:wrap;
            ">

                <button

                onclick="editEvent(${event.id})"

                style="
                border:none;
                background:#2563eb;
                color:white;
                padding:12px 22px;
                border-radius:12px;
                cursor:pointer;
                font-weight:bold;
                transition:.3s;
                ">

                    <i class="fas fa-pen"></i>

                    Edit

                </button>

                <button

                onclick="deleteEvent(${event.id})"

                style="
                border:none;
                background:#dc2626;
                color:white;
                padding:12px 22px;
                border-radius:12px;
                cursor:pointer;
                font-weight:bold;
                transition:.3s;
                ">

                    <i class="fas fa-trash"></i>

                    Delete

                </button>

            </div>

        </div>

        `;

        eventsContainer.appendChild(card);

    });

}

// =====================================
// PART 8
// EDIT MODE, IMAGE HANDLING & UTILITIES
// =====================================

// ===============================
// ENTER EDIT MODE
// ===============================

function enterEditMode(event) {

    editingEventId = event.id;

    eventId.value = event.id;

    titleInput.value = event.title;

    dateInput.value = event.event_date;

    timeInput.value = event.event_time;

    locationInput.value = event.venue;

    speakerInput.value = event.speaker || "";

    guestsInput.value = event.registered_guests || 0;

    featuredInput.checked =
        Number(event.featured_event) === 1;

    descriptionInput.value =
        event.description;

    selectedGalleryImage = event.image || "";

    uploadedImage = "";

    previewImage.src =
        getEventImage(event);

    updatePreview();

    saveButton.innerHTML = `

        <i class="fas fa-pen"></i>

        Update Event

    `;

    saveButton.style.background =
        "linear-gradient(135deg,#f59e0b,#ea580c)";

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}



// ===============================
// EXIT EDIT MODE
// ===============================

function exitEditMode(){

    editingEventId = null;

    eventId.value = "";

    selectedGalleryImage = "";

    uploadedImage = "";

    eventForm.reset();

    resetPreview();

    previewImage.src =
        DEFAULT_EVENT_IMAGE;

    saveButton.innerHTML = `

        <i class="fas fa-floppy-disk"></i>

        Save Event

    `;

    saveButton.style.background =
        "";

}



// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString){

    if(!dateString) return "";

    const date =
        new Date(dateString);

    return date.toLocaleDateString(

        "en-GB",

        {

            weekday:"short",

            day:"numeric",

            month:"long",

            year:"numeric"

        }

    );

}



// ===============================
// FORMAT TIME
// ===============================

function formatTime(timeString){

    if(!timeString) return "";

    const date =
        new Date(

            `2000-01-01 ${timeString}`

        );

    return date.toLocaleTimeString(

        [],

        {

            hour:"numeric",

            minute:"2-digit"

        }

    );

}



// ===============================
// EVENT STATUS
// ===============================

function getStatus(event){

    const today =

        new Date();

    const eventDate =

        new Date(event.event_date);

    if(eventDate < today){

        return "Completed";

    }

    if(Number(event.featured_event)===1){

        return "Featured";

    }

    return "Upcoming";

}



// ===============================
// STATUS COLOUR
// ===============================

function getStatusColor(status){

    switch(status){

        case "Featured":

            return "#f59e0b";

        case "Completed":

            return "#64748b";

        default:

            return "#2563eb";

    }

}



// ===============================
// TOTAL GUESTS
// ===============================

function calculateGuests(){

    let total = 0;

    events.forEach(event=>{

        total += Number(

            event.registered_guests || 0

        );

    });

    return total;

}



// ===============================
// TOTAL LOCATIONS
// ===============================

function calculateLocations(){

    return new Set(

        events.map(

            event=>event.venue

        )

    ).size;

}



// ===============================
// TOTAL FEATURED
// ===============================

function calculateFeatured(){

    return events.filter(

        event=>

        Number(event.featured_event)===1

    ).length;

}

// =====================================
// PART 9
// DATABASE STATISTICS
// =====================================


// ===============================
// LOAD EVENT STATISTICS
// ===============================

async function loadEventStatistics() {

    try {

        const response = await fetch("/api/events/stats");

        const stats = await response.json();

        if (!response.ok) {

            throw new Error(stats.message);

        }

        if (totalEvents) {

            totalEvents.textContent =
                stats.totalEvents;

        }

        if (totalGuests) {

            totalGuests.textContent =
                stats.registeredGuests;

        }

        if (totalLocations) {

            totalLocations.textContent =
                stats.totalLocations;

        }

        if (featuredEvents) {

            featuredEvents.textContent =
                stats.featuredEvents;

        }

    }

    catch (error) {

        console.error(error);

        showToast(

            "Unable to load dashboard statistics.",

            "#dc2626"

        );

    }

}



// ===============================
// REFRESH EVERYTHING
// ===============================

async function refreshEventsPage() {

    await loadEvents();

    await loadEventStatistics();

}



// ===============================
// AFTER SAVE
// ===============================

async function refreshAfterSave() {

    await refreshEventsPage();

    updatePreview();

}



// ===============================
// AFTER DELETE
// ===============================

async function refreshAfterDelete() {

    await refreshEventsPage();

}



// ===============================
// AFTER UPDATE
// ===============================

async function refreshAfterUpdate() {

    await refreshEventsPage();

}



// ===============================
// PAGE STARTUP
// ===============================

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        updatePreview();

        await refreshEventsPage();

    }

);



// ===============================
// OPTIONAL AUTO REFRESH
// ===============================

setInterval(async () => {

    await loadEventStatistics();

}, 30000);



// ===============================
// FUTURE DASHBOARD SUPPORT
// ===============================

async function loadDashboardCards() {

    try {

        const response = await fetch(

            "/api/events/stats"

        );

        const stats = await response.json();

        return stats;

    }

    catch (error) {

        console.error(error);

        return null;

    }

}

// =====================================
// START MASA7 INTRO
// =====================================

window.addEventListener("load", () => {

    setTimeout(() => {

        showMasaIntro();

    }, 300);

}); 

// =====================================
// MASA7 TECH INTRO
// =====================================

window.addEventListener("load", () => {

    const intro = document.createElement("div");

    intro.innerHTML = `

    <div id="masaIntro" style="
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.88);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:999999;
        overflow:hidden;
    ">

        <h1 id="masaText" style="
            font-size:72px;
            font-family:Arial,sans-serif;
            font-weight:900;
            letter-spacing:8px;
            color:#4facfe;
            text-transform:uppercase;
            text-shadow:
                0 0 10px #4facfe,
                0 0 20px #4facfe,
                0 0 40px #2563eb,
                0 0 80px #2563eb;
            transform:scale(0);
            opacity:0;
            transition:1s;
        ">
        </h1>

    </div>

    `;

    document.body.appendChild(intro);

    const text = document.getElementById("masaText");

    const word = "MASA7 TECH";

    let i = 0;

    function typeLetter(){

        if(i < word.length){

            text.innerHTML += word.charAt(i);

            text.style.transform="scale(1)";

            text.style.opacity="1";

            i++;

            setTimeout(typeLetter,120);

        }

    }

    typeLetter();

    setTimeout(()=>{

        text.style.transition="1.2s";

        text.style.transform="scale(.05) rotate(1080deg)";

        text.style.opacity="0";

        intro.style.transition=".8s";

        intro.style.opacity="0";

        setTimeout(()=>{

            intro.remove();

        },900);

    },3000);

});

