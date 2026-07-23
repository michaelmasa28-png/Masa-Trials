// =====================================
// Kingdom Ways CMS
// Attendance Management JS
// =====================================


// ===============================
// ELEMENTS
// ===============================


const todayDate = document.getElementById("todayDate");

const attendanceTable =
document.getElementById("attendanceTable");


const offlineTable =
document.getElementById("offlineMembersTable");


const presentToday =
document.getElementById("presentToday");


const notChecked =
document.getElementById("notChecked");


const approvedMembers =
document.getElementById("approvedMembers");


const attendanceRate =
document.getElementById("attendanceRate");



const attendanceDate =
document.getElementById("attendanceDate");




// ===============================
// SHOW DATE
// ===============================


function showDate(){


    const date = new Date();


    todayDate.textContent =
    date.toDateString();


    if(attendanceDate){

        attendanceDate.value =
        date.toISOString().split("T")[0];

    }


}


showDate();







// ===============================
// LOAD ATTENDANCE
// ===============================


async function loadAttendance(){


try{


    /*
       Later this connects to:

       GET /api/attendance/today

       Example response:

       [
          {
            name:"John Peter",
            time_in:"08:15",
            time_out:null
          }
       ]

    */


    const response =
    await fetch("/api/attendance/today");



    if(!response.ok){

        throw new Error("Attendance API unavailable");

    }



    const data =
    await response.json();



    displayAttendance(data);



}



catch(error){


    console.log(
    "Attendance waiting for backend:",
    error.message
    );


    emptyAttendance();


}



}









// ===============================
// DISPLAY ATTENDANCE
// ===============================


function displayAttendance(data){



    attendanceTable.innerHTML="";



    if(data.length === 0){


        emptyAttendance();

        return;

    }






    data.forEach((member,index)=>{



        const row =
        document.createElement("tr");



        row.innerHTML = `


        <td>${index+1}</td>


        <td>${member.name}</td>


        <td>${member.time_in}</td>


        <td>

        ${member.time_out || "--"}

        </td>


        <td>

        <button onclick="viewHistory(${member.id})">

        History

        </button>

        </td>


        `;



        attendanceTable.appendChild(row);



    });



    presentToday.textContent =
    data.length;



}









// ===============================
// EMPTY TABLE
// ===============================


function emptyAttendance(){


attendanceTable.innerHTML = `


<tr>

<td colspan="5">

No attendance records today

</td>

</tr>


`;


presentToday.textContent = 0;



}









// ===============================
// LOAD APPROVED MEMBERS NOT ONLINE
// ===============================



async function loadUnavailableMembers(){



try{


const response =
await fetch("http://127.0.0.1:8000/attendance/today");



if(!response.ok){

throw new Error();

}



const members =
await response.json();



displayUnavailable(data.offline);



}



catch(error){


console.log(
"Unavailable members waiting for backend"
);



offlineTable.innerHTML = `

<tr>

<td colspan="3">

No unavailable members

</td>

</tr>

`;


}



}








function displayUnavailable(members){



offlineTable.innerHTML="";



if(members.length===0){


offlineTable.innerHTML = `

<tr>

<td colspan="3">

No unavailable members

</td>

</tr>

`;


return;


}





members.forEach((member,index)=>{



const row =
document.createElement("tr");



row.innerHTML = `


<td>
${index+1}
</td>


<td>
${member.name}
</td>


<td>
${member.last_seen || "Never"}
</td>


`;



offlineTable.appendChild(row);



});



notChecked.textContent =
members.length;



}









// ===============================
// APPROVED MEMBERS COUNT
// ===============================


async function loadApprovedCount(){



try{


const response =
await fetch("/api/members/approved/count");



const data =
await response.json();



approvedMembers.textContent =
data.count;



}



catch{


approvedMembers.textContent = 0;


}



}









// ===============================
// ATTENDANCE HISTORY
// ===============================


function viewHistory(memberId){


alert(
"Attendance history will open for member ID: "
+ memberId
);


}









// ===============================
// EXPORT BUTTONS
// ===============================


document
.querySelectorAll(".export-section button")
.forEach(button=>{


button.addEventListener("click",()=>{


alert(
"Export feature will connect to PDF/Excel later"
);


});


});









