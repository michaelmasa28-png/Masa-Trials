/*
====================================================
 Kingdom Ways Church CMS
 Events Management JavaScript
 Part 1/5
====================================================
*/


"use strict";


//=========================================
// CONFIGURATION
//=========================================


const API_BASE_URL = "/api";

const EVENTS_ENDPOINT = `${API_BASE_URL}/events/`;
function getAuthHeaders(){

    const token =
    localStorage.getItem("token");

    return {
        "Authorization": `Bearer ${token}`
    };

}
function getAuthHeaders(){

    let token = localStorage.getItem("token");


    if(!token){

        const session = JSON.parse(
            localStorage.getItem("adminSession")
        );


        if(session){
            token = session.token;
        }

    }


    return {
        "Authorization": `Bearer ${token}`
    };

}

//=========================================
// GLOBAL STATE
//=========================================


let events = [];

let filteredEvents = [];

let currentPage = 1;

let itemsPerPage = 10;

let editingEventId = null;

let currentFilters = {

    search: "",

    category: "",

    status: "",

    month: "",

    year: "",

    sort: "latest"

};




//=========================================
// DOM REFERENCES
//=========================================


// Header

const adminName =
document.getElementById("adminName");


const currentDate =
document.getElementById("currentDate");


const lastUpdated =
document.getElementById("lastUpdated");




// Statistics

const totalEvents =
document.getElementById("totalEvents");


const upcomingEvents =
document.getElementById("upcomingEvents");


const ongoingEvents =
document.getElementById("ongoingEvents");


const completedEvents =
document.getElementById("completedEvents");


const draftEvents =
document.getElementById("draftEvents");


const featuredEvents =
document.getElementById("featuredEvents");




// Buttons

const addEventBtn =
document.getElementById("addEventBtn");


const refreshEventsBtn =
document.getElementById("refreshEventsBtn");


const exportEventsBtn =
document.getElementById("exportEventsBtn");


const printEventsBtn =
document.getElementById("printEventsBtn");




// Search & Filters

const searchEvent =
document.getElementById("searchEvent");


const categoryFilter =
document.getElementById("categoryFilter");


const statusFilter =
document.getElementById("statusFilter");


const monthFilter =
document.getElementById("monthFilter");


const yearFilter =
document.getElementById("yearFilter");


const sortEvents =
document.getElementById("sortEvents");




// Table

const eventsTableBody =
document.getElementById("eventsTableBody");


const eventCounter =
document.getElementById("eventCounter");


const emptyState =
document.getElementById("emptyState");




// Pagination

const previousPage =
document.getElementById("previousPage");


const nextPage =
document.getElementById("nextPage");


const pageNumbers =
document.getElementById("pageNumbers");




// Event Modal

const eventModal =
document.getElementById("eventModal");


const modalTitle =
document.getElementById("modalTitle");


const closeEventModal =
document.getElementById("closeEventModal");


const eventForm =
document.getElementById("eventForm");


const eventId =
document.getElementById("eventId");




// Form Inputs


const titleInput =
document.getElementById("title");


const subtitleInput =
document.getElementById("subtitle");


const descriptionInput =
document.getElementById("description");


const categoryInput =
document.getElementById("category");


const speakerInput =
document.getElementById("speaker");


const hostInput =
document.getElementById("host");


const bibleVerseInput =
document.getElementById("bibleVerse");



const startDateInput =
document.getElementById("startDate");


const endDateInput =
document.getElementById("endDate");


const startTimeInput =
document.getElementById("startTime");


const endTimeInput =
document.getElementById("endTime");



const venueInput =
document.getElementById("venue");


const mapsLinkInput =
document.getElementById("mapsLink");



const capacityInput =
document.getElementById("capacity");


const deadlineInput =
document.getElementById("deadline");


const registrationRequired =
document.getElementById("registrationRequired");



const bannerInput =
document.getElementById("banner");


const attachmentInput =
document.getElementById("attachment");



const featuredInput =
document.getElementById("featured");


const publicEventInput =
document.getElementById("publicEvent");


const allowCommentsInput =
document.getElementById("allowComments");


const sendNotificationInput =
document.getElementById("sendNotification");




// Form Buttons


const saveDraftBtn =
document.getElementById("saveDraftBtn");


const saveEventBtn =
document.getElementById("saveEventBtn");




// Extra UI


const loadingOverlay =
document.getElementById("loadingOverlay");


