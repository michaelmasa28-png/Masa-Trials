// Load all members when the page opens
window.addEventListener("DOMContentLoaded", loadMembers);

function getToken() {
    const session = JSON.parse(localStorage.getItem("adminSession") || "{}");
    return session.token || "";
}

function loadMembers() {

    fetch("/members", {
        headers: { "Authorization": `Bearer ${getToken()}` }
    })
        .then(response => response.json())
        .then(data => {

            const table = document.getElementById("membersTable");
            if (!table) return;
            table.innerHTML = "";

            if (!data.members) {
                table.innerHTML = '<tr><td colspan="8">No members found</td></tr>';
                return;
            }

            data.members.forEach(member => {

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td data-label="ID">${member.id}</td>

                    <td data-label="Photo">
                        <img
                            src="${member.photo ? member.photo : 'images/member.png'}"
                            class="member-photo"
                            alt="Member">
                    </td>

                    <td data-label="Username">${member.full_name || member.username || '-'}</td>

                    <td data-label="Gender">${member.gender ? member.gender : "-"}</td>

                    <td data-label="Phone">${member.phone}</td>

                    <td data-label="Ministry">${member.ministry ? member.ministry : "-"}</td>

                    <td data-label="Status">${member.status}</td>
                    <td data-label="Actions">

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

const addMemberBtn = document.getElementById("addMemberBtn");
if (addMemberBtn) {
    addMemberBtn.addEventListener("click", function(){

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
}

function approveMember(id){

    fetch(`/member/${id}/approve`, {

        method:"PUT",

        headers:{
            "Authorization": `Bearer ${getToken()}`
        }

    })

    .then(response=>response.json())

.then(data=>{

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

    if(!confirm("Delete this member?")){
        return;
    }

    fetch(`/member/${id}`, {

        method: "DELETE",

        headers: {
            "Authorization": `Bearer ${getToken()}`
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