// ===============================
// DATE CHANGE
// ===============================


attendanceDate.addEventListener(
"change",
()=>{


loadAttendance();


});








// ===============================
// AUTO REFRESH
// ===============================


// refresh every 5 seconds

setInterval(()=>{


loadAttendance();

loadUnavailableMembers();


},5000);







// ===============================
// START
// ===============================


loadAttendance();

loadUnavailableMembers();

loadApprovedCount();

window.addEventListener("DOMContentLoaded", loadAttendance);

async function loadAttendance() {

    const res = await fetch("/attendance/today");
    const data = await res.json();

    document.getElementById("presentToday").textContent =
        data.present_today;

    document.getElementById("approvedMembers").textContent =
        data.total_approved;

    document.getElementById("notChecked").textContent =
        data.not_checked;

    const table = document.getElementById("attendanceTable");
    table.innerHTML = "";

    if(data.present.length === 0){
        table.innerHTML =
        "<tr><td colspan='5'>No attendance records today</td></tr>";
    }else{

        data.present.forEach((member,index)=>{

            table.innerHTML += `
            <tr>
                <td>${index+1}</td>
                <td>${member.full_name}</td>
                <td>${member.time_in}</td>
                <td>${member.time_out || "-"}</td>
                <td>Present</td>
            </tr>`;
        });

    }

    const offline = document.getElementById("offlineMembersTable");
    offline.innerHTML = "";

    if(data.offline.length===0){

        offline.innerHTML =
        "<tr><td colspan='3'>Everyone checked in today</td></tr>";

    }else{

        data.offline.forEach((member,index)=>{

            offline.innerHTML += `
            <tr>
                <td>${index+1}</td>
                <td>${member.full_name}</td>
                <td>${member.last_seen || "Never"}</td>
            </tr>`;
        });

    }

    const percent =
        data.total_approved == 0
        ? 0
        : Math.round(
            (data.present_today /
            data.total_approved) * 100
        );

    document.getElementById("attendanceRate").textContent =
        percent + "%";
}

// ==============================
// Attendance Dashboard
// ==============================

window.addEventListener("DOMContentLoaded", () => {

    document.getElementById("todayDate").textContent =
        new Date().toDateString();

    loadAttendance();

});

async function loadAttendance() {

    try {

        const response = await fetch("/attendance/today");
        const data = await response.json();

        // Summary cards
        document.getElementById("presentToday").textContent =
            data.present_today;

        document.getElementById("notChecked").textContent =
            data.not_checked;

        document.getElementById("approvedMembers").textContent =
            data.approved_members;

        // ===========================
        // Present Members Table
        // ===========================

        const attendanceTable =
            document.getElementById("attendanceTable");

        attendanceTable.innerHTML = "";

        if (data.attendance.length === 0) {

            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="5">
                        No attendance records today
                    </td>
                </tr>
            `;

        } else {

            data.attendance.forEach((member, index) => {

                attendanceTable.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${member.full_name}</td>
                        <td>${member.time_in || "-"}</td>
                        <td>${member.time_out || "-"}</td>
                        <td>
                            <span style="color:green;font-weight:bold;">
                                Present
                            </span>
                        </td>
                    </tr>
                `;

            });

        }

        // ===========================
        // Offline Members
        // ===========================

        const offlineTable =
            document.getElementById("offlineMembersTable");

        offlineTable.innerHTML = "";

        if (data.offline.length === 0) {

            offlineTable.innerHTML = `
                <tr>
                    <td colspan="3">
                        Everyone has checked in
                    </td>
                </tr>
            `;

        } else {

            data.offline.forEach((member, index) => {

                offlineTable.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${member.full_name}</td>
                        <td>${member.last_seen || "Never"}</td>
                    </tr>
                `;

            });

        }

        // ===========================
        // Attendance Rate
        // ===========================

        const rate = data.approved_members === 0
            ? 0
            : Math.round(
                (data.present_today / data.approved_members) * 100
            );

        document.getElementById("attendanceRate").textContent =
            rate + "%";

    }

    catch (err) {

        console.error(err);

    }

}