const toastContainer =
document.getElementById("toastContainer");


const bannerPreview =
document.getElementById("bannerPreview");




//=========================================
// PAGE START
//=========================================


document.addEventListener(
"DOMContentLoaded",
()=>{

    initializeEventsPage();

});




//=========================================
// INITIALIZATION
//=========================================


function initializeEventsPage(){

    setAdminInfo();

    loadEvents();

    registerBasicEvents();

}




//=========================================
// ADMIN INFORMATION
//=========================================


function setAdminInfo(){


    if(adminName){

        adminName.textContent =
        localStorage.getItem("admin_name")
        || "Administrator";

    }


    if(currentDate){

        currentDate.textContent =
        new Date()
        .toLocaleDateString(
            "en-US",
            {
                weekday:"long",
                year:"numeric",
                month:"long",
                day:"numeric"
            }
        );

    }


}



//=========================================
// LOADING CONTROL
//=========================================


function showLoading(){

    if(loadingOverlay){

        loadingOverlay.style.display="flex";

    }

}



function hideLoading(){

    if(loadingOverlay){

        loadingOverlay.style.display="none";

    }

}




//=========================================
// FIRST API LOAD FUNCTION
// (Completed in Part 2)
//=========================================


async function loadEvents(){

    console.log(
        "Loading church events..."
    );


    // API fetching logic continues
    // in Part 2

}

/*
====================================================
 Kingdom Ways Church CMS
 Events Management JavaScript
 Part 2/5
====================================================
*/


//=========================================
// LOAD EVENTS FROM API
//=========================================


async function loadEvents(){

    try{

        showLoading();


        const response = await fetch(
            EVENTS_ENDPOINT,
            {
                method:"GET",
                headers:{
                    "Content-Type":"application/json"
                }
            }
        );


        if(!response.ok){

            throw new Error(
                "Failed to load events"
            );

        }


        const data =
        await response.json();



        /*
            Expected backend response:

            {
                success:true,
                events:[]
            }

        */


        events =
        data.events || data || [];


        filteredEvents =
        [...events];


        calculateStatistics();


        applyFilters();


        updateLastSync();


    }

    catch(error){

        console.error(
            "Events loading error:",
            error
        );


        showToast(
            "Unable to load events",
            "error"
        );


    }

    finally{

        hideLoading();

    }

}





//=========================================
// UPDATE LAST SYNC
//=========================================


function updateLastSync(){


    if(lastUpdated){

        lastUpdated.textContent =
        new Date()
        .toLocaleTimeString();

    }


}





//=========================================
// STATISTICS
//=========================================


function calculateStatistics(){


    const now =
    new Date();



    let total =
    events.length;


    let upcoming = 0;

    let ongoing = 0;

    let completed = 0;

    let drafts = 0;

    let featured = 0;



    events.forEach(event=>{


        const status =
        String(
            event.status || ""
        ).toLowerCase();



        if(status==="draft"){

            drafts++;

        }



        if(
            event.featured === true
            ||
            event.featured === 1
        ){

            featured++;

        }



        const start =
        new Date(
            event.start_date
            ||
            event.date
        );



        const end =
        new Date(
            event.end_date
            ||
            event.date
            ||
            event.start_date
        );



        if(
            start > now
            &&
            status!=="draft"
        ){

            upcoming++;

        }


        else if(
            start <= now
            &&
            end >= now
        ){

            ongoing++;

        }


        else if(
            end < now
        ){

            completed++;

        }



    });



    updateText(
        totalEvents,
        total
    );


    updateText(
        upcomingEvents,
        upcoming
    );


    updateText(
        ongoingEvents,
        ongoing
    );


    updateText(
        completedEvents,
        completed
    );


    updateText(
        draftEvents,
        drafts
    );


    updateText(
        featuredEvents,
        featured
    );


}





function updateText(element,value){


    if(element){

        element.textContent =
        value;

    }

}





//=========================================
// FILTER SYSTEM
//=========================================


