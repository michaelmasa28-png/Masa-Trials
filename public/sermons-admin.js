// =====================================================
// KINGDOM WAYS CMS
// sermons-admin.js
// CLEAN VERSION PART 1/4
// =====================================================


const API_URL = "/api/sermons";

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ===============================
// ELEMENTS
// ===============================

const sermonForm = document.getElementById("sermonForm");

const sermonTable = document.getElementById("sermonTableBody");

const thumbnailInput = document.getElementById("thumbnail");

const thumbnailPreview = document.getElementById("thumbnailPreview");

const videoInput = document.getElementById("video_file");

const videoPreview = document.getElementById("videoPreview");

const notesInput = document.getElementById("notes");

let currentEditId = null;



// ===============================
// PAGE START
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSermons();

    }
);



// ===============================
// THUMBNAIL PREVIEW
// ===============================

if(thumbnailInput){

    thumbnailInput.addEventListener(
        "change",
        ()=>{

            const file =
            thumbnailInput.files[0];


            if(!file) return;


            thumbnailPreview.src =
            URL.createObjectURL(file);

        }
    );

}




// ===============================
// VIDEO PREVIEW
// ===============================

if(videoInput){

    videoInput.addEventListener(
        "change",
        ()=>{


            const file =
            videoInput.files[0];


            if(!file) return;


            videoPreview.src =
            URL.createObjectURL(file);


            videoPreview.style.display =
            "block";


            videoPreview.load();


        }
    );

}




// ===============================
// SAVE SERMON
// ===============================

function getToken() {
    const session = JSON.parse(localStorage.getItem("adminSession") || "{}");
    return session.token || "";
}

if(sermonForm){
sermonForm.addEventListener(
"submit",
async function(e){


e.preventDefault();



const formData =
new FormData(sermonForm);



try{


let response;



// CREATE

if(currentEditId === null){


response =
await fetch(
API_URL + "/",
{
method:"POST",
headers:{ "Authorization": `Bearer ${getToken()}` },
body:formData
}
);



}


// UPDATE

else{


response =
await fetch(
`${API_URL}/${currentEditId}`,
{
method:"PUT",
headers:{ "Authorization": `Bearer ${getToken()}` },
body:formData
}
);



}



const result =
await response.json();



if(!response.ok){


alert(
result.detail ||
"Unable to save sermon"
);


return;


}



alert(
"Sermon saved successfully"
);



resetForm();



loadSermons();



}

catch(error){


console.error(error);


alert(
"Server connection failed"
);


}



});
}

// ===============================
// RESET FORM
// ===============================

function resetForm(){

if(sermonForm) sermonForm.reset();



currentEditId = null;



if(thumbnailPreview){

thumbnailPreview.src =
"../images/default-sermon.jpg";

}



if(videoPreview){

videoPreview.pause();

videoPreview.removeAttribute(
"src"
);

videoPreview.load();

videoPreview.style.display =
"none";

}


}// =====================================================
// LOAD SAVED SERMONS
// =====================================================


async function loadSermons(){


    try{


        const response =
        await fetch(
            API_URL + "/",
            { headers: { "Authorization": `Bearer ${getToken()}` } }
        );



        const sermons =
        await response.json();

        if(!sermonTable) return;

        sermonTable.innerHTML = "";



        if(sermons.length === 0){


            sermonTable.innerHTML = `

            <tr>

                <td colspan="7" class="empty">

                    No sermons found.

                </td>

            </tr>

            `;


            return;


        }





        sermons.forEach(
            sermon => {

                addSermonRow(sermon);

            }
        );



    }


    catch(error){


        console.error(error);



        sermonTable.innerHTML = `

        <tr>

            <td colspan="7">

                Unable to load sermons.

            </td>

        </tr>

        `;


    }



}




// =====================================================
// CREATE TABLE ROW
// =====================================================


function addSermonRow(sermon){



    const row =
    document.createElement("tr");



    row.innerHTML = `


        <td>

            ${sermon.id}

        </td>



        <td>


            ${
                sermon.thumbnail

                ?

                `

                <img

                src="${sermon.thumbnail}"

                class="sermon-thumb">

                `

                :

                "No Image"

            }


        </td>





        <td>

            ${escapeHtml(sermon.title)}

        </td>





        <td>

            ${escapeHtml(sermon.preacher)}

        </td>





        <td>

            ${escapeHtml(sermon.sermon_date) || "-"}

        </td>





        <td>


            ${
                sermon.video_file

                ?

                `

                <span class="uploaded">

                Uploaded

                </span>

                `


                :

                sermon.youtube_url

                ?

                `

                <span class="youtube">

                YouTube

                </span>


                `


                :

                `

                <span class="none">

                No Video

                </span>


                `

            }



        </td>






        <td>


            <button

            class="edit-btn"

            onclick="editSermon(${sermon.id})">


            Edit


            </button>





            <button

            class="delete-btn"

            onclick="deleteSermon(${sermon.id})">


            Delete


            </button>



        </td>



    `;




    sermonTable.appendChild(row);



}






