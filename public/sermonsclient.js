// =====================================================
// KINGDOM WAYS CHURCH
// SERMON CLIENT
// PART 1 / 5
// =====================================================


// ===============================
// ELEMENTS
// ===============================

const container = document.getElementById(
    "sermons-container"
);

const searchInput = document.getElementById(
    "search"
);

const verseText = document.getElementById(
    "dailyVerse"
);

const verseReference = document.getElementById(
    "verseReference"
);



// ===============================
// CONFIG
// ===============================

const API = "";


// ===============================
// DATA STORAGE
// ===============================

let sermons = [];

let filteredSermons = [];




// ===============================
// LOAD SERMONS
// ===============================

async function loadSermons(){


    if(!container){

        console.error(
            "Sermon container not found"
        );

        return;

    }



    container.innerHTML = `

        <div class="loading">

            Loading sermons...

        </div>

    `;



    try{


        const response = await fetch(
            `${API}/api/sermons/`
        );



        console.log(
            "Sermon API Status:",
            response.status
        );



        if(!response.ok){


            throw new Error(
                "Server error: " + response.status
            );


        }



        const data = await response.json();



        console.log(
            "Sermons Loaded:",
            data
        );



        sermons = Array.isArray(data)
            ? data
            : [];



        filteredSermons = [...sermons];



        displaySermons(
            filteredSermons
        );



        localStorage.setItem(
            "sermons_cache",
            JSON.stringify(sermons)
        );



    }



    catch(error){



        console.error(
            "Sermon loading failed:",
            error
        );



        // Try offline cache


        const saved =
        localStorage.getItem(
            "sermons_cache"
        );



        if(saved){


            sermons =
            JSON.parse(saved);



            filteredSermons =
            [...sermons];



            displaySermons(
                filteredSermons
            );


            return;

        }





        container.innerHTML = `


            <div class="error-message">


                Unable to load sermons.


                <br><br>


                ${error.message}


            </div>


        `;



    }



}

// =====================================================
// DISPLAY SERMONS
// =====================================================


function displaySermons(data){



    if(!container){

        return;

    }



    container.innerHTML = "";




    if(!data || data.length === 0){



        container.innerHTML = `


            <div class="empty-sermon">


                <h2>

                    No sermons available

                </h2>


                <p>

                    New messages will appear here
                    when uploaded by the church.

                </p>


            </div>


        `;



        return;

    }





    data.forEach((sermon,index)=>{



        const card =
        createSermonCard(
            sermon
        );



        // smooth loading order


        card.style.animationDelay =
        `${index * 0.08}s`;



        container.appendChild(
            card
        );



    });



}








// =====================================================
// CREATE SERMON CARD
// =====================================================


function createSermonCard(sermon){



    const card =
    document.createElement(
        "article"
    );



    card.className =
    "sermon-card";





    // ===============================
    // IMAGE HANDLING
    // ===============================


    let thumbnail =
    sermon.thumbnail;



    if(!thumbnail){


        thumbnail =
        "images/default-sermon.jpg";


    }





    // ===============================
    // MEDIA SECTION
    // ===============================


    let media = "";





    if(sermon.video_file){



        media += `


        <div class="sermon-video">


            <video

                controls

                preload="metadata"

                poster="${thumbnail}">


                <source

                    src="${sermon.video_file}"

                    type="video/mp4">


                Your browser does not support video.


            </video>


        </div>


        `;


    }





    if(sermon.youtube_url){



        media += `


            <a

            href="${sermon.youtube_url}"

            target="_blank"

            rel="noopener noreferrer"

            class="watch-btn">


                ▶ Watch on YouTube


            </a>


        `;


    }





    if(
        !sermon.video_file &&
        !sermon.youtube_url
    ){



        media += `


            <div class="watch-btn">


                🎬 Video Coming Soon


            </div>


        `;


    }





    // ===============================
    // CARD CONTENT
    // ===============================



    card.innerHTML = `


        <img


            src="${thumbnail}"


            alt="${safeText(sermon.title)}"


            class="sermon-image"


            loading="lazy"


            onerror="this.src='images/default-sermon.jpg'"

        >




        <div class="sermon-card-content">





            <span class="sermon-date">


                📅 ${formatDate(
                    sermon.sermon_date
                )}


            </span>





            <h3>


                ${safeText(
                    sermon.title ||
                    "Untitled Sermon"
                )}


            </h3>





            <p>


                <strong>

                    Preacher:

                </strong>


                ${safeText(
                    sermon.preacher ||
                    "Church Minister"
                )}


            </p>





            <p>


                <strong>

                    Bible Reading:

                </strong>


                ${safeText(
                    sermon.bible_reading ||
                    "Not Available"
                )}


            </p>





            <p class="sermon-description">


                ${safeText(
                    sermon.description ||
                    "A powerful message from the Word of God."
                )}


            </p>





            ${media}




        </div>


    `;



    return card;


}






