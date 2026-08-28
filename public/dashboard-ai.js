// =============================================
// KINGDOM WAYS - AI ATTENDANCE Camera (v2)
// dashboard-ai.js
// Browser TensorFlow.js (Coco-SSD) person detection
// + robust centroid tracking with:
//   - stronger detection model
//   - confidence filter + non-max suppression
//   - track confirmation (no single-frame false positives)
//   - hysteresis zone crossing (anti-jitter)
//   - track TTL persistence (anti-flicker)
//   - entry-lock (no double recording)
// =============================================

(() => {

// ---------- ELEMENTS ----------
const overlay      = document.getElementById("aiOverlay");
const closeBtn     = document.getElementById("aiCloseBtn");
const startBtn     = document.getElementById("aiStartBtn");
const saveBtn      = document.getElementById("aiSaveBtn");
const statusEl     = document.getElementById("aiStatus");
const stageEl      = document.getElementById("aiStage");
const video        = document.getElementById("aiVideo");
const canvas       = document.getElementById("aiCanvas");
const ctx          = canvas.getContext("2d");
const enteredEl    = document.getElementById("aiEntered");
const exitedEl     = document.getElementById("aiExited");
const uniqueEl     = document.getElementById("aiUnique");
const attendanceCard = document.getElementById("attendanceCard");

// ---------- TUNING PARAMETERS ----------
const MODEL_BASE       = "ssdlite_mobilenet_v2"; // faster & more accurate than lite_mobilenet_v2
const CONF_THRESH      = 0.50;                   // min detection confidence
const NMS_IOU          = 0.40;                   // dedupe overlapping boxes
const CONFIRM_FRAMES   = 3;                      // frames before a track counts
const TTL_FRAMES       = 12;                     // frames to keep a lost track (anti-flicker)
const LINE_MARGIN      = 22;                     // px margin to fight jitter at the line
const MATCH_IOU        = 0.20;                   // IoU to match a detection to a track
const DETECT_INTERVAL  = 90;                     // ms between detections (~11 fps, stays smooth)
const GHOST_FRAMES     = 30;                     // frames a purged track lingers (anti double-record)

// ---------- STATE ----------
let model = null;
let stream = null;
let running = false;
let modelReady = false;
let detectTimer = null;

let tracks = new Map();      // id -> track object
let ghosts = new Map();      // id -> {box, cx, cy, expireFrame} (recently lost, re-matchable)
let enteredCount = 0;
let exitedCount = 0;
let enteredIds = new Set();
let nextId = 1;
let frameCounter = 0;

let videoW = 640, videoH = 480;

// ---------- AUTH ----------
function authToken(){
    try{
        const s = JSON.parse(localStorage.getItem("adminSession") || "{}");
        return s.token || "";
    }catch(e){ return ""; }
}

// ---------- MODEL ----------
async function loadModel(){
    statusEl.textContent = "Loading AI model\u2026";
    statusEl.classList.remove("error","ok");
    startBtn.disabled = true;
    try{
        model = await cocoSsd.load({ base: MODEL_BASE });
        modelReady = true;
        startBtn.disabled = false;
        statusEl.textContent = "AI model ready. Press Start Camera.";
        statusEl.classList.add("ok");
    }catch(err){
        console.error(err);
        modelReady = false;
        statusEl.textContent = "Could not load AI model. Check internet connection.";
        statusEl.classList.add("error");
    }
}

// ---------- GEOMETRY HELPERS ----------
function iou(a, b){
    const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
    const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const aArea = a.w * a.h, bArea = b.w * b.h;
    const union = aArea + bArea - inter;
    return union > 0 ? inter / union : 0;
}

// Non-max suppression: keep the strongest box and drop overlapping weaker ones
function nms(boxes){
    const arr = boxes.slice().sort((a,b) => b.score - a.score);
    const keep = [];
    while(arr.length){
        const first = arr.shift();
        keep.push(first);
        for(let i = arr.length - 1; i >= 0; i--){
            if(iou(first, arr[i]) > NMS_IOU){
                arr.splice(i, 1);
            }
        }
    }
    return keep;
}

function lineY(){
    return canvas.height / 2;   // native pixels, matching the drawn line & boxes
}

// Zone with hysteresis: ignore movement within a margin band around the line
function zoneOf(cy, line){
    if(cy < line - LINE_MARGIN) return "IN";   // above line = inside
    if(cy > line + LINE_MARGIN) return "OUT";  // below line = outside
    return null;                                // ambiguous -> keep previous
}

// ---------- PROCESS DETECTIONS ----------
function processDetections(predictions){
    if(!predictions || !predictions.length) return;

    const line = lineY();
    frameCounter++;

    // 1) filter people + confidence, then NMS
    const people = [];
    for(const p of predictions){
        if(p.class !== "person") continue;
        if(p.score !== undefined && p.score < CONF_THRESH) continue;
        people.push({
            x: p.bbox[0], y: p.bbox[1],
            w: p.bbox[2], h: p.bbox[3],
            score: p.score !== undefined ? p.score : 1
        });
    }
    const boxes = nms(people);
    if(!boxes.length) return;

    const used = new Set();

    for(const box of boxes){
        const cx = box.x + box.w / 2;
        const cy = box.y + box.h / 2;

        // 2) match to the best available existing track
        let bestId = null, bestScore = 0;
        for(const [id, t] of tracks){
            if(used.has(id)) continue;
            if(t.purged) continue;
            const s = iou(box, t.box);
            if(s > bestScore){ bestScore = s; bestId = id; }
        }

        let trackId, track;
        if(bestId !== null && bestScore >= MATCH_IOU){
            trackId = bestId;
            track = tracks.get(trackId);
        }else{
            // 3) reconnect to a recently-lost ghost, else start a new candidate
            let ghostId = null, ghostBest = 0;
            for(const [id, g] of ghosts){
                if(frameCounter > g.expireFrame) continue;
                const d = Math.hypot(g.cx - cx, g.cy - cy);
                const score = 1 - d / (g.rad || 160);
                if(score > ghostBest){ ghostBest = score; ghostId = id; }
            }

            const z = zoneOf(cy, line);

            if(ghostId !== null && ghostBest > 0.35){
                // same identity as before -> preserves unique count
                trackId = ghostId;
                const g = ghosts.get(ghostId);
                ghosts.delete(ghostId);
                track = {
                    id: trackId, box, cx, cy,
                    zone: z, prevZone: z,
                    seen: 1, lastSeen: frameCounter,
                    entered: g.entered, exited: g.exited
                };
            }else{
                trackId = nextId++;
                track = {
                    id: trackId, box, cx, cy,
                    zone: z, prevZone: z,
                    seen: 1, lastSeen: frameCounter,
                    entered: false, exited: false
                };
            }
            tracks.set(trackId, track);
        }

        // update matched track
        track.box = box;
        track.cx = cx;
        track.cy = cy;
        track.lastSeen = frameCounter;
        track.seen = Math.min(track.seen + 1, 999);

        // hysteresis zone update
        const cz = zoneOf(cy, line);
        const prev = track.zone;
        if(cz){
            track.prevZone = prev;
            track.zone = cz;
        }

        // 4) ENTRY / EXIT detection: confirmed track crosses the line
        if(track.seen >= CONFIRM_FRAMES){
            // OUT -> IN : ENTERED by this person
            if(track.zone === "IN" && track.prevZone === "OUT" && !track.entered){
                track.entered = true;
                if(!enteredIds.has(trackId)){
                    enteredIds.add(trackId);
                    enteredCount++;
                }
            }
            // IN -> OUT : EXITED by this person (only count when already in)
            else if(track.zone === "OUT" && track.prevZone === "IN" && !track.exited){
                track.exited = true;
                exitedCount++;
            }
        }

        used.add(trackId);
        drawBox(box, track.zone || "OUT", trackId);
    }

    // 5) purge stale tracks but allow re-entry locking
    for(const [id, t] of tracks){
        if(t.purged) continue;
        if(frameCounter - t.lastSeen > TTL_FRAMES){
            // person left the frame while outside -> allow re-entry later
            if(t.zone === "OUT"){
                t.entered = false;
                t.exited = false;
            }
            // keep a short-lived ghost so a reappearing person keeps their id
            ghosts.set(id, {
                cx: t.cx, cy: t.cy,
                rad: 160,
                entered: t.entered, exited: t.exited,
                expireFrame: frameCounter + GHOST_FRAMES
            });
            t.purged = true;
        }
    }

    // remove purged tracks from the map (they are no longer drawn/matched)
    for(const [id, t] of tracks){
        if(t.purged) tracks.delete(id);
    }

    // clean expired ghosts
    for(const [id, g] of ghosts){
        if(frameCounter > g.expireFrame) ghosts.delete(id);
    }
}

function drawBox(box, zone, id){
    const color = zone === "IN" ? "#34d399" : "#fbbf24";
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    const labelId = String(id).padStart(4,"0");
    const text = `P-${labelId} ${zone}`;
    ctx.font = "bold 14px Poppins, sans-serif";
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(15,23,42,.85)";
    ctx.fillRect(box.x, box.y - 24, tw + 12, 22);
    ctx.fillStyle = "#fff";
    ctx.fillText(text, box.x + 6, box.y - 8);
}

function drawLine(){
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.setLineDash([10,8]);
    ctx.beginPath();
    ctx.moveTo(0, videoH / 2);
    ctx.lineTo(canvas.width, videoH / 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function renderFrame(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLine();
}

// ---------- DETECTION LOOP (throttled) ----------
async function detectCycle(){
    if(!running) return;

    if(modelReady && video.readyState >= 2){
        try{
            const predictions = await model.detect(video, 40, 0.25);
            renderFrame();
            processDetections(predictions);
            updateCounters();
        }catch(err){
            console.error(err);
        }
    }

    if(running){
        detectTimer = setTimeout(detectCycle, DETECT_INTERVAL);
    }
}

function updateCounters(){
    enteredEl.textContent = enteredCount;
    exitedEl.textContent  = exitedCount;
    uniqueEl.textContent  = enteredIds.size;

    if(enteredIds.size > 0){
        saveBtn.classList.remove("hidden");
    }
    saveBtn.disabled = enteredIds.size === 0;
}

// ---------- CAMERA ----------
async function startCamera(){
    if(!modelReady){
        statusEl.textContent = "AI model not ready yet \u2026";
        statusEl.classList.add("error");
        return;
    }
    try{
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        videoW = video.videoWidth || 1280;
        videoH = video.videoHeight || 720;
        canvas.width = videoW;
        canvas.height = videoH;

        stageEl.classList.remove("hidden");
        startBtn.classList.add("recording");
        startBtn.innerHTML = '<i class="fa-solid fa-circle-stop"></i> Stop Camera';
        statusEl.textContent = "Camera on \u2026 detecting people.";
        statusEl.classList.add("ok");

        resetCounters();
        running = true;
        frameCounter = 0;

        if(detectTimer) clearTimeout(detectTimer);
        detectCycle();
    }catch(err){
        console.error(err);
        statusEl.textContent = "Camera permission denied or unavailable.";
        statusEl.classList.add("error");
    }
}

function stopCamera(){
    running = false;
    if(detectTimer){ clearTimeout(detectTimer); detectTimer = null; }
    if(stream){
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    if(video) video.srcObject = null;
    if(ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(startBtn){
        startBtn.classList.remove("recording");
        startBtn.innerHTML = '<i class="fa-solid fa-video"></i> Start Camera';
    }
    if(statusEl && !statusEl.classList.contains("hidden")){
        statusEl.textContent = statusEl.textContent + " (stopped)";
    }
}

function resetCounters(){
    tracks.clear();
    ghosts.clear();
    enteredIds.clear();
    enteredCount = 0;
    exitedCount = 0;
    nextId = 1;
    updateCounters();
}

// ---------- SAVE TO SERVER ----------
async function saveAttendance(){
    const token = authToken();
    if(!token){
        statusEl.textContent = "Not logged in as admin. Cannot save.";
        statusEl.classList.add("error");
        return;
    }

    saveBtn.disabled = true;

    try{
        const res = await fetch("/attendance/ai/session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                session_date: new Date().toISOString().split("T")[0],
                entered_count: enteredCount,
                exited_count: exitedCount,
                unique_count: enteredIds.size,
                notes: "AI camera attendance (" + enteredIds.size + " unique)"
            })
        });

        const data = await res.json().catch(() => ({}));
        if(res.ok && data.success){
            statusEl.textContent = "Saved \u2713 " + (data.unique_count || 0) + " unique people recorded.";
            statusEl.classList.remove("error");
            statusEl.classList.add("ok");
            refreshCard();
        }else{
            statusEl.textContent = "Save failed. Check admin login.";
            statusEl.classList.add("error");
        }
    }catch(err){
        console.error(err);
        statusEl.textContent = "Save error. Try again.";
        statusEl.classList.add("error");
    }finally{
        saveBtn.disabled = enteredIds.size === 0;
    }
}

// ---------- DASHBOARD CARD ----------
async function refreshCard(){
    const token = authToken();
    if(!token) return;
    try{
        const res = await fetch("/attendance/ai/latest", {
            headers: { "Authorization": "Bearer " + token }
        });
        if(!res.ok) return;
        const data = await res.json();
        const el = document.getElementById("attendanceCount");
        if(el && data.latest_unique_count !== undefined){
            el.textContent = data.latest_unique_count;
        }
    }catch(err){ console.error(err); }
}

// ---------- OPEN / CLOSE ----------
function openModal(){
    overlay.classList.remove("hidden");
    statusEl.classList.remove("error");
    saveBtn.disabled = true;
    saveBtn.classList.add("hidden");
    startBtn.disabled = true;
    loadModel();
}

function closeModal(){
    stopCamera();
    overlay.classList.add("hidden");
}

// ---------------- EVENTS ----------------
(attendanceCard || {}).addEventListener?.("click", openModal);
(attendanceCard || {}).addEventListener?.("keydown", (e) => {
    if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        openModal();
    }
});
closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => {
    if(e.target === overlay) closeModal();
});
startBtn.addEventListener("click", () => {
    if(running) stopCamera(); else startCamera();
});
saveBtn.addEventListener("click", saveAttendance);
document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !overlay.classList.contains("hidden")) closeModal();
});
window.addEventListener("beforeunload", () => {
    if(stream) stream.getTracks().forEach(t => t.stop());
});

// ---------- INIT ----------
window.addEventListener("DOMContentLoaded", refreshCard);

})();
