// ======================================================
// KINGDOM WAYS CHURCH
// GIVING PORTAL
// PART 1
// ======================================================


// ======================================================
// CONFIGURATION
// ======================================================

const API = "";


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

let paymentData = {

    member_id:null,

    member_number:"",

    member_name:"",

    registered_phone:"",

    phone_used:"",

    amount:0,

    category:"",

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

        localStorage.getItem("member");

    if(!saved){

        showToast(

            "Please login first.",

            "error"

        );

        setTimeout(()=>{

            location.href="memberlogin.html";

        },1500);

        return;

    }

    currentMember = JSON.parse(saved);

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


    paymentData.member_id =

        currentMember.id;

    paymentData.member_number =

        currentMember.member_number;

    paymentData.member_name =

        currentMember.full_name;

    paymentData.registered_phone =

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
// START
// ======================================================

window.addEventListener(

    "DOMContentLoaded",

    ()=>{

        loadMemberSession();

    }

);

// ======================================================
// KINGDOM WAYS CHURCH
// GIVING PORTAL
// PART 2
// ======================================================


// ======================================================
// CATEGORY SELECTION
// ======================================================

const categoryCards =
document.querySelectorAll(".category-card");

categoryCards.forEach(card=>{

    card.addEventListener("click",()=>{

        categoryCards.forEach(c=>{

            c.classList.remove("active");

        });

        card.classList.add("active");

        const radio =

        card.querySelector("input");

        if(radio){

            radio.checked = true;

            paymentData.category =

            radio.value;

        }

    });

});



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
// VALIDATE FORM
// ======================================================

function validatePayment(){

    const phone =

    getPaymentPhone();

    if(paymentData.category===""){

        showToast(

        "Select giving category.",

        "error"

        );

        return false;

    }

    if(amount.value===""){

        showToast(

        "Enter amount.",

        "error"

        );

        amount.focus();

        return false;

    }

    if(Number(amount.value)<=0){

        showToast(

        "Amount must be greater than zero.",

        "error"

        );

        return false;

    }

    if(!validPhone(phone)){

        showToast(

        "Invalid phone number.",

        "error"

        );

        return false;

    }

    paymentData.amount =

    Number(amount.value);

    paymentData.phone_used =

    normalizePhone(phone);

    paymentData.notes =

    notes.value.trim();

    return true;

}



// ======================================================
// OPEN CONFIRMATION MODAL
// ======================================================

function openConfirmation(){

    if(!validatePayment()){

        return;

    }

    document.getElementById("confirmMember").textContent =

    paymentData.member_name;

    document.getElementById("confirmNumber").textContent =

    paymentData.member_number;

    document.getElementById("confirmPhone").textContent =

    paymentData.phone_used;

    document.getElementById("confirmCategory").textContent =

    paymentData.category;

    document.getElementById("confirmAmount").textContent =

    "KES "+paymentData.amount.toLocaleString();

    paymentModal.classList.add("active");

}



// ======================================================
// CLOSE MODAL
// ======================================================

function closeConfirmation(){

    paymentModal.classList.remove("active");

}



// ======================================================
// FORM SUBMIT
// ======================================================

paymentForm.addEventListener(

"submit",

function(e){

    e.preventDefault();

    openConfirmation();

});



// ======================================================
// CANCEL
// ======================================================

cancelBtn.addEventListener(

"click",

function(){

    closeConfirmation();

});



// ======================================================
// CONFIRM PAYMENT
// ======================================================

confirmBtn.addEventListener(

"click",

async function(){

    closeConfirmation();

    await requestSTKPush();

});



// ======================================================
// REQUEST STK PUSH
// ======================================================

async function requestSTKPush(){

    payBtn.disabled=true;

    payBtn.classList

// ======================================================
// KINGDOM WAYS CHURCH
// GIVING PORTAL
// PART 3
// ======================================================


// ======================================================
// PAYMENT POLLING
// ======================================================

let pollingTimer = null;

let pollingAttempts = 0;

const MAX_ATTEMPTS = 60;      // 5 minutes (5 sec interval)

const POLL_INTERVAL = 5000;


// ======================================================
// START POLLING
// ======================================================

function startPaymentPolling(){

    pollingAttempts = 0;

    if(pollingTimer){

        clearInterval(pollingTimer);

    }

    pollPaymentStatus();

    pollingTimer = setInterval(

        pollPaymentStatus,

        POLL_INTERVAL

    );

}



// ======================================================
// STOP POLLING
// ======================================================

function stopPolling(){

    if(pollingTimer){

        clearInterval(pollingTimer);

        pollingTimer = null;

    }

}



// ======================================================
// CHECK PAYMENT STATUS
// ======================================================

async function pollPaymentStatus(){

    pollingAttempts++;

    try{

        const response = await fetch(

            API +

            "/finance/mpesa/status/" +

            paymentData.checkout_request_id

        );

        const result = await response.json();

        if(!response.ok){

            throw new Error(

                result.detail ||

                "Unable to verify payment."

            );

        }

        switch(result.status){

            case "Pending":

                updateWaitingMessage(

                    "Waiting for PIN confirmation..."

                );

                break;


            case "Processing":

                updateWaitingMessage(

                    "Payment is being processed..."

                );

                break;


            case "Success":

                stopPolling();

                paymentSuccessful(result);

                break;


            case "Cancelled":

                stopPolling();

                paymentCancelled();

                break;


            case "Failed":

                stopPolling();

                paymentFailed(

                    result.message ||

                    "Payment failed."

                );

                break;

        }

        if(pollingAttempts >= MAX_ATTEMPTS){

            stopPolling();

            paymentFailed(

                "Request timed out."

            );

        }

    }

    catch(error){

        console.error(error);

    }

}



// ======================================================
// UPDATE WAITING TEXT
// ======================================================

function updateWaitingMessage(message){

    const waitingText =

    document.getElementById("waitingText");

    if(waitingText){

        waitingText.textContent = message;

    }

}



// ======================================================
// SUCCESS
// ======================================================

function paymentSuccessful(result){

    waitingCard.classList.remove("active");

    failedCard.classList.remove("active");

    successCard.classList.add("active");

    payBtn.disabled = false;

    payBtn.classList.remove("loading");


    paymentData.status = "Success";

    paymentData.transaction_id =

        result.transaction_id;

    paymentData.checkout_request_id =

        result.checkout_request_id;

    paymentData.mpesa_receipt =

        result.mpesa_receipt;

    paymentData.safaricom_name =

        result.safaricom_name;

    paymentData.phone_used =

        result.phone;

    paymentData.amount =

        result.amount;

    paymentData.category =

        result.category;

    paymentData.transaction_date =

        result.transaction_date;


    showToast(

        "Payment received successfully."

    );


    generateReceipt(result);

}



// ======================================================
// FAILED
// ======================================================

function paymentFailed(message){

    waitingCard.classList.remove("active");

    successCard.classList.remove("active");

    failedCard.classList.add("active");

    payBtn.disabled = false;

    payBtn.classList.remove("loading");

    document.getElementById(

        "failedMessage"

    ).textContent = message;

    showToast(

        message,

        "error"

    );

}



// ======================================================
// CANCELLED
// ======================================================

function paymentCancelled(){

    paymentFailed(

        "Payment cancelled from phone."

    );

}



// ======================================================
// RESET UI
// ======================================================

function resetPaymentUI(){

    waitingCard.classList.remove("active");

    successCard.classList.remove("active");

    failedCard.classList.remove("active");

    receiptCard.classList.remove("active");

    payBtn.disabled = false;

    payBtn.classList.remove("loading");

}



// ======================================================
// RETRY BUTTON
// ======================================================

const retryBtn =

document.getElementById("retryBtn");

if(retryBtn){

    retryBtn.addEventListener(

        "click",

        ()=>{

            resetPaymentUI();

        }

    );

}


// ======================================================
// KINGDOM WAYS CHURCH
// GIVING PORTAL
// PART 4
// ======================================================


// ======================================================
// GENERATE RECEIPT
// ======================================================

function generateReceipt(result){

    receiptCard.classList.add("active");

    setReceiptValue(

        "receiptMember",

        paymentData.member_name

    );

    setReceiptValue(

        "receiptMemberNumber",

        paymentData.member_number

    );

    setReceiptValue(

        "receiptSafaricomName",

        result.safaricom_name ||

        "Not Available"

    );

    setReceiptValue(

        "receiptPhone",

        result.phone

    );

    setReceiptValue(

        "receiptCategory",

        result.category

    );

    setReceiptValue(

        "receiptAmount",

        "KES " +

        Number(result.amount)

        .toLocaleString()

    );

    setReceiptValue(

        "receiptReference",

        result.mpesa_receipt

    );

    setReceiptValue(

        "receiptDate",

        result.transaction_date

    );

    setReceiptValue(

        "receiptCheckout",

        result.checkout_request_id

    );

    setReceiptValue(

        "receiptTransaction",

        result.transaction_id

    );

    saveReceiptHistory(result);

}



// ======================================================
// SET RECEIPT FIELD
// ======================================================

function setReceiptValue(id,value){

    const element =

    document.getElementById(id);

    if(element){

        element.textContent = value;

    }

}



// ======================================================
// SAVE LOCAL HISTORY
// (Quick Member Reference)
// ======================================================

function saveReceiptHistory(result){

    let history =

    JSON.parse(

        localStorage.getItem(

            "givingHistory"

        ) || "[]"

    );

    history.unshift({

        member_number:

        paymentData.member_number,

        member_name:

        paymentData.member_name,

        safaricom_name:

        result.safaricom_name,

        receipt:

        result.mpesa_receipt,

        amount:

        result.amount,

        category:

        result.category,

        phone:

        result.phone,

        transaction_date:

        result.transaction_date

    });

    if(history.length>30){

        history =

        history.slice(0,30);

    }

    localStorage.setItem(

        "givingHistory",

        JSON.stringify(history)

    );

}



// ======================================================
// PRINT RECEIPT
// ======================================================

const printBtn =

document.getElementById(

    "printBtn"

);

if(printBtn){

    printBtn.addEventListener(

        "click",

        ()=>{

            window.print();

        }

    );

}



// ======================================================
// NEW PAYMENT
// ======================================================

const newPaymentBtn =

document.getElementById(

    "newPaymentBtn"

);

if(newPaymentBtn){

    newPaymentBtn.addEventListener(

        "click",

        ()=>{

            paymentForm.reset();

            receiptCard.classList.remove(

                "active"

            );

            successCard.classList.remove(

                "active"

            );

            failedCard.classList.remove(

                "active"

            );

            waitingCard.classList.remove(

                "active"

            );

            paymentData.category = "";

            paymentData.amount = 0;

            paymentData.notes = "";

            paymentData.phone_used =

            paymentData.registered_phone;

            categoryCards.forEach(card=>{

                card.classList.remove(

                    "active"

                );

            });

            payBtn.disabled=false;

            payBtn.classList.remove(

                "loading"

            );

            amount.focus();

        }

    );

}



// ======================================================
// VIEW HISTORY
// ======================================================

function loadGivingHistory(){

    const history =

    JSON.parse(

        localStorage.getItem(

            "givingHistory"

        ) || "[]"

    );

    console.log(

        "Recent Giving:",

        history

    );

}



// ======================================================
// STARTUP
// ======================================================

loadGivingHistory();

// ======================================================
// KINGDOM WAYS CHURCH
// GIVING PORTAL
// PART 5
// ======================================================


// ======================================================
// ACTIVE PAYMENT SESSION
// ======================================================

const ACTIVE_PAYMENT_KEY =

"kw_active_payment";



// ======================================================
// SAVE ACTIVE PAYMENT
// ======================================================

function saveActivePayment(){

    localStorage.setItem(

        ACTIVE_PAYMENT_KEY,

        JSON.stringify({

            checkout_request_id:

            paymentData.checkout_request_id,

            transaction_id:

            paymentData.transaction_id,

            amount:

            paymentData.amount,

            category:

            paymentData.category,

            phone:

            paymentData.phone_used,

            started:

            Date.now()

        })

    );

}



// ======================================================
// CLEAR ACTIVE PAYMENT
// ======================================================

function clearActivePayment(){

    localStorage.removeItem(

        ACTIVE_PAYMENT_KEY

    );

}



// ======================================================
// RESUME PAYMENT
// ======================================================

function resumePendingPayment(){

    const saved =

    localStorage.getItem(

        ACTIVE_PAYMENT_KEY

    );

    if(!saved){

        return;

    }

    const payment =

    JSON.parse(saved);

    paymentData.checkout_request_id =

    payment.checkout_request_id;

    paymentData.transaction_id =

    payment.transaction_id;

    paymentData.amount =

    payment.amount;

    paymentData.category =

    payment.category;

    paymentData.phone_used =

    payment.phone;

    waitingCard.classList.add(

        "active"

    );

    showToast(

        "Resuming pending payment..."

    );

    startPaymentPolling();

}



// ======================================================
// DUPLICATE PROTECTION
// ======================================================

let paymentBusy = false;

function beginPayment(){

    if(paymentBusy){

        showToast(

        "Another payment is already running.",

        "error"

        );

        return false;

    }

    paymentBusy = true;

    return true;

}



function finishPayment(){

    paymentBusy = false;

}



// ======================================================
// HISTORY TABLE
// ======================================================

const historyContainer =

document.getElementById(

"historyContainer"

);



// ======================================================
// LOAD HISTORY
// ======================================================

async function loadTransactionHistory(){

    if(!historyContainer){

        return;

    }

    historyContainer.innerHTML =

    "Loading history...";

    try{

        const response = await fetch(

        API+

        "/finance/member-history/"+

        paymentData.member_number

        );

        const history =

        await response.json();

        if(!response.ok){

            throw new Error(

            history.detail||

            "Unable to load history."

            );

        }

        renderHistory(history);

    }

    catch(error){

        historyContainer.innerHTML=

        "<p>No history available.</p>";

    }

}



// ======================================================
// RENDER HISTORY
// ======================================================

function renderHistory(history){

    if(history.length===0){

        historyContainer.innerHTML=`

            <p>

            No previous giving records.

            </p>

        `;

        return;

    }

    historyContainer.innerHTML="";

    history.forEach(item=>{

        const row=

        document.createElement("div");

        row.className="history-row";

        row.innerHTML=`

        <div>

            <strong>

            ${item.category}

            </strong>

        </div>

        <div>

            KES

            ${Number(item.amount)

            .toLocaleString()}

        </div>

        <div>

            ${item.mpesa_receipt}

        </div>

        <div>

            ${item.transaction_date}

        </div>

        `;

        historyContainer.appendChild(row);

    });

}



// ======================================================
// DOWNLOAD RECEIPT
// ======================================================

const downloadBtn =

document.getElementById(

"downloadReceiptBtn"

);

if(downloadBtn){

downloadBtn.addEventListener(

"click",

()=>{

window.print();

}

);

}



// ======================================================
// SUCCESS CLEANUP
// ======================================================

function paymentFinishedSuccessfully(result){

    clearActivePayment();

    finishPayment();

    paymentSuccessful(result);

    loadTransactionHistory();

}



// ======================================================
// FAILURE CLEANUP
// ======================================================

function paymentFinishedFailed(message){

    clearActivePayment();

    finishPayment();

    paymentFailed(message);

}



// ======================================================
// STARTUP RECOVERY
// ======================================================

window.addEventListener(

"load",

()=>{

    resumePendingPayment();

});

// ======================================================
// KINGDOM WAYS CHURCH
// GIVING PORTAL
// PART 6 (FINAL)
// ======================================================


// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(value){

    return "KES " +

    Number(value).toLocaleString(

        "en-KE",

        {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        }

    );

}



// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date){

    if(!date){

        return "--";

    }

    return new Date(date)

    .toLocaleString(

        "en-KE",

        {

            year:"numeric",

            month:"long",

            day:"numeric",

            hour:"2-digit",

            minute:"2-digit"

        }

    );

}



