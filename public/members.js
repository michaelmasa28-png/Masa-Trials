// Load all members when the page opens
window.addEventListener("DOMContentLoaded", loadMembers);

function loadMembers() {

    fetch("/members")
        .then(response => response.json())
        .then(data => {

            const table = document.getElementById("membersTable");
            table.innerHTML = "";

            data.members.forEach(member => {

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${member.id}</td>

                    <td>
                        <img
                            src="${member.photo ? member.photo : 'images/member.png'}"
                            class="member-photo"
                            alt="Member">
                    </td>

                    <td>${member.full_name || member.username || '-'}</td>

                    <td>${member.gender ? member.gender : "-"}</td>

                    <td>${member.phone}</td>

                    <td>${member.ministry ? member.ministry : "-"}</td>

                    <td>${member.status}</td>
<td>

    <button class="approve-btn" onclick="approveMember(${member.id})">
        Approve
    </button>

 <button class="reject-btn" onclick="deleteMember(${member.id})">
    Delete
</button>
                    </td>
                `;

                table.appendChild(row);

            });

        })
        .catch(error => {

            console.error("Failed to load members:", error);

        });

}

// ===============================
// ADD MEMBER
// ===============================

document
.getElementById("addMemberBtn")
.addEventListener("click", function(){

    const full_name = prompt("Enter member full name:");

    if(!full_name){
        alert("Name required");
        return;
    }


    const phone = prompt("Enter member phone:");

    if(!phone){
        alert("Phone required");
        return;
    }


    fetch("/member/register", {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            full_name: full_name,

            phone: phone

        })

    })

    .then(response=>response.json())

    .then(data=>{

        alert(data.message);

        loadMembers();

    })

    .catch(error=>{

        console.error(error);

        alert("Unable to add member");

    });


});

function approveMember(id){

   const session = JSON.parse(
    localStorage.getItem("adminSession")
);
    if(!session || !session.token){
        alert("Admin session expired. Login again.");
        return;
    }


    fetch(`/member/${id}/approve`, {

        method:"PUT",

        headers:{
            "Authorization": `Bearer ${session.token}`
        }

    })

    .then(response=>response.json())

.then(data=>{

    console.log("APPROVE RESPONSE:", data);

    alert(
        data.message 
        ? data.message 
        : JSON.stringify(data)
    );

    loadMembers();

})

    .catch(error=>{

        console.error(error);

        alert("Approval failed");

    });

}

// ==========================================
// DELETE MEMBER
// ==========================================

function deleteMember(id){

   const session = JSON.parse(
    localStorage.getItem("adminSession")
);

    if(!session || !session.token){
        alert("Admin session expired. Login again.");
        return;
    }

    if(!confirm("Delete this member?")){
        return;
    }

    fetch(`/member/${id}`, {

        method: "DELETE",

        headers: {
            "Authorization": `Bearer ${session.token}`
        }

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        loadMembers();

    })

    .catch(error => {

        console.error(error);

        alert("Delete failed");

    });

}