function applyFilters(){


    filteredEvents =
    events.filter(event=>{


        const title =
        String(
            event.title || ""
        )
        .toLowerCase();



        const speaker =
        String(
            event.speaker || ""
        )
        .toLowerCase();



        const venue =
        String(
            event.venue || ""
        )
        .toLowerCase();



        const category =
        String(
            event.category || ""
        );



        const status =
        String(
            event.status || ""
        )
        .toLowerCase();



        const search =
        currentFilters.search
        .toLowerCase();



        const matchSearch =
        !search
        ||
        title.includes(search)
        ||
        speaker.includes(search)
        ||
        venue.includes(search);



        const matchCategory =
        !currentFilters.category
        ||
        category === currentFilters.category;



        const matchStatus =
        !currentFilters.status
        ||
        status === currentFilters.status;



        return (

            matchSearch
            &&
            matchCategory
            &&
            matchStatus

        );


    });



    sortEventsList();


    currentPage=1;


    renderEventsTable();


}





//=========================================
// SORT EVENTS
//=========================================


function sortEventsList(){


    switch(
        currentFilters.sort
    ){


        case "title":


            filteredEvents.sort(
                (a,b)=>
                a.title.localeCompare(
                    b.title
                )
            );


        break;



        case "oldest":


            filteredEvents.sort(
                (a,b)=>
                new Date(a.start_date)
                -
                new Date(b.start_date)
            );


        break;



        default:


            filteredEvents.sort(
                (a,b)=>
                new Date(b.start_date)
                -
                new Date(a.start_date)
            );


    }


}





//=========================================
// TABLE RENDERING
//=========================================


function renderEventsTable(){


    if(!eventsTableBody)
    return;



    eventsTableBody.innerHTML="";



    if(
        filteredEvents.length===0
    ){


        emptyState.style.display =
        "block";


        eventCounter.textContent =
        "0 Events Found";


        return;

    }



    emptyState.style.display =
    "none";



    eventCounter.textContent =

    `${filteredEvents.length} Events Found`;



    const start =
    (currentPage-1)
    *
    itemsPerPage;



    const end =
    start
    +
    itemsPerPage;



    const pageEvents =
    filteredEvents.slice(
        start,
        end
    );



    pageEvents.forEach(event=>{


        eventsTableBody.innerHTML +=

        createEventRow(event);


    });


}





//=========================================
// CREATE TABLE ROW
//=========================================


function createEventRow(event){


    const image =
    event.banner
    ||
    event.image
    ||
    "";



    return `

<tr>

<td>

${
image

?

`

<img 
src="${escapeHTML(image)}"
class="event-image"
alt="Event">

`

:

`

<div class="event-placeholder">

<i class="fas fa-calendar"></i>

</div>

`

}

</td>



<td>

<strong>
${escapeHTML(event.title || "Untitled")}
</strong>

<br>

<small>
${escapeHTML(event.speaker || "")}
</small>

</td>



<td>

${formatDate(event.start_date)}

</td>



<td>

${escapeHTML(event.venue || "-")}

</td>



<td>

${escapeHTML(event.category || "-")}

</td>



<td>

<span class="status status-${event.status || "draft"}">

${event.status || "Draft"}

</span>

</td>



<td>

${event.capacity || "-"}

</td>



<td>

${event.registered || 0}

</td>



<td>

<div class="action-buttons">

<button class="action-btn view-btn"
data-id="${event.id}">

<i class="fas fa-eye"></i>

</button>


<button class="action-btn edit-btn"
data-id="${event.id}">

<i class="fas fa-edit"></i>

</button>


<button class="action-btn delete-btn"
data-id="${event.id}">

<i class="fas fa-trash"></i>

</button>

</div>

</td>


</tr>

`;

}




//=========================================
// SECURITY HELPERS
//=========================================


