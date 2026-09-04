// =====================================
// Kingdom Ways CMS
// Attendance Management JS
// =====================================

// XSS sanitize
function escapeHtml(val) {
    return String(val == null ? "" : val).replace(/[&<>"']/g, function(c) {
        return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c];
    });
}


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

    if(todayDate){
        todayDate.textContent =
        date.toDateString();
    }

    if(attendanceDate){

        attendanceDate.value =
        date.toISOString().split("T")[0];

    }

}

showDate();


// ===============================
// APPROVED MEMBERS COUNT
// ===============================

async function loadApprovedCount(){

    try{

        const response =
        await fetch("/members/approved/count");


        const data =
        await response.json();


        if(approvedMembers){

            approvedMembers.textContent =
            data.count;

        }

    }

    catch(error){

        if(approvedMembers){

            approvedMembers.textContent = 0;

        }

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

if(attendanceDate){

    attendanceDate.addEventListener(
        "change",
        ()=>{

            loadAttendance();

        }
    );

}


// ===============================
// AUTO REFRESH
// ===============================

setInterval(()=>{

    loadAttendance();

},5000);


// ===============================
// START
// ===============================

loadAttendance();

loadApprovedCount();


window.addEventListener(
    "DOMContentLoaded",
    ()=>{

        if(todayDate){

            todayDate.textContent =
            new Date().toDateString();

        }

        loadAttendance();

    }
);


// ===============================
// LOAD ATTENDANCE
// ===============================

async function loadAttendance(){

    try{

        const response =
        await fetch("/attendance/today");


        if(!response.ok){

            throw new Error(
                "Attendance API unavailable"
            );

        }


        const data =
        await response.json();

        // ===========================
        // SUMMARY CARDS
        // ===========================

        if(presentToday){

            presentToday.textContent =
            data.present_today;

        }


        if(notChecked){

            notChecked.textContent =
            data.not_checked;

        }


        if(approvedMembers){

            approvedMembers.textContent =
            data.approved_members;

        }


        // ===========================
        // PRESENT MEMBERS TABLE
        // ===========================

        if(attendanceTable){

            attendanceTable.innerHTML = "";


            if(data.attendance.length === 0){

                attendanceTable.innerHTML = `

                <tr>
                    <td colspan="5">
                        No attendance records today
                    </td>
                </tr>

                `;

            }

            else{

                data.attendance.forEach(
                (member,index)=>{


                    attendanceTable.innerHTML += `

                    <tr>

                        <td>${index + 1}</td>

                        <td>
                            ${escapeHtml(member.full_name)}
                        </td>

                        <td>
                            ${escapeHtml(member.time_in || "-")}
                        </td>

                        <td>
                            ${escapeHtml(member.time_out || "-")}
                        </td>

                        <td>
                            <span style="color:green;font-weight:bold;">
                                Present
                            </span>
                        </td>

                    </tr>

                    `;


                });


            }

        }

        // ===========================
        // OFFLINE MEMBERS
        // ===========================

        if(offlineTable){

            offlineTable.innerHTML = "";


            if(data.offline.length === 0){

                offlineTable.innerHTML = `

                <tr>
                    <td colspan="3">
                        Everyone has checked in
                    </td>
                </tr>

                `;

            }

            else{

                data.offline.forEach(
                (member,index)=>{


                    offlineTable.innerHTML += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(member.full_name)}
                        </td>

                        <td>
                            ${escapeHtml(member.last_seen || "Never")}
                        </td>

                    </tr>

                    `;


                });


            }

        }


        // ===========================
        // ATTENDANCE RATE
        // ===========================

        const rate =
        data.approved_members === 0
        ? 0
        : Math.round(
            (data.present_today /
            data.approved_members) * 100
        );


        if(attendanceRate){

            attendanceRate.textContent =
            rate + "%";

        }


    }


    catch(error){

        console.error(
            "Attendance error:",
            error
        );

    }

}
