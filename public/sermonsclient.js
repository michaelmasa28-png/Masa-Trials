// =====================================================
// KINGDOM WAYS CHURCH
// SERMON CLIENT
// Part 1
// =====================================================

// ===============================
// ELEMENTS
// ===============================

const container = document.getElementById("sermons-container");

const searchInput = document.getElementById("search");

const verseText = document.getElementById("dailyVerse");

const verseReference = document.getElementById("verseReference");


// ===============================
// DATA
// ===============================

let sermons = [];


// ===============================
// LOAD SERMONS
// ===============================

async function loadSermons(){

container.innerHTML = `

    <div class="loading">

        Loading sermons...

    </div>

`;

try{

    const response = await fetch("/api/sermons/");

    console.log("Status:", response.status);

    const text = await response.text();

    console.log("Response:", text);

    if(!response.ok){

        throw new Error("HTTP " + response.status);

    }

    sermons = JSON.parse(text);

    console.log("Loaded sermons:", sermons);

    displaySermons(sermons);

}

catch(error){

    console.error("loadSermons failed:", error);

    container.innerHTML = `

        <h2>

            Unable to load sermons.

        </h2>

        <p>

            ${error.message}

        </p>

    `;

}
}

// ===============================
// DISPLAY SERMONS
// ===============================

function displaySermons(data){

    container.innerHTML = "";

    if(data.length === 0){

        container.innerHTML = `

            <h2>

                No sermons available.

            </h2>

        `;

        return;

    }

    data.forEach(sermon=>{

        const card = createSermonCard(sermon);

        container.appendChild(card);

    });

}



// ===============================
// CREATE SERMON CARD
// ===============================

function createSermonCard(sermon){

    const card = document.createElement("div");

    card.className = "sermon-card";


    // ---------------------------------
    // Thumbnail
    // ---------------------------------

    const thumbnail = sermon.thumbnail
        ? sermon.thumbnail
        : "../images/default-sermon.jpg";

    // ---------------------------------
    // Video Player / YouTube
    // ---------------------------------

    let buttons = "";

    if(sermon.video_file){

        buttons += `

            <video
                controls
                preload="metadata"
                width="100%"
                style="
                    width:100%;
                    max-height:420px;
                    border-radius:12px;
                    margin-top:15px;
                    background:#000;
                ">

                <source
                    src="${sermon.video_file}"
                    type="video/mp4">

                Your browser does not support HTML5 video.

            </video>

        `;

    }

    if(sermon.youtube_url){

        buttons += `

            <a
                href="${sermon.youtube_url}"
                target="_blank"
                class="watch-btn">

                ▶ Watch on YouTube

            </a>

        `;

    }

    if(!sermon.video_file && !sermon.youtube_url){

        buttons = `

            <div class="watch-btn">

                Video Coming Soon

            </div>

        `;

    }

    // ---------------------------------
    // Card HTML
    // ---------------------------------

    card.innerHTML = `

        <img

            src="${thumbnail}"

            alt="${sermon.title}"

            class="sermon-image"

            onerror="this.src='../images/default-sermon.jpg'">


        <div class="sermon-card-content">


            <span class="sermon-date">

                📅 ${formatDate(sermon.sermon_date)}

            </span>


            <h3>

                ${sermon.title}

            </h3>


            <p>

                <strong>Preacher:</strong>

                ${sermon.preacher}

            </p>


            <p>

                <strong>Bible Reading:</strong>

                ${sermon.bible_reading || "Not Available"}

            </p>


            <p class="sermon-description">

                ${sermon.description || ""}

            </p>


            ${buttons}

        </div>

    `;

    return card;

}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(date){

    if(!date){

        return "Unknown Date";

    }

    const options = {

        year:"numeric",

        month:"long",

        day:"numeric"

    };

    return new Date(date).toLocaleDateString(

        "en-GB",

        options

    );

}

// =====================================================
// DAILY ENCOURAGEMENT
// =====================================================

const DEFAULT_VERSE = {

    verse: "The Lord is my shepherd; I shall not want.",

    reference: "Psalm 23:1"

};


// ======================================
// LOAD SAVED VERSE
// ======================================

function loadSavedVerse(){

    const saved = localStorage.getItem("dailyVerse");

    if(saved){

        const verse = JSON.parse(saved);

        verseText.textContent = `"${verse.verse}"`;

        verseReference.textContent = verse.reference;

    }

    else{

        verseText.textContent = `"${DEFAULT_VERSE.verse}"`;

        verseReference.textContent = DEFAULT_VERSE.reference;

    }

}

// ======================================
// FETCH ONLINE VERSE
// ======================================

async function fetchDailyVerse(){

    try{

        const response = await fetch(
            "https://beta.ourmanna.com/api/v1/get/?format=json"
        );

        if(!response.ok){

            throw new Error("Unable to fetch verse");

        }

        const data = await response.json();

        const verse = {

            verse:data.verse.details.text,

            reference:data.verse.details.reference

        };

        verseText.style.opacity=0;

        verseReference.style.opacity=0;

        setTimeout(()=>{

            verseText.textContent=`"${verse.verse}"`;

            verseReference.textContent=verse.reference;

            verseText.style.opacity=1;

            verseReference.style.opacity=1;

        },300);

        localStorage.setItem(

            "dailyVerse",

            JSON.stringify(verse)

        );

    }

    catch(error){

        console.log("Offline. Using saved verse.");

    }

}

document.addEventListener("DOMContentLoaded",()=>{

    loadSavedVerse();

    loadSermons();

    fetchDailyVerse();

    setInterval(fetchDailyVerse,3600000);

});