function escapeHTML(value){


    return String(value)

    .replace(
        /[&<>"']/g,
        char=>({
            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#039;"
        }[char])

    );

}




function formatDate(date){


    if(!date)
    return "-";


    return new Date(date)
    .toLocaleDateString();


}

/*
====================================================
 Kingdom Ways Church CMS
 Events Management JavaScript
 Part 3/5
====================================================
*/


//=========================================
// REGISTER EVENTS
//=========================================


function registerBasicEvents(){


    // Open create modal

    if(addEventBtn){

        addEventBtn.addEventListener(
            "click",
            ()=>{

                openEventModal();

            }
        );

    }



    // Refresh

    if(refreshEventsBtn){

        refreshEventsBtn.addEventListener(
            "click",
            ()=>{

                loadEvents();

            }
        );

    }



    // Print

    if(printEventsBtn){

        printEventsBtn.addEventListener(
            "click",
            ()=>{

                window.print();

            }
        );

    }



    // Export

    if(exportEventsBtn){

        exportEventsBtn.addEventListener(
            "click",
            exportEventsCSV
        );

    }



    // Close modal

    if(closeEventModal){

        closeEventModal.addEventListener(
            "click",
            closeEventModalWindow
        );

    }



    // Close when clicking outside

    if(eventModal){

        eventModal.addEventListener(
            "click",
            e=>{

                if(
                    e.target === eventModal
                ){

                    closeEventModalWindow();

                }

            }
        );

    }



    // Search

    if(searchEvent){

        searchEvent.addEventListener(
            "input",
            e=>{

                currentFilters.search =
                e.target.value;

                applyFilters();

            }
        );

    }



    // Category

    if(categoryFilter){

        categoryFilter.addEventListener(
            "change",
            e=>{

                currentFilters.category =
                e.target.value;

                applyFilters();

            }
        );

    }



    // Status

    if(statusFilter){

        statusFilter.addEventListener(
            "change",
            e=>{

                currentFilters.status =
                e.target.value;

                applyFilters();

            }
        );

    }



    // Month

    if(monthFilter){

        monthFilter.addEventListener(
            "change",
            e=>{

                currentFilters.month =
                e.target.value;

                applyFilters();

            }
        );

    }



    // Year

    if(yearFilter){

        yearFilter.addEventListener(
            "change",
            e=>{

                currentFilters.year =
                e.target.value;

                applyFilters();

            }
        );

    }



    // Sorting

    if(sortEvents){

        sortEvents.addEventListener(
            "change",
            e=>{

                currentFilters.sort =
                e.target.value;

                applyFilters();

            }
        );

    }



    // Pagination

    if(previousPage){

        previousPage.addEventListener(
            "click",
            ()=>{

                if(currentPage>1){

                    currentPage--;

                    renderEventsTable();

                }

            }
        );

    }



    if(nextPage){

        nextPage.addEventListener(
            "click",
            ()=>{

                const pages =
                Math.ceil(
                    filteredEvents.length
                    /
                    itemsPerPage
                );


                if(currentPage < pages){

                    currentPage++;

                    renderEventsTable();

                }

            }
        );

    }



    // Table actions

    if(eventsTableBody){

        eventsTableBody.addEventListener(
            "click",
            handleTableActions
        );

    }


}





//=========================================
// MODAL FUNCTIONS
//=========================================


function openEventModal(event=null){


    if(!eventModal)
    return;



    eventModal.classList.add(
        "active"
    );


    eventModal.setAttribute(
        "aria-hidden",
        "false"
    );



    if(event){

        modalTitle.innerHTML =

        `<i class="fas fa-edit"></i>
        Edit Event`;

        editingEventId =
        event.id;


        fillEventForm(event);


    }

    else{


        modalTitle.innerHTML =

        `<i class="fas fa-calendar-plus"></i>
        Create New Event`;


        editingEventId=null;


        resetEventForm();


    }


}




function closeEventModalWindow(){


    if(eventModal){

        eventModal.classList.remove(
            "active"
        );


        eventModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


}





//=========================================
// RESET FORM
//=========================================


function resetEventForm(){


    if(eventForm){

        eventForm.reset();

    }


    if(eventId){

        eventId.value="";

    }


    if(bannerPreview){

        bannerPreview.innerHTML="";

    }


}





//=========================================
// LOAD EVENT INTO FORM
//=========================================


function fillEventForm(event){


    eventId.value =
    event.id || "";



    titleInput.value =
    event.title || "";



    subtitleInput.value =
    event.subtitle || "";



    descriptionInput.value =
    event.description || "";



    categoryInput.value =
    event.category || "";



    speakerInput.value =
    event.speaker || "";



    hostInput.value =
    event.host || "";



    bibleVerseInput.value =
    event.bible_reading || "";



    startDateInput.value =
    event.start_date
    ?
    event.start_date.substring(0,10)
    :
    "";



    endDateInput.value =
    event.end_date
    ?
    event.end_date.substring(0,10)
    :
    "";



    startTimeInput.value =
    event.start_time || "";



    endTimeInput.value =
    event.end_time || "";



    venueInput.value =
    event.venue || "";



    mapsLinkInput.value =
    event.maps_link || "";



    capacityInput.value =
    event.capacity || "";



    deadlineInput.value =
    event.registration_deadline || "";



    registrationRequired.checked =
    event.registration_required || false;



    featuredInput.checked =
    event.featured || false;



    publicEventInput.checked =
    event.public_event ?? true;



    allowCommentsInput.checked =
    event.allow_comments || false;



    sendNotificationInput.checked =
    event.send_notification || false;



}





//=========================================
// TABLE BUTTON ACTIONS
//=========================================


function handleTableActions(e){


    const button =
    e.target.closest(
        "button"
    );



    if(!button)
    return;



    const id =
    Number(
        button.dataset.id
    );



    const event =
    events.find(
        item=>item.id===id
    );



    if(!event)
    return;



    if(
        button.classList.contains(
            "edit-btn"
        )
    ){

        openEventModal(event);

    }



    if(
        button.classList.contains(
            "view-btn"
        )
    ){

        viewEvent(event);

    }



    if(
        button.classList.contains(
            "delete-btn"
        )
    ){

        deleteEvent(id);

    }



}
/*
====================================================
 Kingdom Ways Church CMS
 Events Management JavaScript
 Part 4/5
====================================================
*/


//=========================================
// FORM SUBMISSION
//=========================================

if(eventForm){

    eventForm.addEventListener(
        "submit",
        async(e)=>{

            e.preventDefault();

            await saveEvent("published");

        }
    );

}

if(saveDraftBtn){

    saveDraftBtn.addEventListener(
        "click",
        async()=>{

            await saveEvent("draft");

        }
    );

}



//=========================================
// SAVE EVENT
// CREATE / UPDATE
//=========================================

async function saveEvent(status){

    try{

        showLoading();

        const formData = new FormData();

        formData.append("title", titleInput.value);
        formData.append("subtitle", subtitleInput.value);
        formData.append("description", descriptionInput.value);
        formData.append("category", categoryInput.value);
        formData.append("speaker", speakerInput.value);
        formData.append("host", hostInput.value);
        formData.append("bible_reading", bibleVerseInput.value);
        formData.append("start_date", startDateInput.value);
        formData.append("end_date", endDateInput.value);
        formData.append("start_time", startTimeInput.value);
        formData.append("end_time", endTimeInput.value);
        formData.append("venue", venueInput.value);
        formData.append("maps_link", mapsLinkInput.value);
        formData.append("capacity", capacityInput.value);
        formData.append("registration_deadline", deadlineInput.value);
        formData.append("registration_required", registrationRequired.checked);
        formData.append("featured", featuredInput.checked);
        formData.append("public_event", publicEventInput.checked);
        formData.append("allow_comments", allowCommentsInput.checked);
        formData.append("send_notification", sendNotificationInput.checked);
        formData.append("status", status);

        if(bannerInput.files[0]){

            formData.append(
                "banner",
                bannerInput.files[0]
            );

        }

        if(attachmentInput.files[0]){

            formData.append(
                "attachment",
                attachmentInput.files[0]
            );

        }

        let url = EVENTS_ENDPOINT;
        let method = "POST";

        if(editingEventId){

            url = `${EVENTS_ENDPOINT}${editingEventId}`;
            method = "PUT";

        }

        const response = await fetch(
            url,
            {
                method,
                headers: getAuthHeaders(),
                body: formData
            }
        );

        if(!response.ok){

            const errorText = await response.text();

            throw new Error(
                errorText || "Event save failed"
            );

        }

        showToast(
            editingEventId
                ? "Event updated successfully"
                : "Event created successfully",
            "success"
        );

        closeEventModalWindow();

        await loadEvents();

    }

    catch(error){

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

    finally{

        hideLoading();

    }

}



//=========================================
// DELETE EVENT
//=========================================

async function deleteEvent(id){

    const confirmDelete = confirm(
        "Are you sure you want to delete this event?"
    );

    if(!confirmDelete){
        return;
    }

    try{

        showLoading();

        const url = `${API_BASE_URL}/events/${id}`;

        const response = await fetch(
            url,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        if(!response.ok){

            const errorText = await response.text();

            throw new Error(
                errorText || "Delete failed"
            );

        }

        showToast(
            "Event deleted successfully",
            "success"
        );

        await loadEvents();

    }

    catch(error){

        console.error(error);

        showToast(
            error.message || "Delete failed",
            "error"
        );

    }

    finally{

        hideLoading();

    }

}



//=========================================
// VIEW EVENT DETAILS
//=========================================

function viewEvent(event){

    if(!event){

        showToast(
            "Event not found",
            "error"
        );

        return;

    }

    alert(
        "EVENT DETAILS\n\n" +
        (event.title || "Untitled Event") +
        "\n" +
        (event.venue || "No venue")
    );

}



//=========================================
// EXPORT CSV
//=========================================

function exportEventsCSV(){

    if(events.length === 0){

        showToast(
            "No events to export",
            "warning"
        );

        return;

    }

    let csv = "Title,Category,Date,Venue,Status\n";

    events.forEach(event=>{

        csv +=
            `"${event.title || ""}",` +
            `"${event.category || ""}",` +
            `"${event.start_date || ""}",` +
            `"${event.venue || ""}",` +
            `"${event.status || ""}"\n`;

    });

    const blob = new Blob(
        [csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "church-events.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/*
====================================================
 Kingdom Ways Church CMS
 Events Management JavaScript
 Next Part Continues Below

====================================================
 Kingdom Ways Church CMS
 Events Management JavaScript
 Part 5/5 FINAL
====================================================
*/


//=========================================
// TOAST SYSTEM
//=========================================

function showToast(message, type = "success") {

    if (!toastContainer) {
        alert(message);
        return;
    }

    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    let icon = "fa-circle-check";

    if (type === "error") {
        icon = "fa-circle-xmark";
    }

    if (type === "warning") {
        icon = "fa-triangle-exclamation";
    }

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>
            ${escapeHTML(message)}
        </span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);

}



//=========================================
// BANNER PREVIEW
//=========================================

if (bannerInput) {

    bannerInput.addEventListener("change", () => {

        const file = bannerInput.files[0];

        if (!file) return;

        if (!file.type.startsWith("image")) {

            showToast(
                "Please select an image file",
                "warning"
            );

            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {

            if (bannerPreview) {

                bannerPreview.innerHTML = `
                    <img
                    src="${e.target.result}"
                    alt="Banner Preview">
                `;

            }

        };

        reader.readAsDataURL(file);

    });

}



//=========================================
// PAGINATION
//=========================================

function renderPagination() {

    if (!pageNumbers) return;

    pageNumbers.innerHTML = "";

    const totalPages = Math.ceil(
        filteredEvents.length / itemsPerPage
    );

    for (let i = 1; i <= totalPages; i++) {

        const button = document.createElement("button");

        button.className = "page-number";

        if (i === currentPage) {
            button.classList.add("active");
        }

        button.textContent = i;

        button.onclick = () => {

            currentPage = i;

            renderEventsTable();

            renderPagination();

        };

        pageNumbers.appendChild(button);

    }

}



//=========================================
// UPDATE TABLE WITH PAGINATION
//=========================================

const originalRender = renderEventsTable;

renderEventsTable = function () {

    originalRender();

    renderPagination();

};



//=========================================
// MONTH AND YEAR FILTER SUPPORT
//=========================================

const oldApplyFilters = applyFilters;

applyFilters = function () {

    filteredEvents = events.filter(event => {

        const eventDate = new Date(event.start_date);

        const monthMatch =
            !currentFilters.month ||
            eventDate.getMonth() + 1 === Number(currentFilters.month);

        const yearMatch =
            !currentFilters.year ||
            eventDate.getFullYear() === Number(currentFilters.year);

        return monthMatch && yearMatch;

    });

    oldApplyFilters();

};



//=========================================
// AUTO REFRESH
//=========================================

let autoRefreshTimer;

function startAutoRefresh() {

    autoRefreshTimer = setInterval(() => {

        loadEvents();

    }, 60000);

}

// Start background refresh
startAutoRefresh();



//=========================================
// KEYBOARD ACCESSIBILITY
//=========================================

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeEventModalWindow();

    }

});



//=========================================
// DATE DEFAULT HELPERS
//=========================================

function setDefaultDate() {

    const today = new Date()
        .toISOString()
        .split("T")[0];

    if (startDateInput && !startDateInput.value) {

        startDateInput.value = today;

    }

}



// Apply when opening new event

if (addEventBtn) {

    addEventBtn.addEventListener("click", () => {

        setDefaultDate();

    });

}



//=========================================
// FINAL READY MESSAGE
//=========================================

console.log(`
=================================
 Kingdom Ways CMS Events Loaded
 CRUD Ready
 API Connected
 Production JS Active
=================================
`);