// =====================================================
// DELETE SERMON
// =====================================================


async function deleteSermon(id){



    const confirmDelete =
    confirm(
        "Delete this sermon permanently?"
    );



    if(!confirmDelete) return;



    try{



        const response =
        await fetch(

            `${API_URL}/${id}`,

            {

                method:"DELETE",
                headers:{ "Authorization": `Bearer ${getToken()}` }

            }

        );





        if(response.ok){


            alert(
                "Sermon deleted"
            );


            loadSermons();


        }



        else{


            alert(
                "Delete failed"
            );


        }




    }


    catch(error){


        console.error(error);


        alert(
            "Server error"
        );


    }



}

// =====================================================
// EDIT SERMON
// =====================================================


async function editSermon(id){


    try{


        const response =
        await fetch(
            API_URL + "/",
            { headers: { "Authorization": `Bearer ${getToken()}` } }
        );



        const sermons =
        await response.json();



        const sermon =
        sermons.find(
            item => item.id === id
        );



        if(!sermon){


            alert(
                "Sermon not found"
            );


            return;


        }





        document.getElementById("title").value =
        sermon.title || "";



        document.getElementById("preacher").value =
        sermon.preacher || "";



        document.getElementById("sermon_date").value =
        sermon.sermon_date || "";



        document.getElementById("bible_reading").value =
        sermon.bible_reading || "";



        document.getElementById("description").value =
        sermon.description || "";



        document.getElementById("youtube_url").value =
        sermon.youtube_url || "";



        document.getElementById("featured").checked =
        sermon.featured || false;




        currentEditId = id;





        if(sermon.thumbnail){


            thumbnailPreview.src =
            sermon.thumbnail;


        }




        if(sermon.video_file){


            videoPreview.src =
            sermon.video_file;



            videoPreview.style.display =
            "block";


        }





        window.scrollTo({

            top:0,

            behavior:"smooth"

        });



    }



    catch(error){


        console.error(error);


    }



}






// =====================================================
// SEARCH SERMONS
// =====================================================


const searchBox =
document.getElementById("search");



if(searchBox){



searchBox.addEventListener(
"keyup",
function(){



    const keyword =
    this.value.toLowerCase();




    const rows =
    sermonTable.querySelectorAll(
        "tr"
    );




    rows.forEach(
        row=>{


            const text =
            row.innerText.toLowerCase();




            if(
                text.includes(keyword)
            ){


                row.style.display =
                "";


            }


            else{


                row.style.display =
                "none";


            }



        }

    );



});


}







// =====================================================
// FILTER SPEAKER
// =====================================================


const speakerFilter =
document.getElementById(
"speakerFilter"
);



if(speakerFilter){


speakerFilter.addEventListener(
"change",
function(){


const value =
this.value.toLowerCase();



const rows =
sermonTable.querySelectorAll(
"tr"
);



rows.forEach(
row=>{


const preacher =
row.children[3]
.innerText
.toLowerCase();



if(
value === "" ||
preacher === value
){


row.style.display =
"";


}

else{


row.style.display =
"none";


}



});


});



}

// =====================================================
// YEAR FILTER
// =====================================================


const yearFilter =
document.getElementById(
"yearFilter"
);



if(yearFilter){


yearFilter.addEventListener(
"change",
function(){



const year =
this.value;



const rows =
sermonTable.querySelectorAll(
"tr"
);



rows.forEach(
row=>{


const date =
row.children[4]
.innerText;



if(
year === "" ||
date.startsWith(year)
){


row.style.display =
"";


}

else{


row.style.display =
"none";


}



});



});



}






// =====================================================
// SORT SERMONS
// =====================================================


const sortFilter =
document.getElementById(
"sortFilter"
);



if(sortFilter){



sortFilter.addEventListener(
"change",
function(){



const rows =
Array.from(
sermonTable.querySelectorAll(
"tr"
)
);



rows.sort(
(a,b)=>{



const dateA =
new Date(
a.children[4].innerText
);



const dateB =
new Date(
b.children[4].innerText
);




if(this.value==="oldest"){


return dateA - dateB;


}


return dateB - dateA;



}

);



rows.forEach(
row=>{

sermonTable.appendChild(row);

}

);



});



}







// =====================================================
// CANCEL EDIT
// =====================================================


function cancelEdit(){


currentEditId = null;


resetForm();


}






// =====================================================
// RESET BUTTON
// =====================================================


const resetBtn =
document.getElementById(
"resetBtn"
);



if(resetBtn){


resetBtn.addEventListener(
"click",
()=>{


cancelEdit();


}

);


}






// =====================================================
// REFRESH BUTTON
// =====================================================


const refreshBtn =
document.getElementById(
"refreshBtn"
);



if(refreshBtn){


refreshBtn.addEventListener(
"click",
()=>{


loadSermons();


}

);


}






// =====================================================
// INITIAL LOAD
// =====================================================


