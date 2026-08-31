// ======================================================
// KINGDOM WAYS CHURCH
// GIVING PORTAL
// PART 1
// ======================================================


// ======================================================
// CONFIGURATION
// ======================================================

const API = "";

const API_BASE = "/api/finance";


// ======================================================
// ELEMENTS
// ======================================================

const memberPhoto =
document.getElementById("memberPhoto");

const memberName =
document.getElementById("memberName");

const memberNumber =
document.getElementById("memberNumber");

const registeredPhone =
document.getElementById("registeredPhone");

const optionalPhone =
document.getElementById("optionalPhone");

const useDifferentPhone =
document.getElementById("useDifferentPhone");

const amount =
document.getElementById("amount");

const category =
document.getElementById("category");

const givingAccount =
document.getElementById("givingAccount");

const accountHint =
document.getElementById("accountHint");

const notes =
document.getElementById("notes");

const paymentForm =
document.getElementById("paymentForm");

const paymentModal =
document.getElementById("paymentModal");

const confirmBtn =
document.getElementById("confirmBtn");

const cancelBtn =
document.getElementById("cancelBtn");

const payBtn =
document.getElementById("payBtn");

const paymentStatus =
document.getElementById("paymentStatus");

const waitingCard =
document.getElementById("waitingCard");

const successCard =
document.getElementById("successCard");

const failedCard =
document.getElementById("failedCard");

const receiptCard =
document.getElementById("receiptCard");

const toast =
document.getElementById("toast");


// ======================================================
// CURRENT MEMBER
// ======================================================

let currentMember = null;


// ======================================================
// PAYMENT OBJECT
// ======================================================

let payment = {

    member_id:null,

    member_number:"",

    member_name:"",

    registered_phone:"",

    phone_used:"",

    amount:0,

    category:"",

    account_type:"",

    account_number:"",

    notes:"",

    transaction_id:"",

    checkout_request_id:"",

    mpesa_receipt:"",

    safaricom_name:"",

    status:"Pending"

};


// ======================================================
// LOAD MEMBER SESSION
// ======================================================

function loadMemberSession(){

    const saved =

        localStorage.getItem("memberSession");

    if(!saved){

        showToast(

            "Please login first.",

            "error"

        );

        setTimeout(()=>{

            location.href="btn.html";

        },1500);

        return;

    }

    try{

        currentMember = JSON.parse(saved);

    }

    catch(e){

        localStorage.removeItem("memberSession");

        showToast(

            "Session error. Please login again.",

            "error"

        );

        setTimeout(()=>{

            location.href="btn.html";

        },1500);

        return;

    }

    if(currentMember.expiresAt && Date.now() > currentMember.expiresAt){

        localStorage.removeItem("memberSession");

        showToast(

            "Session expired. Please login again.",

            "error"

        );

        setTimeout(()=>{

            location.href="btn.html";

        },1500);

        return;

    }

    console.log(currentMember);

    populateMember();

}


// ======================================================
// DISPLAY MEMBER
// ======================================================

function populateMember(){

    if(!currentMember) return;


    if(memberName){

        memberName.textContent =

            currentMember.full_name ||

            currentMember.name ||

            "Member";

    }


    if(memberNumber){

        memberNumber.textContent =

            currentMember.member_number ||

            "--";

    }


    if(registeredPhone){

        registeredPhone.value =

            currentMember.phone ||

            "";

    }


    if(memberPhoto){

        memberPhoto.src =

            currentMember.photo ||

            "images/default-user.png";

        memberPhoto.onerror=function(){

            this.src="images/default-user.png";

        };

    }


    payment.member_id =

        currentMember.member_id ||

        currentMember.id ||

        null;

    payment.member_number =

        currentMember.member_number;

    payment.member_name =

        currentMember.full_name;

    payment.registered_phone =

        currentMember.phone;

}



// ======================================================
// PHONE SWITCH
// ======================================================

if(useDifferentPhone){

    useDifferentPhone.addEventListener(

        "change",

        ()=>{

            optionalPhone.disabled =

                !useDifferentPhone.checked;

            if(!useDifferentPhone.checked){

                optionalPhone.value="";

            }

            refreshSummary();

        }

    );

}



// ======================================================
// SHOW TOAST
// ======================================================

function showToast(message,type="success"){

    if(!toast) return;

    toast.innerHTML=message;

    toast.classList.add("show");

    if(type==="error"){

        toast.style.background="#dc2626";

    }else{

        toast.style.background="";

    }

    setTimeout(()=>{

        toast.classList.remove("show");

    },3500);

}



// ======================================================
// GET PHONE TO USE
// ======================================================

function getPaymentPhone(){

    if(

        useDifferentPhone.checked &&

        optionalPhone.value.trim()!=="")

    {

        return optionalPhone.value.trim();

    }

    return currentMember.phone;

}



// ======================================================
// IMPORTANT SECURITY NOTE
// ======================================================
//
// The member name shown here is ONLY
// for church reference.
//
// AFTER M-PESA PAYMENT,
// THE BACKEND MUST REPLACE:
//
// paymentData.safaricom_name
//
// with the EXACT official name
// returned by Safaricom.
//
// Example:
//
// "MASA MICHAEL MUNGAI"
//
// NEVER trust browser data.
//
// Finance should record:
//
// • Member Number
// • Logged in Member
// • Registered Phone
// • Phone Used
// • Safaricom Registered Name
// • Mpesa Receipt
// • Amount
// • Category
// • Date
//
// The Safaricom Name becomes
// the official payer name.
//
// ======================================================



// ======================================================
// START (REMOVED - Part 6 has initializeGivingPortal)
// ======================================================

