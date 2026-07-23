document
.getElementById("loginForm")
.addEventListener("submit", async function(e){

    e.preventDefault();


    const username = document
        .getElementById("username")
        .value.trim();


    const password = document
        .getElementById("password")
        .value;



    const message = document
        .getElementById("message");



    message.innerText = "Checking access...";



    try {


        const response = await fetch("/api/admin-login", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                username: username,

                password: password

            })

        });



        const data = await response.json();



        if(data.success){


            // Save active admin session
localStorage.setItem(
 "adminSession",
 JSON.stringify({
    admin:data.admin,
    token:data.token
 })
);


            message.innerText = "Access granted";



            setTimeout(()=>{

                window.location.href = "dashboard.html";

            },500);



        }else{


            message.innerText = data.message;


        }



    } catch(error){


        console.error(
            "Login error:",
            error
        );


        message.innerText =
        "Server connection failed";


    }


});