// ======================================================
// AUTO FORMAT AMOUNT
// ======================================================

if(amount){

    amount.addEventListener(

        "input",

        ()=>{

            let value =

            amount.value.replace(

                /[^0-9]/g,

                ""

            );

            amount.value = value;

        }

    );

}



// ======================================================
// OPTIONAL PHONE
// ======================================================

if(optionalPhone){

    optionalPhone.addEventListener(

        "blur",

        ()=>{

            if(

                optionalPhone.value.trim()!=="" &&

                !validPhone(

                    optionalPhone.value

                )

            ){

                showToast(

                "Invalid M-Pesa phone number.",

                "error"

                );

                optionalPhone.focus();

            }

        }

    );

}



// ======================================================
// SESSION CHECK
// ======================================================

function verifySession(){

    const member =

    localStorage.getItem("member");

    if(!member){

        showToast(

        "Login session expired.",

        "error"

        );

        setTimeout(()=>{

            location.href=

            "memberlogin.html";

        },1500);

        return false;

    }

    return true;

}



// ======================================================
// BEFORE PAYMENT
// ======================================================

function preparePayment(){

    if(!verifySession()){

        return false;

    }

    if(!validatePayment()){

        return false;

    }

    if(!beginPayment()){

        return false;

    }

    return true;

}