// =====================================================
// SECURITY TEXT CLEANING
// Prevent database text breaking page
// =====================================================


function safeText(text){



    return String(text)

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );


}

// =====================================================
// DATE FORMAT
// =====================================================


function formatDate(date){



    if(!date){


        return "Date not available";


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


    catch(error){



        return "Unknown Date";


    }



}







// =====================================================
// SERMON SEARCH
// =====================================================


if(searchInput){



    searchInput.addEventListener(
        "input",
        function(){



            const value =
            this.value
            .toLowerCase()
            .trim();





            if(value === ""){


                filteredSermons =
                [...sermons];


            }

            else{


                filteredSermons =
                sermons.filter(
                    sermon => {


                        const title =
                        (
                            sermon.title ||
                            ""
                        )
                        .toLowerCase();



                        const preacher =
                        (
                            sermon.preacher ||
                            ""
                        )
                        .toLowerCase();



                        const bible =
                        (
                            sermon.bible_reading ||
                            ""
                        )
                        .toLowerCase();





                        return (

                            title.includes(value)

                            ||

                            preacher.includes(value)

                            ||

                            bible.includes(value)

                        );


                    }
                );


            }





            displaySermons(
                filteredSermons
            );




        }

    );



}








// =====================================================
// DAILY ENCOURAGEMENT
// =====================================================


const DEFAULT_VERSE = {



    verse:

    "The Lord is my shepherd; I shall not want.",



    reference:

    "Psalm 23:1"



};






// =====================================================
// LOAD SAVED VERSE
// =====================================================


function loadSavedVerse(){



    if(
        !verseText ||
        !verseReference
    ){

        return;

    }





    const saved =

    localStorage.getItem(
        "dailyVerse"
    );





    if(saved){



        try{



            const verse =
            JSON.parse(saved);



            verseText.textContent =

            `"${verse.verse}"`;



            verseReference.textContent =

            verse.reference;



        }

        catch{


            showDefaultVerse();


        }



    }


    else{


        showDefaultVerse();


    }




}






function showDefaultVerse(){



    if(verseText){



        verseText.textContent =

        `"${DEFAULT_VERSE.verse}"`;



    }




    if(verseReference){



        verseReference.textContent =

        DEFAULT_VERSE.reference;



    }



}

// =====================================================
// FETCH DAILY VERSE ONLINE
// =====================================================


async function fetchDailyVerse(){



    if(
        !verseText ||
        !verseReference
    ){

        return;

    }





    try{



        const response = await fetch(

            "https://beta.ourmanna.com/api/v1/get/?format=json"

        );





        if(!response.ok){


            throw new Error(
                "Verse service unavailable"
            );


        }





        const data =
        await response.json();





        const verse = {



            verse:

            data
            .verse
            .details
            .text,



            reference:

            data
            .verse
            .details
            .reference



        };






        // Fade animation


        verseText.style.opacity = "0";

        verseReference.style.opacity = "0";



        setTimeout(()=>{



            verseText.textContent =

            `"${verse.verse}"`;




            verseReference.textContent =

            verse.reference;





            verseText.style.opacity = "1";

            verseReference.style.opacity = "1";




        },400);







        localStorage.setItem(

            "dailyVerse",

            JSON.stringify(
                verse
            )

        );





    }



    catch(error){



        console.log(

            "Using saved verse:",

            error.message

        );



    }



}








// =====================================================
// VERSE ROTATION FALLBACK
// =====================================================


const backupVerses = [



    {

        verse:

        "I can do all things through Christ who strengthens me.",


        reference:

        "Philippians 4:13"

    },



    {

        verse:

        "Trust in the Lord with all your heart.",


        reference:

        "Proverbs 3:5"

    },



    {

        verse:

        "Be strong and courageous. Do not be afraid.",


        reference:

        "Joshua 1:9"

    },



    {

        verse:

        "For with God nothing shall be impossible.",


        reference:

        "Luke 1:37"

    }



];





let verseIndex = 0;





function rotateBackupVerse(){



    if(
        !verseText ||
        !verseReference
    ){

        return;

    }





    verseText.style.opacity="0";

    verseReference.style.opacity="0";





    setTimeout(()=>{



        const item =
        backupVerses[
            verseIndex
        ];



        verseText.textContent =

        `"${item.verse}"`;




        verseReference.textContent =

        item.reference;





        verseText.style.opacity="1";

        verseReference.style.opacity="1";





        verseIndex++;





        if(
            verseIndex >=
            backupVerses.length
        ){


            verseIndex=0;


        }




    },500);



}








// =====================================================
// STARTUP
// =====================================================


document.addEventListener(

"DOMContentLoaded",

()=>{



    console.log(

        "Kingdom Ways Sermon Client Loaded"

    );




    loadSavedVerse();




    loadSermons();




    fetchDailyVerse();




    // refresh verse every hour


    setInterval(

        fetchDailyVerse,

        3600000

    );




    // backup rotation every 20 seconds


    setInterval(

        rotateBackupVerse,

        20000

    );



}

);


// =====================================================
// KINGDOM WAYS CHURCH
// SERMON CLIENT
// PART 5 / 5
// FINAL PRODUCTION POLISH
// =====================================================




// =====================================================
// MEMBER SESSION CHECK
// Keeps current login system
// No logout added
// =====================================================


function checkMemberSession(){



    const member =

    localStorage.getItem(
        "member"
    );





    if(member){



        try{



            const data =
            JSON.parse(member);




            console.log(

                "Active Member:",

                data.username

            );




        }

        catch(error){



            console.log(

                "Invalid member session"

            );



        }




    }




}







// =====================================================
// CARD REVEAL ANIMATION
// Works with existing CSS
// =====================================================


function activateCardAnimation(){



    const cards =

    document.querySelectorAll(

        ".sermon-card"

    );





    cards.forEach(

        (card,index)=>{



            card.style.opacity="0";



            card.style.transform =

            "translateY(35px)";





            setTimeout(()=>{



                card.style.transition =

                "all .7s ease";



                card.style.opacity="1";



                card.style.transform =

                "translateY(0)";




            },

            index * 100);



        }

    );



}






// =====================================================
// IMAGE ERROR PROTECTION
// =====================================================


document.addEventListener(

"error",

function(event){



    if(
        event.target.tagName
        ===
        "IMG"
    ){



        event.target.src =

        "images/default-sermon.jpg";



    }



},

true

);







// =====================================================
// PAGE VISIBILITY
// Refresh sermons when returning
// =====================================================


document.addEventListener(

"visibilitychange",

()=>{



    if(
        document.visibilityState
        ===
        "visible"
    ){



        console.log(

            "Sermon page active"

        );



    }



}

);







// =====================================================
// BACK TO TOP SUPPORT
// Future compatible
// =====================================================


function scrollTopPage(){



    window.scrollTo({

        top:0,

        behavior:"smooth"

    });



}







// =====================================================
// FINAL INITIALIZATION
// =====================================================


window.addEventListener(

"load",

()=>{



    checkMemberSession();



    setTimeout(()=>{



        activateCardAnimation();



    },500);





    console.log(

        "Kingdom Ways Sermon System Ready"

    );



});



// =====================================================
// AUTO LOAD FIX
// Prevent "Unable to load sermons until refresh"
// =====================================================

window.addEventListener("load", ()=>{

    console.log(
        "Sermon page fully loaded - checking API"
    );


    setTimeout(()=>{

        if(
            typeof sermons === "undefined" ||
            sermons.length === 0
        ){

            console.log(
                "Retrying sermon loading..."
            );

            loadSermons();

        }


    },1500);


});




// =====================================================
// NETWORK RECOVERY
// Reload sermons when connection returns
// =====================================================

window.addEventListener(
    "online",
    ()=>{

        console.log(
            "Internet restored - loading sermons"
        );

        loadSermons();

    }
);



// =====================================================
// FUTURE FEATURES RESERVED
// =====================================================
//
// - Sermon views counter
// - Member reactions
// - Prayer requests
// - Sermon downloads
// - Notifications
// - Live streaming
//
// =====================================================