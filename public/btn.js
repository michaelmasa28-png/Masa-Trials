// ======================================================
// KINGDOM WAYS PENTECOSTAL CHURCH
// BTN.JS
// PART 1 - INITIALIZATION
// ======================================================


// ======================================================
// SERVER URL
// ======================================================

const API_URL = "";

// ======================================================
// SESSION CONFIGURATION
// ======================================================

const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 Hours

const SESSION_KEY = "memberSession";

// ======================================================
// DOM ELEMENTS
// ======================================================

const signupForm = document.getElementById("signupForm");

const loginForm = document.getElementById("loginForm");

const signupMessage = document.getElementById("signupMessage");

const loginMessage = document.getElementById("loginMessage");

const signupBtn = document.getElementById("signupBtn");

const loginBtn = document.getElementById("loginBtn");

const loginLoader = document.getElementById("loginLoader");

const year = document.getElementById("year");

// ======================================================
// REMEMBER ME (convenience prefill)
// ======================================================

const REMEMBER_KEY = "rememberedMember";

const rememberedHint = document.getElementById("rememberedHint");

const rememberedName = document.getElementById("rememberedName");

const clearRemembered = document.getElementById("clearRemembered");

function rememberMember(name, phone) {

    localStorage.setItem(

        REMEMBER_KEY,

        JSON.stringify({ full_name: name, phone: phone })

    );

    prefillRemembered();

}

function prefillRemembered() {

    if (!rememberedHint) return;

    let remembered = null;

    try {

        remembered = JSON.parse(

            localStorage.getItem(REMEMBER_KEY) || "null"

        );

    }

    catch (e) {

        remembered = null;

    }

    if (!remembered || !remembered.phone) {

        rememberedHint.style.display = "none";

        return;

    }

    const phoneInput = document.getElementById("loginPhone");

    const nameInput = document.getElementById("loginUsername");

    if (phoneInput && !phoneInput.value) phoneInput.value = remembered.phone || "";

    if (nameInput && !nameInput.value) nameInput.value = remembered.full_name || "";

    if (rememberedName) rememberedName.textContent = remembered.full_name || "friend";

    rememberedHint.style.display = "block";

}

if (clearRemembered) {

    clearRemembered.addEventListener("click", function () {

        localStorage.removeItem(REMEMBER_KEY);

        if (rememberedHint) rememberedHint.style.display = "none";

    });

}

document.addEventListener("DOMContentLoaded", prefillRemembered);

// ======================================================
// FOOTER YEAR
// ======================================================

if(year){

    year.textContent = new Date().getFullYear();

}

// ======================================================
// MESSAGE HELPERS
// ======================================================

function showSuccess(element,message){

    if(!element) return;

    element.className="message-success";

    element.innerHTML=message;

}

function showError(element,message){

    if(!element) return;

    element.className="message-error";

    element.innerHTML=message;

}

function clearMessage(element){

    if(!element) return;

    element.className="";

    element.innerHTML="";

}

// ======================================================
// LOADER HELPERS
// ======================================================

function startLoading(){

    if(loginLoader){

        loginLoader.style.display="block";

    }

    if(loginBtn){

        loginBtn.disabled=true;

        loginBtn.classList.add("loading");

    }

}

function stopLoading(){

    if(loginLoader){

        loginLoader.style.display="none";

    }

    if(loginBtn){

        loginBtn.disabled=false;

        loginBtn.classList.remove("loading");

    }

}

// ======================================================
// SESSION HELPERS
// ======================================================

function saveMemberSession(member){

    const session={

        ...member,

        loginTime:Date.now(),

        expiresAt:Date.now()+SESSION_DURATION

    };

    localStorage.setItem(

        SESSION_KEY,

        JSON.stringify(session)

    );

}

function getMemberSession(){

    const data=localStorage.getItem(SESSION_KEY);

    if(!data) return null;

    try{

        return JSON.parse(data);

    }

    catch{

        localStorage.removeItem(SESSION_KEY);

        return null;

    }

}

function clearMemberSession(){

    localStorage.removeItem(SESSION_KEY);

}

// ======================================================
// AUTO LOGIN
// ======================================================