// ======================================================
// CONNECTION CHECK
// ======================================================

window.addEventListener(

"offline",

()=>{

showToast(

"No internet connection.",

"error"

);

});



window.addEventListener(

"online",

()=>{

showToast(

"Connection restored."

);

});



// ======================================================
// REFRESH MEMBER SUMMARY
// ======================================================

function refreshSummary(){

    document.getElementById(

    "summaryAmount"

    ).textContent =

    formatMoney(

    paymentData.amount || 0

    );



    document.getElementById(

    "summaryCategory"

    ).textContent =

    paymentData.category ||

    "--";



    document.getElementById(

    "summaryPhone"

    ).textContent =

    paymentData.phone_used ||

    paymentData.registered_phone ||

    "--";

}



// ======================================================
// LIVE SUMMARY
// ======================================================

if(amount){

amount.addEventListener(

"keyup",

refreshSummary

);

}



if(category){

category.addEventListener(

"change",

refreshSummary

);

}



// ======================================================
// RESET FORM
// ======================================================

function clearForm(){

    paymentForm.reset();

    paymentData.amount = 0;

    paymentData.category = "";

    paymentData.notes = "";

    paymentData.phone_used =

    paymentData.registered_phone;

    paymentData.checkout_request_id = "";

    paymentData.transaction_id = "";

    paymentData.mpesa_receipt = "";

    paymentData.safaricom_name = "";

    paymentData.status = "Pending";

    categoryCards.forEach(card=>{

        card.classList.remove(

        "active"

        );

    });

    refreshSummary();

}