// ======================================================
// RESTORED UTILITIES (phone validation, summary, thank-you)
// These are used by later parts but were only defined in
// the removed duplicate draft, so they're kept here.
// ======================================================

// ======================================================
// VALIDATE PHONE
// ======================================================

function validPhone(phone){

    phone =

    phone.replace(/\s+/g,"");

    if(phone.startsWith("+254")){

        return true;

    }

    if(phone.startsWith("254")){

        return true;

    }

    if(phone.startsWith("07")){

        return true;

    }

    if(phone.startsWith("01")){

        return true;

    }

    return false;

}



// ======================================================
// NORMALIZE PHONE
// 07XXXXXXXX
// 01XXXXXXXX
// +2547XXXX
// 2547XXXX
// becomes
// 2547XXXXXXXX
// ======================================================

function normalizePhone(phone){

    phone =

    phone.replace(/\s+/g,"");

    if(phone.startsWith("+254")){

        return phone.substring(1);

    }

    if(phone.startsWith("07")){

        return "254"+phone.substring(1);

    }

    if(phone.startsWith("01")){

        return "254"+phone.substring(1);

    }

    return phone;

}

// ======================================================
// REFRESH MEMBER SUMMARY
// ======================================================

function refreshSummary(){

    document.getElementById(

    "summaryAmount"

    ).textContent =

    formatMoney(

    payment.amount || 0

    );



    document.getElementById(

    "summaryCategory"

    ).textContent =

    payment.category ||

    "--";



    const shownPhone =

    getLiveSummaryPhone();



    document.getElementById(

    "summaryPhone"

    ).textContent =

    shownPhone ||

    "--";

}

// ======================================================
// LIVE SUMMARY PHONE
// Shows the actual number that will be charged, updating
// as the user types or checks "Use another M-Pesa number".
// ======================================================

function getLiveSummaryPhone(){

    if(!useDifferentPhone){

        return payment.registered_phone || "";

    }

    if(useDifferentPhone.checked){

        const alt =

        optionalPhone.value.trim();

        if(alt){

            return alt;

        }

        return "Another number...";

    }

    return payment.registered_phone || "";

}