(function(){

    const session=getMemberSession();

    if(!session) return;

    if(Date.now()>session.expiresAt){

        clearMemberSession();

        return;

    }

    window.location.href="clientMode.html";

})();

// ======================================================
// MEMBER REGISTRATION
// ======================================================

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        clearMessage(signupMessage);

        const full_name = document
            .getElementById("fullName")
            .value
            .trim();

        const phone = document
            .getElementById("signupPhone")
            .value
            .trim();

        if (!full_name || !phone) {

            showError(

                signupMessage,

                "Please complete all required fields."

            );

            return;

        }

        if (signupBtn) {

            signupBtn.disabled = true;

            signupBtn.innerHTML = "Submitting...";

        }

        try {

            const controller = new AbortController();

            const timeout = setTimeout(() => {

                controller.abort();

            }, 15000);

            const response = await fetch(

                `${API_URL}/member/register`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        full_name,

                        phone

                    }),

                    signal: controller.signal

                }

            );

            clearTimeout(timeout);

            const data = await response.json();

            if (response.ok && data.success) {

                showSuccess(

                    signupMessage,

                    "✅ Registration submitted successfully. Please wait for church administration approval."

                );

                signupForm.reset();

            }

            else {

                showError(

                    signupMessage,

                    data.message ||

                    "Registration failed."

                );

            }

        }

        catch (error) {

            console.error(

                "Registration Error:",

                error

            );

            if (error.name === "AbortError") {

                showError(

                    signupMessage,

                    "Request timed out. Please try again."

                );

            }

            else {

                showError(

                    signupMessage,

                    "Unable to connect to the server."

                );

            }

        }

        finally {

            if (signupBtn) {

                signupBtn.disabled = false;

                signupBtn.innerHTML = "Submit Registration";

            }

        }

    });

}

// ======================================================
// MEMBER LOGIN
// ======================================================

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        clearMessage(loginMessage);

        const full_name = document
            .getElementById("loginUsername")
            .value
            .trim();

        const phone = document
            .getElementById("loginPhone")
            .value
            .trim();

        if (!full_name || !phone) {

            showError(

                loginMessage,

                "Please enter your full name and phone number."

            );

            return;

        }

        startLoading();

        try {

            const controller = new AbortController();

            const timeout = setTimeout(() => {

                controller.abort();

            },15000);

            const response = await fetch(

                `${API_URL}/member/login`,

                {

                    method:"POST",

                    headers:{

                        "Content-Type":"application/json"

                    },

                    body:JSON.stringify({

                        full_name,

                        phone

                    }),

                    signal:controller.signal

                }

            );

            clearTimeout(timeout);

            const data = await response.json();

            if(!response.ok){

                showError(

                    loginMessage,

                    data.message || "Login failed."

                );

                return;

            }

            if(!data.success){

                showError(

                    loginMessage,

                    data.message || "Invalid login details."

                );

                return;

            }

            // =============================
            // SAVE 6-HOUR SESSION
            // =============================

            saveMemberSession({

                member_id:data.member_id,

                member_number:data.member_number,

                username:data.username,

                full_name:data.full_name,

                phone:data.phone,

                gender:data.gender,

                photo:data.photo,

                is_active:data.is_active,

                profile_completed:data.profile_completed,

                access_token:data.access_token

            });

            rememberMember(data.full_name || full_name, data.phone || phone);

            showSuccess(

                loginMessage,

                "Login successful. Redirecting..."

            );

            setTimeout(()=>{

                window.location.href="clientMode.html";

            },700);

        }

        catch(error){

            console.error(

                "Login Error:",

                error

            );

            if(error.name==="AbortError"){

                showError(

                    loginMessage,

                    "Server took too long to respond."

                );

            }

            else{

                showError(

                    loginMessage,

                    "Unable to connect to the server."

                );

            }

        }

        finally{

            stopLoading();

        }

    });

}

// ======================================================
// PART 4 - USER EXPERIENCE
// ======================================================

// ==========================================
// Auto Hide Messages
// ==========================================

function autoHideMessage(element,time=5000){

    if(!element) return;

    setTimeout(()=>{

        element.innerHTML="";

        element.className="";

    },time);

}

