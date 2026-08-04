// ======================================================
// KINGDOM WAYS MEMBER SESSION
// ======================================================


const MEMBER_SESSION_KEY = "memberSession";


// GET CURRENT MEMBER

function getCurrentMember(){

    const data = localStorage.getItem(
        MEMBER_SESSION_KEY
    );


    if(!data){

        return null;

    }


    try{

        return JSON.parse(data);

    }

    catch(error){

        console.error(
            "Session error",
            error
        );

        return null;

    }

}



// REQUIRE LOGIN

function requireMember(){

    const member = getCurrentMember();


    if(!member){

        window.location.href="btn.html";

        return null;

    }


    return member;

}



// EXPORT

window.currentMember = {

    getCurrentMember,

    requireMember

};


console.log(
    "✅ Member session loader ready"
);