function showVerifiedThankYou(memberName, category){

    const overlay = document.createElement("div");

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:999999;
        display:flex;
        justify-content:center;
        align-items:center;
        overflow:hidden;
        background:
        radial-gradient(circle at center,#1d4ed8,#0f172a 75%);
        animation:kwOverlayFade .6s ease;
    `;


    // Floating lights
    for(let i=0;i<35;i++){

        const star=document.createElement("div");

        star.style.cssText=`
            position:absolute;
            width:${Math.random()*8+4}px;
            height:${Math.random()*8+4}px;
            border-radius:50%;
            background:rgba(255,215,0,.8);
            left:${Math.random()*100}%;
            top:${Math.random()*100}%;
            box-shadow:0 0 18px gold;
            animation:
            kwFloat ${6+Math.random()*5}s linear infinite;
        `;

        overlay.appendChild(star);

    }


    const card=document.createElement("div");

    card.style.cssText=`
        width:min(92%,650px);
        border-radius:34px;
        padding:45px;
        text-align:center;
        color:white;
        background:
        linear-gradient(
        145deg,
        rgba(255,255,255,.10),
        rgba(255,255,255,.04)
        );
        backdrop-filter:blur(14px);
        border:1px solid rgba(255,255,255,.18);
        box-shadow:
        0 40px 90px rgba(0,0,0,.45);
        animation:kwCardPop .8s ease;
    `;

    card.innerHTML=`

        <div style="
            font-size:90px;
            animation:kwCross 3s ease-in-out infinite;
            margin-bottom:18px;
        ">
            ✝
        </div>

        <div style="
            font-size:42px;
            font-weight:800;
            color:#FFD54F;
            margin-bottom:8px;
            letter-spacing:2px;
        ">
            THANK YOU
        </div>

        <div style="
            font-size:28px;
            font-weight:700;
            margin-bottom:20px;
        ">
            ${memberName}
        </div>

        <div style="
            font-size:20px;
            line-height:2;
            color:#eef6ff;
        ">

            Your

            <span style="
                color:#FFD54F;
                font-weight:800;
            ">
                ${category}
            </span>

            has been successfully received
            and securely recorded.

        </div>

        <div style="
            margin-top:28px;
            font-size:17px;
            line-height:1.9;
            color:#9ef7c9;
            font-style:italic;
        ">

            "God loves a cheerful giver."

            <br>

            <strong>

                2 Corinthians 9:7

            </strong>

        </div>

        <div style="
            margin-top:28px;
            color:#ffffff;
            font-size:16px;
            opacity:.9;
        ">

            Thank you for supporting the work of God at

            <br>

            <strong style="
                color:#FFD54F;
                font-size:18px;
            ">

                Kingdom Ways Pentecostal Church

            </strong>

        </div>

    `;

    overlay.appendChild(card);

    document.body.appendChild(overlay);


    setTimeout(()=>{

        overlay.style.transition="1s";

        overlay.style.opacity="0";

        overlay.style.transform="scale(1.03)";

        setTimeout(()=>{

            overlay.remove();

        },1000);

    },6000);

}



// ======================================================
// ANIMATIONS
// ======================================================

const verifiedStyle=document.createElement("style");

verifiedStyle.innerHTML=`

@keyframes kwOverlayFade{

from{

opacity:0;

}

to{

opacity:1;

}

}

@keyframes kwCardPop{

0%{

opacity:0;

transform:scale(.55) rotate(-6deg);

}

60%{

transform:scale(1.05);

}

100%{

opacity:1;

transform:scale(1);

}

}

@keyframes kwCross{

0%,100%{

transform:translateY(0) scale(1);

filter:drop-shadow(0 0 18px gold);

}

50%{

transform:translateY(-10px) scale(1.12);

filter:drop-shadow(0 0 40px gold);

}

}

@keyframes kwFloat{

0%{

transform:translateY(0);

opacity:.2;

}

50%{

opacity:1;

}

100%{

transform:translateY(-120px);

opacity:0;

}

}

`;

document.head.appendChild(verifiedStyle);


// ======================================================
// KINGDOM WAYS CHURCH CMS
// OFFERING.JS
// PART 2
// Category Selection, Validation & Confirmation Modal
// ======================================================

// ======================================================
// CATEGORY SELECTION
// ======================================================

const categoryCards = document.querySelectorAll(".category-card");

categoryCards.forEach(card => {

    card.addEventListener("click", () => {

        categoryCards.forEach(item => {

            item.classList.remove("active");

        });

        card.classList.add("active");

        const radio = card.querySelector("input[type='radio']");

        if (!radio) return;

        radio.checked = true;

        payment.category = radio.value;

        if (category) {

            category.value = radio.value;

        }

        refreshSummary();

    });

});

// ======================================================
// LIVE AMOUNT UPDATE
// ======================================================

if (amount) {

    amount.addEventListener("input", () => {

        refreshSummary();

    });

}

// ======================================================
// LIVE NOTES UPDATE
// ======================================================

if (notes) {

    notes.addEventListener("input", () => {

        payment.notes = notes.value.trim();

    });

}

// ======================================================
// OPTIONAL PHONE UPDATE
// ======================================================

if (optionalPhone) {

    optionalPhone.addEventListener("input", () => {

        refreshSummary();

    });

}

// ======================================================
// LOAD GIVING ACCOUNTS
// ======================================================

async function loadGivingAccounts() {

    if (!givingAccount) return;

    try {

        const response = await fetch("/api/giving-accounts");

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error("Unable to load giving accounts.");

        }

        const accounts = data.accounts || [];

        givingAccount.innerHTML = "";

        const placeholder = document.createElement("option");

        placeholder.value = "";

        placeholder.textContent = "-- Select receiving account --";

        givingAccount.appendChild(placeholder);

        accounts.forEach(account => {

            const option = document.createElement("option");

            option.value = account.id;

            option.dataset.type = account.account_type;

            option.dataset.number = account.number;

            option.dataset.name = account.account_name || account.name;

            option.textContent = account.name +
                (account.account_name ? " (" + account.account_name + ")" : "");

            givingAccount.appendChild(option);

        });

    }

    catch (error) {

        console.error(error);

        if (accountHint) {

            accountHint.textContent =
                "No giving accounts configured yet.";

        }

    }

}

function onGivingAccountChange() {

    if (!givingAccount) {

        payment.account_type = "paybill";

        payment.account_number = "";

        return;

    }

    const option = givingAccount.selectedOptions[0];

    payment.account_type = option ? option.dataset.type : "";

    payment.account_number = option ? option.dataset.number : "";

    if (accountHint) {

        if (option && option.dataset.type === "paybill") {

            accountHint.textContent =
                "M-Pesa prompt will be sent to PayBill " +
                option.dataset.number + ".";

        }

        else if (option && option.dataset.type === "phone") {

            accountHint.textContent =
                "Pay directly to M-Pesa " + option.dataset.number +
                " and confirm on your phone.";

        }

        else {

            accountHint.textContent = "";

        }

    }

}

if (givingAccount) {

    givingAccount.addEventListener("change", onGivingAccountChange);

}

// ======================================================
// VALIDATE PAYMENT
// ======================================================

function validatePayment() {

    payment.amount = Number(amount.value);

    payment.notes = notes.value.trim();

    payment.phone_used = normalizePhone(

        getPaymentPhone()

    );

    if (!payment.category) {

        showToast(

            "Please select a giving category.",

            "error"

        );

        return false;

    }

    if (givingAccount && !givingAccount.value) {

        showToast(

            "Please select a giving account.",

            "error"

        );

        givingAccount.focus();

        return false;

    }

    onGivingAccountChange();

    if (!payment.amount || payment.amount <= 0) {

        showToast(

            "Enter a valid amount.",

            "error"

        );

        amount.focus();

        return false;

    }

    if (!validPhone(payment.phone_used)) {

        showToast(

            "Invalid M-Pesa phone number.",

            "error"

        );

        optionalPhone.focus();

        return false;

    }

    return true;

}

// ======================================================
// CONFIRMATION MODAL
// ======================================================

function openConfirmationModal() {

    if (!validatePayment()) {

        return;

    }

    document.getElementById("confirmMember").textContent =
        payment.member_name;

    document.getElementById("confirmNumber").textContent =
        payment.member_number;

    document.getElementById("confirmPhone").textContent =
        payment.phone_used;

    document.getElementById("confirmCategory").textContent =
        payment.category;

    document.getElementById("confirmAmount").textContent =
        "KES " + payment.amount.toLocaleString();

    paymentModal.classList.add("active");

}

// ======================================================
// CLOSE MODAL
// ======================================================

function closeConfirmationModal() {

    paymentModal.classList.remove("active");

}

// ======================================================
// FORM SUBMIT
// ======================================================

if (paymentForm) {

    paymentForm.addEventListener("submit", function (e) {

        e.preventDefault();

        openConfirmationModal();

    });

}

// ======================================================
// CANCEL BUTTON
// ======================================================

if (cancelBtn) {

    cancelBtn.addEventListener("click", () => {

        closeConfirmationModal();

    });

}

// ======================================================
// CONFIRM BUTTON
// ======================================================

if (confirmBtn) {

    confirmBtn.addEventListener("click", async () => {

        closeConfirmationModal();

        await requestSTKPush();

    });

}

// ======================================================
// RESET UI
// ======================================================

function resetStatusCards() {

    stopElapsedTimer();

    waitingCard.classList.remove("active");

    successCard.classList.remove("active");

    failedCard.classList.remove("active");

    const elapsedEl = document.getElementById("waitingElapsed");

    if (elapsedEl) {

        elapsedEl.parentNode.removeChild(elapsedEl);

    }

    const progressBar = document.getElementById("paymentProgressBar");

    if (progressBar) {

        progressBar.parentNode.removeChild(progressBar);

    }

}

// ======================================================
// SHOW WAITING
// ======================================================

function showWaitingCard() {

    resetStatusCards();

    waitingCard.classList.add("active");

    const existingElapsed = document.getElementById("waitingElapsed");

    if (!existingElapsed) {

        const elapsedEl = document.createElement("p");

        elapsedEl.id = "waitingElapsed";

        elapsedEl.className = "waiting-elapsed";

        elapsedEl.textContent = "Elapsed: 0s";

        waitingCard.appendChild(elapsedEl);

    }

    startElapsedTimer();

    renderProgressBar(

        waitingCard,

        ["Sending request",

        "Check phone & enter PIN",

        "Waiting for confirmation"],

        1

    );

}

// ======================================================
// SHOW SUCCESS
// ======================================================

function showSuccessCard() {

    stopElapsedTimer();

    resetStatusCards();

    successCard.classList.add("active");

    renderProgressBar(

        successCard,

        ["Sending request",

        "Check phone & enter PIN",

        "Payment confirmed"],

        3

    );

}

// ======================================================
// SHOW FAILED
// ======================================================

function showFailedCard(message) {

    stopElapsedTimer();

    resetStatusCards();

    failedCard.classList.add("active");

    const failedMessage = document.getElementById("failedMessage");

    if (failedMessage) {

        failedMessage.textContent = message;

    }

    renderProgressBar(

        failedCard,

        ["Sending request",

        "Check phone & enter PIN",

        "Payment failed"],

        1

    );

    clearRetryHint();

}

// ======================================================
// RENDER STEP PROGRESS BAR
// ======================================================

function renderProgressBar(card, steps, currentStep) {

    if (!card) return;

    const existing = document.getElementById("paymentProgressBar");

    if (existing) {

        existing.parentNode.removeChild(existing);

    }

    const stepsEl = steps.map((label, index) => {

        const done = index < currentStep;

        const active = index === currentStep;

        return `<div class="pay-progress-step ${done ? "done" : ""} ${active ? "active" : ""}">${label}</div>`;

    }).join("<div class=\"pay-progress-arrow\"></div>");

    const wrapper = document.createElement("div");

    wrapper.id = "paymentProgressBar";

    wrapper.className = "pay-progress";

    wrapper.innerHTML =

        `<div class="pay-progress-track">${stepsEl}</div>` +

        `<div class="pay-progress-fill" style="width:${Math.min(100, Math.round((currentStep / steps.length) * 100))}%"></div>`;

    card.appendChild(wrapper);

}

// ======================================================
// UPDATE WAITING MESSAGE
// ======================================================

function updateWaitingMessage(message) {

    const waitingText = document.getElementById("waitingText");

    if (waitingText) {

        waitingText.textContent = message;

    }

    if (waitingText && message.indexOf("PIN") !== -1) {

        const progressBar = document.getElementById("paymentProgressBar");

        if (progressBar) {

            const steps = progressBar.querySelectorAll(".pay-progress-step");

            if (steps.length) {

                steps[1].classList.add("active");

            }

        }

    }

}

// ======================================================
// ELAPSED TIME COUNTER
// ======================================================

let elapsedTimer = null;

let elapsedStart = 0;

function startElapsedTimer() {

    stopElapsedTimer();

    const elapsedEl =

        document.getElementById("waitingElapsed");

    if (!elapsedEl) return;

    elapsedStart = Date.now();

    const tick = () => {

        const seconds = Math.floor((Date.now() - elapsedStart) / 1000);

        const display = formatElapsed(seconds);

        if (elapsedEl) {

            elapsedEl.textContent = "Elapsed: " + display;

        }

    };

    tick();

    elapsedTimer = setInterval(tick, 1000);

}

function stopElapsedTimer() {

    if (elapsedTimer) {

        clearInterval(elapsedTimer);

        elapsedTimer = null;

    }

}

function formatElapsed(seconds) {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return mins > 0 ?

        (mins + "m " + secs + "s") :

        (secs + "s");

}

// ======================================================
// RETRY HINT
// ======================================================

function showRetryHint() {

    const failedCard = document.getElementById("failedCard");

    if (!failedCard) return;

    const hint = document.createElement("p");

    hint.id = "retryHint";

    hint.className = "retry-hint";

    hint.textContent =

        "Make sure you are online, then use Try Again below.";

    failedCard.appendChild(hint);

}

function clearRetryHint() {

    const hint = document.getElementById("retryHint");

    if (hint) {

        hint.parentNode.removeChild(hint);

    }

}

// ======================================================
// PART 2 COMPLETE
//
// Part 3 will:
// ✓ Send STK Push to FastAPI
// ✓ Save CheckoutRequestID
// ✓ Show waiting screen
// ✓ Start automatic payment polling
// ======================================================

// ======================================================
// KINGDOM WAYS CHURCH CMS
// OFFERING.JS
// PART 3
// STK PUSH REQUEST & PAYMENT POLLING
// ======================================================

// ======================================================
// POLLING VARIABLES
// ======================================================

let pollingTimer = null;

const POLLING_INTERVAL = 5000;

const MAX_POLLING_ATTEMPTS = 60;

let pollingAttempts = 0;

// ======================================================
// REQUEST STK PUSH
// ======================================================

async function requestSTKPush() {

    payBtn.disabled = true;

    payBtn.classList.add("loading");

    showWaitingCard();

    updateWaitingMessage(
        "Sending M-Pesa request..."
    );

    try {

        const response = await fetch(

            `${API_BASE}/stk-push`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    member_id: payment.member_id,

                    phone_number: payment.phone_used,

                    amount: payment.amount,

                    category: payment.category,

                    reference: payment.notes,

                    account_type: payment.account_type,

                    account_number: payment.account_number

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            let message =
                (result && result.customer_message) ||
                (result && result.detail) ||
                result.message ||
                "Unable to initiate payment.";

            if (Array.isArray(message)) {

                const parts = message.map(m => m && m.msg);

                message = parts.filter(Boolean).join("; ") ||
                    "The payment request is invalid.";

            }

            throw new Error(message);

        }

        if (result && result.success === false) {

            throw new Error(

                result.message ||

                result.customer_message ||

                "The payment could not be initiated."

            );

        }

        payment.checkout_request_id =

            result.checkout_request_id || "";

        // transaction_id isn't known yet at this point —
        // it's assigned by the backend once the M-Pesa
        // callback confirms the payment. It gets filled in
        // during status polling below.
        payment.transaction_id = "";

        payment.status = "Pending";

        saveActivePayment();

        // ---- PHONE account: no STK push / no polling ----
        if (payment.account_type === "phone") {

            updateWaitingMessage(
                result.customer_message ||
                result.message ||
                "Pay to the M-Pesa number shown to complete your giving."
            );

            showToast(
                result.customer_message || result.message ||
                "Pay to the M-Pesa number shown."
            );

            payBtn.disabled = false;

            payBtn.classList.remove("loading");

            return;

        }

        showToast(

            "M-Pesa prompt sent successfully."

        );

        updateWaitingMessage(

            "Check your phone and enter your M-Pesa PIN."

        );

        startPaymentPolling();

    }

    catch (error) {

        console.error(error);

        const isNetworkError =

            error instanceof TypeError ||

            (error && error.name === "TypeError");

        const message =

            isNetworkError ?

            "Unable to reach the server. Check your internet connection and try again." :

            (error.message ||

            "Unable to send M-Pesa request.");

        paymentFailed(message);

        if (isNetworkError) {

            showRetryHint();

        }

    }

}

// ======================================================
// START PAYMENT POLLING
// ======================================================

function startPaymentPolling() {

    stopPaymentPolling();

    pollingAttempts = 0;

    pollPaymentStatus();

    pollingTimer = setInterval(

        pollPaymentStatus,

        POLLING_INTERVAL

    );

}

// ======================================================
// STOP PAYMENT POLLING
// ======================================================

function stopPaymentPolling() {

    if (pollingTimer) {

        clearInterval(pollingTimer);

        pollingTimer = null;

    }

}

// ======================================================
// CHECK PAYMENT STATUS
// ======================================================

async function pollPaymentStatus() {

    pollingAttempts++;

    try {

        const response = await fetch(

            `${API_BASE}/mpesa/status/${payment.checkout_request_id}`

        );

        const result = await response.json();

        if (!response.ok) {

            if (response.status === 404) {

                stopPaymentPolling();

                paymentFailed(

                    result.customer_message ||

                    result.detail ||

                    result.message ||

                    "Your payment could not be found. It may have expired or failed to start."

                );

                return;

            }

            throw new Error(

                result.customer_message ||

                result.detail ||

                result.message ||

                "Unable to verify payment."

            );

        }

        switch (result.status) {

            case "Pending":

                updateWaitingMessage(

                    "Waiting for PIN confirmation..."

                );

                break;

            case "Processing":

                updateWaitingMessage(

                    "Processing your payment..."

                );

                break;

            case "Success":

                payment.transaction_id =

                    result.transaction_id || "";

                stopPaymentPolling();

                paymentSuccessful(result);

                break;

            case "Failed":

                stopPaymentPolling();

                paymentFailed(

                    result.message ||

                    "Payment failed."

                );

                break;

            case "Cancelled":

                stopPaymentPolling();

                paymentFailed(

                    "Payment cancelled from phone."

                );

                break;

        }

        if (

            pollingAttempts >=

            MAX_POLLING_ATTEMPTS

        ) {

            stopPaymentPolling();

            paymentFailed(

                "Payment request timed out."

            );

        }

    }

    catch (error) {

        console.error(error);

        const isNetworkError =

            error instanceof TypeError ||

            (error && error.name === "TypeError");

        if (isNetworkError) {

            showToast(

                "Connection lost. Retrying to check payment status...",

                "error"

            );

            updateWaitingMessage(

                "Connection lost. Keeping your payment request alive..."

            );

            return;

        }

        stopPaymentPolling();

        paymentFailed(

            error.message ||

            "Unable to verify payment."

        );

    }

}

// ======================================================
// SUCCESS
// ======================================================

function paymentSuccessful(result) {

    showSuccessCard();

    payBtn.disabled = false;

    payBtn.classList.remove("loading");

    payment.status = "Success";

    payment.transaction_id =
        result.transaction_id;

    payment.checkout_request_id =
        result.checkout_request_id;

    payment.mpesa_receipt =
        result.mpesa_receipt;

    payment.safaricom_name =
        result.safaricom_name;

    payment.phone_used =
        result.phone;

    payment.amount =
        result.amount;

    payment.category =
        result.category;

    generateReceipt(result);

    showVerifiedThankYou(

        payment.member_name,

        payment.category

    );

    showToast(

        "Payment received successfully."

    );

}

// ======================================================
// PAYMENT FAILED
// ======================================================

function paymentFailed(message) {

    showFailedCard(message);

    payBtn.disabled = false;

    payBtn.classList.remove("loading");

    stopPaymentPolling();

    showToast(

        message,

        "error"

    );

}

// ======================================================
// CANCEL PAYMENT
// ======================================================

function cancelPayment() {

    stopPaymentPolling();

    clearActivePayment();

    payment.status = "Cancelled";

    finishPayment();

    showFailedCard(

        "Payment cancelled."

    );

    showToast(

        "Payment cancelled.",

        "error"

    );

    setTimeout(() => {

        resetStatusCards();

        payBtn.disabled = false;

        payBtn.classList.remove("loading");

        refreshSummary();

    }, 3000);

}

// ======================================================
// SAVE ACTIVE PAYMENT
// ======================================================

function saveActivePayment() {

    localStorage.setItem(

        "kw_active_payment",

        JSON.stringify({

            checkout_request_id:

                payment.checkout_request_id,

            transaction_id:

                payment.transaction_id,

            amount:

                payment.amount,

            category:

                payment.category,

            phone:

                payment.phone_used,

            started:

                Date.now()

        })

    );

}

// ======================================================
// REMOVE ACTIVE PAYMENT
// ======================================================

function clearActivePayment() {

    localStorage.removeItem(

        "kw_active_payment"

    );

}


// ======================================================
// KINGDOM WAYS CHURCH CMS
// OFFERING.JS
// PART 4
// RECEIPT, HISTORY & NEW PAYMENT
// ======================================================

// ======================================================
// RECEIPT ELEMENTS
// ======================================================

const receiptMember =
document.getElementById("receiptMember");

const receiptMemberNumber =
document.getElementById("receiptMemberNumber");

const receiptSafaricomName =
document.getElementById("receiptSafaricomName");

const receiptPhone =
document.getElementById("receiptPhone");

const receiptCategory =
document.getElementById("receiptCategory");

const receiptAmount =
document.getElementById("receiptAmount");

const receiptReference =
document.getElementById("receiptReference");

const receiptDate =
document.getElementById("receiptDate");

const receiptCheckout =
document.getElementById("receiptCheckout");

const receiptTransaction =
document.getElementById("receiptTransaction");

const printBtn =
document.getElementById("printBtn");

const downloadReceiptBtn =
document.getElementById("downloadReceiptBtn");

const newPaymentBtn =
document.getElementById("newPaymentBtn");

const retryBtn =
document.getElementById("retryBtn");

const historyContainer =
document.getElementById("historyContainer");

// ======================================================
// GENERATE RECEIPT
// ======================================================

function generateReceipt(result){

    clearActivePayment();

    receiptCard.classList.add("active");

    receiptMember.textContent =
        payment.member_name;

    receiptMemberNumber.textContent =
        payment.member_number;

    receiptSafaricomName.textContent =
        result.safaricom_name || "--";

    receiptPhone.textContent =
        result.phone || "--";

    receiptCategory.textContent =
        result.category || "--";

    receiptAmount.textContent =
        "KES " +
        Number(result.amount).toLocaleString();

    receiptReference.textContent =
        result.mpesa_receipt || "--";

    receiptDate.textContent =
        result.transaction_date || "--";

    receiptCheckout.textContent =
        result.checkout_request_id || "--";

    receiptTransaction.textContent =
        result.transaction_id || "--";

}

// ======================================================
// PRINT RECEIPT
// ======================================================

if(printBtn){

    printBtn.addEventListener(

        "click",

        ()=>{

            window.print();

        }

    );

}

// ======================================================
// DOWNLOAD RECEIPT
// ======================================================

if(downloadReceiptBtn){

    downloadReceiptBtn.addEventListener(

        "click",

        async ()=>{

            try{

                const response = await fetch(

                    `${API_BASE}/receipt/${payment.transaction_id}`

                );

                if(!response.ok){

                    throw new Error(

                        "Unable to download receipt."

                    );

                }

                const blob =

                    await response.blob();

                const url =

                    window.URL.createObjectURL(blob);

                const a =

                    document.createElement("a");

                a.href = url;

                a.download =

                    `Receipt_${payment.transaction_id}.pdf`;

                a.click();

                setTimeout(() => window.URL.revokeObjectURL(url), 100);

            }

            catch(error){

                console.error(error);

                showToast(

                    error.message,

                    "error"

                );

            }

        }

    );

}

// ======================================================
// LOAD HISTORY
// ======================================================

async function loadTransactionHistory(){

    if(!historyContainer) return;

    if(!payment || !payment.member_number) return;

    historyContainer.innerHTML =
    "<p>Loading...</p>";

    try{

        const response = await fetch(

            `${API_BASE}/member-history/${payment.member_number}`

        );

        const history = await response.json();

        if(!response.ok){

            throw new Error(

                history.detail ||

                "Unable to load history."

            );

        }

        renderHistory(history);

    }

    catch(error){

        historyContainer.innerHTML =

        "<p>No giving history found.</p>";

    }

}

// ======================================================
// RENDER HISTORY
// ======================================================

function renderHistory(history){

    if(!history.length){

        historyContainer.innerHTML =

        "<p>No previous transactions.</p>";

        return;

    }

    historyContainer.innerHTML = "";

    history.forEach(item=>{

        const row =

        document.createElement("div");

        row.className = "history-row";

        row.innerHTML = `

            <div>${item.category}</div>

            <div>

                KES ${Number(item.amount).toLocaleString()}

            </div>

            <div>${item.mpesa_receipt}</div>

            <div>${item.transaction_date}</div>

        `;

        historyContainer.appendChild(row);

    });

}

// ======================================================
// NEW PAYMENT
// ======================================================

function resetPayment(){

    payment.amount = 0;

    payment.category = "";

    payment.account_type = "";

    payment.account_number = "";

    payment.notes = "";

    payment.checkout_request_id = "";

    payment.transaction_id = "";

    payment.mpesa_receipt = "";

    payment.safaricom_name = "";

    payment.status = "Pending";

    payment.phone_used =
        payment.registered_phone;

    paymentForm.reset();

    categoryCards.forEach(card=>{

        card.classList.remove("active");

    });

    if(category){

        category.value = "";

    }

    if(givingAccount){

        givingAccount.value = "";

    }

    if(accountHint){

        accountHint.textContent = "";

    }

    if(receiptCard){

        receiptCard.classList.remove("active");

    }

    if(successCard){

        successCard.classList.remove("active");

    }

    if(failedCard){

        failedCard.classList.remove("active");

    }

    if(waitingCard){

        waitingCard.classList.remove("active");

    }

    if(payBtn){

        payBtn.disabled = false;

        payBtn.classList.remove("loading");

    }

    refreshSummary();

}

// ======================================================
// BUTTON EVENTS
// ======================================================

if(newPaymentBtn){

    newPaymentBtn.addEventListener(

        "click",

        resetPayment

    );

}

if(retryBtn){

    retryBtn.addEventListener(

        "click",

        resetPayment

    );

}

const cancelPaymentBtn =

document.getElementById("cancelPaymentBtn");

if(cancelPaymentBtn){

    cancelPaymentBtn.addEventListener(

        "click",

        cancelPayment

    );

}


// ======================================================
// KINGDOM WAYS CHURCH CMS
// OFFERING.JS
// PART 5
// PAYMENT RECOVERY, SESSION & PAGE EVENTS
// ======================================================

// ======================================================
// ACTIVE PAYMENT STORAGE KEY
// ======================================================

const ACTIVE_PAYMENT_KEY = "kw_active_payment";

// ======================================================
// PAYMENT LOCK
// ======================================================

let paymentBusy = false;

// ======================================================
// BEGIN PAYMENT
// ======================================================

function beginPayment() {

    if (paymentBusy) {

        showToast(
            "Another payment is already in progress.",
            "error"
        );

        return false;

    }

    paymentBusy = true;

    return true;

}

// ======================================================
// FINISH PAYMENT
// ======================================================

function finishPayment() {

    paymentBusy = false;

}

// ======================================================
// RESUME SAVED PAYMENT
// ======================================================

function resumePendingPayment() {

    const saved = localStorage.getItem(ACTIVE_PAYMENT_KEY);

    if (!saved) {

        return;

    }

    try {

        const active = JSON.parse(saved);

        payment.checkout_request_id =
            active.checkout_request_id || "";

        payment.transaction_id =
            active.transaction_id || "";

        payment.amount =
            active.amount || 0;

        payment.category =
            active.category || "";

        payment.phone_used =
            active.phone || payment.registered_phone;

        refreshSummary();

        showWaitingCard();

        updateWaitingMessage(
            "Resuming pending payment..."
        );

        startPaymentPolling();

    }

    catch (error) {

        console.error(error);

        clearActivePayment();

    }

}

// ======================================================
// VERIFY LOGIN SESSION
// ======================================================

function verifySession() {

    console.log("[OFFERING] verifySession checking...");

    const saved = localStorage.getItem("memberSession");

    console.log("[OFFERING] memberSession value:", saved ? saved.substring(0, 100) + "..." : "NULL");

    if (!saved) {

        // Fallback: check old keys that other pages might have used
        const oldKeys = ["member", "currentMember"];
        for (const key of oldKeys) {
            const oldVal = localStorage.getItem(key);
            if (oldVal) {
                console.log("[OFFERING] Found old session key:", key);
                try {
                    const oldData = JSON.parse(oldVal);
                    const migrated = {
                        ...oldData,
                        loginTime: Date.now(),
                        expiresAt: Date.now() + (6 * 60 * 60 * 1000)
                    };
                    localStorage.setItem("memberSession", JSON.stringify(migrated));
                    console.log("[OFFERING] Migrated old session to memberSession");
                    return true;
                } catch(e) {
                    console.log("[OFFERING] Failed to migrate old session:", e);
                }
            }
        }

        showToast(
            "Your login session has expired.",
            "error"
        );

        setTimeout(() => {

            location.href = "btn.html";

        }, 1500);

        return false;

    }

    try {

        const session = JSON.parse(saved);

        console.log("[OFFERING] Session parsed, expiresAt:", session.expiresAt, "now:", Date.now());

        if (session.expiresAt && Date.now() > session.expiresAt) {

            localStorage.removeItem("memberSession");

            showToast(
                "Your login session has expired.",
                "error"
            );

            setTimeout(() => {

                location.href = "btn.html";

            }, 1500);

            return false;

        }

    } catch(e) {

        console.log("[OFFERING] Session parse error:", e);

        localStorage.removeItem("memberSession");

        return false;

    }

    return true;

}

// ======================================================
// PREPARE PAYMENT
// ======================================================

function preparePayment() {

    if (!verifySession()) {

        return false;

    }

    if (!validatePayment()) {

        return false;

    }

    if (!beginPayment()) {

        return false;

    }

    return true;

}

// ======================================================
// UPDATE SUCCESS
// ======================================================

function paymentFinishedSuccessfully(result) {

    finishPayment();

    clearActivePayment();

    paymentSuccessful(result);

    loadTransactionHistory();

}

// ======================================================
// UPDATE FAILURE
// ======================================================

function paymentFinishedFailed(message) {

    finishPayment();

    clearActivePayment();

    paymentFailed(message);

}

// ======================================================
// ONLINE
// ======================================================

window.addEventListener(

    "online",

    () => {

        showToast(
            "Internet connection restored."
        );

    }

);

// ======================================================
// OFFLINE
// ======================================================

window.addEventListener(

    "offline",

    () => {

        showToast(
            "No internet connection.",
            "error"
        );

    }

);

// ======================================================
// BEFORE PAGE CLOSE
// ======================================================

window.addEventListener(

    "beforeunload",

    () => {

        stopPaymentPolling();

    }

);

// ======================================================
// PAGE STARTUP (REMOVED - Part 6 has initializeGivingPortal)
// ======================================================

// ======================================================
// KINGDOM WAYS CHURCH CMS
// OFFERING.JS
// PART 6 (FINAL)
// FINAL UTILITIES & APPLICATION INITIALIZATION
// ======================================================

// ======================================================
// CLEAR PAYMENT FORM
// ======================================================

function clearPaymentForm() {

    payment.amount = 0;
    payment.category = "";
    payment.account_type = "";
    payment.account_number = "";
    payment.notes = "";
    payment.phone_used = payment.registered_phone;

    payment.checkout_request_id = "";
    payment.transaction_id = "";
    payment.mpesa_receipt = "";
    payment.safaricom_name = "";
    payment.status = "Pending";

    paymentForm.reset();

    if (category) {

        category.value = "";

    }

    if (givingAccount) {

        givingAccount.value = "";

    }

    if (accountHint) {

        accountHint.textContent = "";

    }

    categoryCards.forEach(card => {

        card.classList.remove("active");

    });

    if (optionalPhone) {

        optionalPhone.value = "";
        optionalPhone.disabled = true;

    }

    if (useDifferentPhone) {

        useDifferentPhone.checked = false;

    }

    refreshSummary();

}

// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(value) {

    return Number(value || 0).toLocaleString(

        "en-KE",

        {

            style: "currency",

            currency: "KES"

        }

    );

}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(value) {

    if (!value) return "--";

    return new Date(value).toLocaleString(

        "en-KE",

        {

            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"

        }

    );

}

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

window.addEventListener(

    "error",

    function (event) {

        console.error(event.error);

        showToast(

            "Unexpected system error.",

            "error"

        );

    }

);

// ======================================================
// UNHANDLED PROMISES
// ======================================================

window.addEventListener(

    "unhandledrejection",

    function (event) {

        console.error(event.reason);

        showToast(

            "Unexpected server response.",

            "error"

        );

    }

);

// ======================================================
// PAYMENT SUCCESS HOOK
// ======================================================

function afterSuccessfulPayment(result) {

    paymentFinishedSuccessfully(result);

    showVerifiedThankYou(

        payment.member_name,

        payment.category

    );

}

// ======================================================
// PAGE INITIALIZATION
// ======================================================

function initializeGivingPortal() {

    if (!verifySession()) {

        return;

    }

    loadMemberSession();

    loadGivingAccounts();

    refreshSummary();

    loadTransactionHistory();

    resumePendingPayment();

}

// ======================================================
// APPLICATION START
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    initializeGivingPortal

);

// ======================================================
// DEVELOPMENT LOG
// ======================================================

console.log(
    "%cKINGDOM WAYS CHURCH CMS",
    "color:#1d4ed8;font-size:18px;font-weight:bold;"
);

console.log(
    "%cGiving Module Ready",
    "color:#16a34a;font-size:14px;"
);

// ======================================================
// REQUIRED FASTAPI ENDPOINTS
// ======================================================

/*

POST   /api/finance/mpesa/stkpush

Request
{
    member_id,
    member_number,
    member_name,
    phone,
    amount,
    category,
    notes
}

Response
{
    success,
    checkout_request_id,
    transaction_id,
    customer_message
}

--------------------------------------------------

GET

/api/finance/mpesa/status/{checkout_request_id}

Response
{
    status,
    transaction_id,
    checkout_request_id,
    mpesa_receipt,
    safaricom_name,
    phone,
    amount,
    category,
    transaction_date
}

--------------------------------------------------

GET

/api/finance/member-history/{member_number}

--------------------------------------------------

GET

/finance/receipt/{transaction_id}

--------------------------------------------------

POST

/api/finance/mpesa/callback

*/

// ======================================================
// FINAL NOTES
// ======================================================

/*

✓ Member logs in

✓ Member details load automatically

✓ Registered phone displayed

✓ Optional M-Pesa number supported

✓ Category selection

✓ Amount validation

✓ Confirmation modal

✓ STK Push request

✓ Payment polling

✓ Success / Failed handling

✓ Receipt generation

✓ Print receipt

✓ Download receipt

✓ Transaction history

✓ Resume interrupted payment

✓ Duplicate payment protection

✓ Session validation

✓ Thank-you animation

✓ Ready for FastAPI + PostgreSQL + Daraja API

*/