// ==========================================
// Improve showSuccess()
// ==========================================

const originalShowSuccess = showSuccess;

showSuccess = function(element,message){

    originalShowSuccess(element,message);

    autoHideMessage(element);

};

// ==========================================
// Improve showError()
// ==========================================

const originalShowError = showError;

showError = function(element,message){

    originalShowError(element,message);

    autoHideMessage(element,7000);

};

// ==========================================
// ENTER KEY SUPPORT
// ==========================================

document.querySelectorAll("input").forEach(input=>{

    input.addEventListener("keypress",e=>{

        if(e.key==="Enter"){

            const form=input.closest("form");

            if(form){

                form.requestSubmit();

            }

        }

    });

});

// ==========================================
// Remove message while typing
// ==========================================

document.querySelectorAll("input").forEach(input=>{

    input.addEventListener("input",()=>{

        clearMessage(signupMessage);

        clearMessage(loginMessage);

    });

});

// ==========================================
// Trim spaces automatically
// ==========================================

document.querySelectorAll("input").forEach(input=>{

    input.addEventListener("blur",()=>{

        input.value=input.value.trim();

    });

});

// ==========================================
// Phone Number Validation
// ==========================================

const phoneInputs=document.querySelectorAll(

    "#signupPhone,#loginPhone"

);

phoneInputs.forEach(input=>{

    input.addEventListener("input",()=>{

        input.value=input.value.replace(

            /[^0-9]/g,

            ""

        );

    });

});

// ==========================================
// Prevent Double Form Submission
// ==========================================

let submitting=false;

document.querySelectorAll("form").forEach(form=>{

    form.addEventListener("submit",()=>{

        if(submitting){

            event.preventDefault();

            return;

        }

        submitting=true;

        setTimeout(()=>{

            submitting=false;

        },3000);

    });

});

// ==========================================
// Connection Status
// ==========================================

window.addEventListener("offline",()=>{

    showError(

        loginMessage,

        "No internet connection."

    );

});

window.addEventListener("online",()=>{

});

// ==========================================
// Console Signature
// ==========================================



// ======================================================
// PART 5 - SESSION PROTECTION
// ======================================================

// ==========================================
// Session Validation
// ==========================================

function isSessionValid(){

    const session = getMemberSession();

    if(!session){

        return false;

    }

    if(Date.now() >= session.expiresAt){

        clearMemberSession();

        return false;

    }

    return true;

}

// ==========================================
// Remaining Session Time
// ==========================================

function getRemainingSessionTime(){

    const session = getMemberSession();

    if(!session){

        return 0;

    }

    return Math.max(

        0,

        session.expiresAt - Date.now()

    );

}

// ==========================================
// Extend Session
// Call this whenever the user performs an action.
// ==========================================

function refreshSession(){

    const session = getMemberSession();

    if(!session){

        return;

    }

    session.expiresAt =

        Date.now() + SESSION_DURATION;

    localStorage.setItem(

        SESSION_KEY,

        JSON.stringify(session)

    );

}

// ==========================================
// Logout
// ==========================================

function logoutMember(){

    clearMemberSession();

    window.location.href = "btn.html";

}

// ==========================================
// Check Session Every Minute
// ==========================================

setInterval(()=>{

    if(!isSessionValid()){

        return;

    }

},60000);

// ==========================================
// Refresh Session On Activity
// ==========================================

[

"click",

"keydown",

"mousemove",

"touchstart"

].forEach(eventName=>{

    document.addEventListener(

        eventName,

        ()=>{

            if(isSessionValid()){

                refreshSession();

            }

        },

        {

            passive:true

        }

    );

});

// ==========================================
// Before Leaving Page
// ==========================================

window.addEventListener(

    "beforeunload",

    ()=>{

        if(isSessionValid()){

            refreshSession();

        }

    }

);

// ==========================================
// Welcome Message
// ==========================================

const currentSession = getMemberSession();

if(currentSession){



}

// ==========================================
// Expose Utilities
// ==========================================

window.memberSession = {

    isSessionValid,

    getMemberSession,

    getRemainingSessionTime,

    refreshSession,

    logoutMember,

    clearMemberSession

};

// ==========================================
// Finished
// ==========================================