// ======================================================
// PAGE START
// ======================================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    verifySession();

    loadMemberSession();

    refreshSummary();

    loadTransactionHistory();

    resumePendingPayment();

});



// ======================================================
// PAGE EXIT
// ======================================================

window.addEventListener(

"beforeunload",

()=>{

    stopPolling();

});



// ======================================================
// DEBUG (Development Only)
// ======================================================

console.log(

"%cKINGDOM WAYS GIVING PORTAL",

"color:#2563eb;font-size:18px;font-weight:bold;"

);

console.log(

"Frontend Ready."

);



// ======================================================
// BACKEND ROUTES REQUIRED
// ======================================================
//
// POST   /finance/mpesa/stkpush
//
// GET    /finance/mpesa/status/{checkout_request_id}
//
// GET    /finance/member-history/{member_number}
//
// POST   /finance/mpesa/callback
//
// GET    /finance/receipt/{transaction_id}
//
// ======================================================



// ======================================================
// FINAL NOTES
// ======================================================
//
// ✔ Member logs in once.
//
// ✔ Phone auto-filled.
//
// ✔ Optional alternate M-Pesa number.
//
// ✔ Member selects:
//
//      • Tithe
//      • Offering
//      • Donation
//      • Pledge
//
// ✔ Browser requests STK Push.
//
// ✔ Backend sends STK Push.
//
// ✔ Member enters PIN.
//
// ✔ Safaricom calls FastAPI callback.
//
// ✔ Backend verifies payment.
//
// ✔ Backend stores:
//
//      Member Number
//      Member Name
//      Registered Phone
//      Phone Used
//      Safaricom Name
//      Receipt Number
//      Amount
//      Category
//      Transaction Date
//      Status
//
// ✔ Frontend displays receipt.
//
// ✔ Finance dashboard immediately sees transaction.
//
// ======================================================


// ======================================================
// KINGDOM WAYS CHURCH
// VERIFIED PAYMENT THANK YOU ANIMATION
// Show ONLY after backend confirms SUCCESS
// ======================================================

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

