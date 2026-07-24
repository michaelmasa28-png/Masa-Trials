/*==========================================================
 KINGDOM WAYS CHURCH
 EVENT CLIENT PORTAL JS
 MEMBER DISPLAY ONLY
==========================================================*/


// ===============================
// BACKEND URL
// ===============================

const API_URL = "";



// ===============================
// ELEMENTS
// ===============================

const eventsContainer =
document.getElementById("eventsContainer");


const featuredZone =
document.getElementById("featuredZone");


const featuredContainer =
document.getElementById("featuredContainer");


const searchInput =
document.getElementById("searchEvent");



// ===============================
// DATA STORAGE
// ===============================

let allEvents = [];




// ===============================
// LOAD EVENTS
// ===============================

async function loadEvents(){


    eventsContainer.innerHTML = `

        <div class="loading">

            Loading church events...

        </div>

    `;


    try{


        const response = await fetch(
            `${API_URL}/events`
        );


        console.log(
            "EVENT STATUS:",
            response.status
        );



        if(!response.ok){

            throw new Error(
                "Failed loading events"
            );

        }



        const data = await response.json();



        console.log(
            "EVENT DATA:",
            data
        );



        /*
          Supports:
          [
            events
          ]

          or

          {
            events:[]
          }
        */


        allEvents =
        Array.isArray(data)
        ?
        data
        :
        data.events || [];



        displayEvents(
            allEvents
        );


        displayFeatured(
            allEvents
        );


    }


    catch(error){


        console.error(
            error
        );


        eventsContainer.innerHTML = `

            <div class="loading">

                Unable to load events.

                <br>

                Please try again.

            </div>

        `;


    }


}






// ===============================
// DISPLAY EVENTS
// ===============================


function displayEvents(events){



    eventsContainer.innerHTML="";



    if(events.length===0){


        eventsContainer.innerHTML = `

        <div class="loading">

            No upcoming events available.

        </div>

        `;


        return;

    }





    events.forEach(event=>{


        const card =
        createEventCard(event);


        eventsContainer.appendChild(
            card
        );


    });



}






// ===============================
// CREATE EVENT CARD
// ===============================


function createEventCard(event){



    const card =
    document.createElement("div");


    card.className =
    "event-card";





    const image =
    event.image
    ||
    event.event_image
    ||
    "images/default-event.jpg";




    card.innerHTML = `


        <img

        class="event-image"

        src="${image}"

        onerror="this.src='images/default-event.jpg'"

        >



        <div class="event-content">


        ${
            event.featured
            ?
            `
            <span class="badge">

            ⭐ Featured Event

            </span>
            `
            :
            ""
        }



        <h3>

        ${event.title || "Church Event"}

        </h3>




        <p class="event-description">

        ${
        event.description
        ||
        "Kingdom Ways Church event."
        }

        </p>





        <div class="event-info">



        <div>

        <i class="fa-solid fa-calendar-days"></i>

        <span>

        ${
        formatDate(event.date)
        }

        </span>

        </div>





        <div>

        <i class="fa-solid fa-clock"></i>

        <span>

        ${
        event.time || "Time not set"
        }

        </span>

        </div>





        <div>

        <i class="fa-solid fa-location-dot"></i>

        <span>

        ${
        event.location
        ||
        event.venue
        ||
        "Main Church"
        }

        </span>

        </div>





        <div>

        <i class="fa-solid fa-microphone"></i>

        <span>

        ${
        event.speaker
        ||
        "To be announced"
        }

        </span>

        </div>



        </div>


        </div>


    `;



    return card;


}






// ===============================
// FEATURED EVENTS
// ===============================


function displayFeatured(events){


    const featured =
    events.filter(
        e=>e.featured === true
    );



    if(featured.length===0){


        featuredZone.style.display =
        "none";


        return;


    }




    featuredZone.style.display =
    "block";



    featuredContainer.innerHTML="";



    featured.forEach(event=>{


        const card =
        createEventCard(event);



        featuredContainer.appendChild(
            card
        );


    });



}








// ===============================
// SEARCH
// ===============================


searchInput.addEventListener(
"input",
()=>{


    const value =
    searchInput.value
    .toLowerCase()
    .trim();



    if(!value){


        displayEvents(
            allEvents
        );


        return;

    }




    const filtered =
    allEvents.filter(event=>{


        return (

        event.title
        ?.toLowerCase()
        .includes(value)

        ||

        event.location
        ?.toLowerCase()
        .includes(value)

        ||

        event.speaker
        ?.toLowerCase()
        .includes(value)

        );


    });



    displayEvents(
        filtered
    );


});







// ===============================
// DATE FORMAT
// ===============================


function formatDate(date){


    if(!date){

        return "Date not set";

    }



    try{


        return new Date(date)
        .toLocaleDateString(
            "en-GB",
            {
                year:"numeric",
                month:"long",
                day:"numeric"
            }
        );


    }

    catch{


        return date;

    }


}







// ===============================
// START
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


    loadEvents();


});