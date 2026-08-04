// =====================================================
// KINGDOM WAYS MEMBER SESSION
// =====================================================


const MEMBER_SESSION_KEY = "currentMember";


// Save logged in member

function saveMemberSession(member){

    localStorage.setItem(
        MEMBER_SESSION_KEY,
        JSON.stringify(member)
    );

}


// Get logged in member

function getCurrentMember(){

    const data = localStorage.getItem(
        MEMBER_SESSION_KEY
    );


    if(!data){

        return null;

    }


    return JSON.parse(data);

}


// Remove login

function logoutMember(){

    localStorage.removeItem(
        MEMBER_SESSION_KEY
    );


    window.location.href = "/login.html";

}


// Check login

function requireMemberLogin(){

    const member = getCurrentMember();


    if(!member){

        window.location.href="/login.html";

        return false;

    }


    return true;

}