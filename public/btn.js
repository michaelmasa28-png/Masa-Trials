// ===============================
// SERVER URL
// ===============================
console.log("BTN.JS LOADED");
const API_URL = "http://127.0.0.1:8000";



// ===============================
// MEMBER REGISTRATION
// ===============================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async function(e){
     console.log("MEMBER LOGIN BUTTON CLICKED");

        e.preventDefault();


        const full_name = document.getElementById("fullName").value;
        const phone = document.getElementById("signupPhone").value;


        const message = document.getElementById("signupMessage");


        try {

            const response = await fetch(
                `${API_URL}/member/register`,
                {
                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({
                        full_name: full_name,
                        phone: phone
                    })
                }
            );


            const data = await response.json();


            if(data.success){

                message.style.color = "green";

                message.innerHTML =
                "Registration submitted successfully. Wait for admin approval.";

                signupForm.reset();

            }
            else{

                message.style.color = "red";

                message.innerHTML =
                data.message || "Registration failed.";

            }


        }
        catch(error){

            console.error(error);

            message.style.color="red";

            message.innerHTML =
            "Server connection failed.";

        }


    });

}

// ===============================
// MEMBER LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");
console.log("LOGIN FORM FOUND:", loginForm);
if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const full_name = document
            .getElementById("loginUsername")
            .value
            .trim();

        const phone = document
            .getElementById("loginPhone")
            .value
            .trim();

        const message = document.getElementById("loginMessage");

        try {

            console.log("Sending login request...");
            console.log({
                full_name: full_name,
                phone: phone
            });

            const response = await fetch(
                `${API_URL}/member/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        full_name: full_name,
                        phone: phone
                    })
                }
            );

            console.log("Status:", response.status);

            const data = await response.json();

            console.log("Response:", data);

            if (!response.ok) {

                message.style.color = "red";
                message.innerHTML =
                    data.message || "Login failed.";

                return;
            }

            if (!data.success) {

                message.style.color = "red";
                message.innerHTML =
                    data.message || "Invalid login details.";

                return;
            }

// Save member session
localStorage.setItem(
    "member",
    JSON.stringify({
        member_id: data.member_id,
        member_number: data.member_number,
        username: data.username,
        full_name: data.full_name,
        is_active: data.is_active,
        profile_completed: data.profile_completed
    })
);

message.style.color = "#00ff88";
message.innerHTML = "Login successful...";


// ===============================
// OPEN CLIENT MODE
// ===============================

setTimeout(()=>{

    window.location.href = "clientMode.html";

},500);



} catch (error) {

    console.error(error);

    message.style.color = "red";
    message.innerHTML = "Unable to connect to server.";

}

});

}
