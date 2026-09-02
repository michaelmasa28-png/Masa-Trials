// =============================================
// KINGDOM WAYS - CAMERA ATTENDANCE (v3)
// dashboard-ai.js
// Browser TensorFlow.js (Coco-SSD) person detection
// + robust centroid tracking with:
//   - local model files (works offline, no internet needed)
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
const videoWrap    = document.getElementById("aiVideoWrap");
const enteredEl    = document.getElementById("aiEntered");
const exitedEl     = document.getElementById("aiExited");
const uniqueEl     = document.getElementById("aiUnique");
const attendanceCard = document.getElementById("attendanceCard");
const camSelect    = document.getElementById("aiCameraSelect");
const flashBtn     = document.getElementById("aiFlashBtn");
const mirrorBtn    = document.getElementById("aiMirrorBtn");

// ---------- TUNING PARAMETERS ----------
const MODEL_BASE       = "/models/coco-ssd/model.json"; // local -> works offline
const CONF_THRESH      = 0.50;                   // min detection confidence
const NMS_IOU          = 0.40;                   // dedupe overlapping boxes
const CONFIRM_FRAMES   = 3;                      // frames before a track counts
const TTL_FRAMES       = 12;                     // frames to keep a lost track (anti-flicker)
const LINE_MARGIN      = 22;                     // px margin to fight jitter at the line
const MATCH_IOU        = 0.20;                   // IoU to match a detection to a track
const DETECT_INTERVAL  = 90;                     // ms between detections (~11 fps, stays smooth)
const GHOST_FRAMES     = 45;                     // frames a purged track lingers (anti double-record)
const MIN_BOX_AREA     = 0.01;                   // reject boxes smaller than 1% of frame (noise/far)
const MAX_BOX_AREA     = 0.85;                   // reject boxes covering nearly the whole frame
const MIN_ASPECT       = 0.28;                   // ignore boxes wider than tall (not a standing person)

// --- LOW-LIGHT ENHANCEMENT ---
// When a frame is darker than LOWLIGHT_LUMA, we gamma-brighten it before
// detection and relax the confidence gate, so people remain detectable even
// in dim/backlit or overexposed scenes — while the trajectory filters still
// block false positives.
const LOWLIGHT_LUMA      = 70;    // avg luminance below this => treat as dark
const BRIGHT_LUMA        = 165;   // avg luminance above this => treat as overexposed
const ENHANCE_GAMMA      = 0.55;  // gamma for dark frames (<1 brightens)
const ENHANCE_GAMMA_HIGH = 1.65;  // gamma for overexposed frames (>1 darkens)
const CONF_BRIGHT        = 0.50;  // min confidence in normal light
const CONF_LOWLIGHT      = 0.30;  // min confidence in dark scenes (recover dim people)
const LUMA_SAMPLE_STEP   = 8;     // downsampling step when measuring luminance

// Robust crossing confidence: a person must be seen consistently on one side,
// then consistently on the other side, before we count the crossing. This
// removes jitter/standing-near-line false positives and identity double-counts.
const SIDE_FRAMES          = 2;   // consecutive frames a centroid must stay on a side to confirm it
const CROSS_REQUIRE_OLD    = 2;   // samples needed on the starting side before crossing counts
const CROSS_REQUIRE_NEW    = 2;   // samples needed on the new side to confirm the crossing
const REENTRY_COOLDOWN     = 20;  // frames before the same track may cross again (anti-oscillation)
const GHOST_RADIUS         = 220; // px distance up to which a lost person reconnects (keeps identity)

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

// Adaptive detection threshold, adjusted per frame for low-light conditions
let activeConf = CONF_BRIGHT;
let lastLuma  = -1;              // average luminance of the latest frame (-1 = unknown)

// Offscreen canvas used to pre-brighten dim frames before recognition
let enhCanvas = null;
let enhCtx    = null;

// ---------- CAMERA CONTROL STATE ----------
let camDevices       = [];       // resolved video input devices
let currentDeviceId  = null;     // active deviceId (null = auto/default)
let currentFacing    = "environment";
let mirror           = false;
let torchOn          = false;
let reservedDevices  = false;    // camera enumeration is async-gated


// ---------- AUTH ----------
function authToken(){
    try{
        const s = JSON.parse(localStorage.getItem("adminSession") || "{}");
        return s.token || "";
    }catch(e){ return ""; }
}

// ---------- MODEL ----------
async function loadModel(){
    clearStatus();
    startBtn.disabled = true;

    // Guard: the TF.js / Coco-SSD libraries must have loaded.
    if(typeof tf === "undefined" || typeof cocoSsd === "undefined"){
        statusEl.textContent = "Recognition engine not loaded. Please refresh the page.";
        statusEl.classList.add("error");
        startBtn.disabled = false;
        return;
    }

    statusEl.textContent = "Loading recognition model\u2026 (first time only)";
    try{
        model = await cocoSsd.load({ modelUrl: MODEL_BASE });
        modelReady = true;
        startBtn.disabled = false;
        statusEl.textContent = "Recognition ready. Press Start Camera.";
        statusEl.classList.add("ok");
    }catch(err){
        console.error(err);
        modelReady = false;
        startBtn.disabled = false;
        statusEl.textContent = "Could not load recognition model. The model files may be missing.";
        statusEl.classList.add("error");
    }
}

function clearStatus(){
    statusEl && statusEl.classList.remove("error","ok");
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
    const frameArea = canvas.width * canvas.height;
    const people = [];
    for(const p of predictions){
        if(p.class !== "person") continue;
        if(p.score !== undefined && p.score < CONF_THRESH) continue;

        const w = p.bbox[2], h = p.bbox[3];
        if(w <= 0 || h <= 0) continue;

        // source size sanity: reject tiny/noise and near-full-frame detections
        const area = w * h;
        const areaRatio = area / frameArea;
        if(areaRatio < MIN_BOX_AREA) continue;
        if(areaRatio > MAX_BOX_AREA) continue;

        // people are usually taller than wide; drop squashed/wide boxes
        if((w / h) > 1.15) continue;

        people.push({
            x: p.bbox[0], y: p.bbox[1],
            w: w, h: h,
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
                const score = 1 - d / (g.rad || GHOST_RADIUS);
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
                    entered: g.entered, exited: g.exited,
                    side: g.side, sideCount: g.sideCount || 0, sidePrev: g.sidePrev,
                    hist: g.hist || [], histTally: g.histTally || 0,
                    crossCool: g.crossCool || 0
                };
            }else{
                trackId = nextId++;
                track = {
                    id: trackId, box, cx, cy,
                    zone: z, prevZone: z,
                    seen: 1, lastSeen: frameCounter,
                    entered: false, exited: false,
                    side: null, sideCount: 0, sidePrev: null,
                    hist: [], histTally: 0,
                    crossCool: 0
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
        if(track.crossCool > 0) track.crossCool--;

        // hysteresis zone update
        const cz = zoneOf(cy, line);
        const prev = track.zone;
        if(cz){
            track.prevZone = prev;
            track.zone = cz;
        }

        // 4) ROBUST CROSSING DETECTION (side-consistent, trajectory-based)
        // Every confirmed crossing of the CENTER line is counted by direction:
        //   OUT -> IN  : "Entered" (person walks into view / passes the line)
        //   IN -> OUT  : "Exited"  (person crosses back the opposite direction)
        // The trajectory + re-entry cooldown guarantee a single crossing is
        // never counted twice, so each clear pass of the line is exactly one
        // enter or one exit.
        if(track.seen >= CONFIRM_FRAMES){
            const cur = track.zone;
            if(cur){
                // push current side into bounded history
                track.hist.push(cur);
                if(track.hist.length > CROSS_REQUIRE_OLD + CROSS_REQUIRE_NEW) track.hist.shift();

                // stabilize current "side": require SIDE_FRAMES consecutive same side
                if(track.side === cur){
                    track.sideCount++;
                }else if(track.side === null){
                    track.side = cur;
                    track.sideCount = 1;
                }else{
                    // side changed: only commit once seen consistently on new side
                    track.sideCount++;
                    if(track.sideCount >= SIDE_FRAMES){
                        // history confirms we truly came from the other side
                        const hist = track.hist;
                        // OUT -> IN : ENTERED
                        if(track.side === "OUT" && cur === "IN" && track.crossCool === 0){
                            const oldCount = hist.slice(0, CROSS_REQUIRE_OLD).filter(s => s === "OUT").length;
                            const newCount = hist.slice(-CROSS_REQUIRE_NEW).filter(s => s === "IN").length;
                            if(oldCount >= CROSS_REQUIRE_OLD && newCount >= CROSS_REQUIRE_NEW){
                                track.entered = true;
                                track.crossCool = REENTRY_COOLDOWN;
                                if(!enteredIds.has(trackId)){
                                    enteredIds.add(trackId);
                                }
                                enteredCount++;
                            }
                        }
                        // IN -> OUT : EXITED (person crossed back the opposite direction)
                        else if(track.side === "IN" && cur === "OUT" && track.crossCool === 0){
                            const oldCount = hist.slice(0, CROSS_REQUIRE_OLD).filter(s => s === "IN").length;
                            const newCount = hist.slice(-CROSS_REQUIRE_NEW).filter(s => s === "OUT").length;
                            if(oldCount >= CROSS_REQUIRE_OLD && newCount >= CROSS_REQUIRE_NEW){
                                track.exited = true;
                                track.crossCool = REENTRY_COOLDOWN;
                                exitedCount++;
                            }
                        }
                        track.sidePrev = track.side;
                        track.side = cur;
                        track.sideCount = 1;
                    }
                }
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
                rad: GHOST_RADIUS,
                entered: t.entered, exited: t.exited,
                side: t.side, sideCount: t.sideCount, sidePrev: t.sidePrev,
                hist: t.hist, histTally: t.histTally, crossCool: t.crossCool || 0,
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
function buildConstraints(){
    if(currentDeviceId){
        return {
            video: { deviceId: { exact: currentDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false
        };
    }
    // Without a chosen device, hint the desired facing; the browser picks the closest match.
    return {
        video: {
            facingMode: { ideal: currentFacing },
            width: { ideal: 1920 }, height: { ideal: 1080 }
        },
        audio: false
    };
}

async function _acquire(){
    try{
        return await navigator.mediaDevices.getUserMedia(buildConstraints());
    }catch(e){
        // Facing/exact-device request failed (e.g. only one camera) -> use any camera
        try{
            return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }catch(e2){
            throw e2;
        }
    }
}

async function __applyStream(){
    await waitForSize();
    videoW = video.videoWidth || 1280;
    videoH = video.videoHeight || 720;
    canvas.width = videoW;
    canvas.height = videoH;

    // flash is only offered if the active track can apply a torch constraint
    const track = stream && stream.getVideoTracks()[0];
    let supported = !!(track && typeof track.applyConstraints === "function");
    if(supported){
        try{ supported = "torch" in (track.getCapabilities ? track.getCapabilities() : {}); }
        catch(e){ supported = true; }
    }
    torchOn = false;
    flashBtn.disabled = !supported;
    if(!supported){ flashBtn.classList.remove("active"); }
}

// enumeration + selector population
async function resolveCameras(){
    if(!navigator.mediaDevices?.enumerateDevices){ return; }
    try{
        const all = await navigator.mediaDevices.enumerateDevices();
        camDevices = all.filter(d => d.kind === "videoinput");
        reservedDevices = true;
    }catch(e){
        camDevices = [];
    }

    // keep any previously-selected device (survives permission prompt changes)
    const prev = currentDeviceId;
    camSelect.innerHTML = "";
    const auto = document.createElement("option");
    auto.value = "auto";
    auto.textContent = "Auto (default)";
    camSelect.appendChild(auto);

    camDevices.forEach((d, i) => {
        const face = /front|user/i.test(d.label) ? "Front" :
                     (/back|environment|rear/i.test(d.label) ? "Back" : "Camera");
        const opt = document.createElement("option");
        opt.value = d.deviceId;
        opt.textContent = face + " " + (i + 1) + (d.label ? " \u2014 " + d.label : "");
        camSelect.appendChild(opt);
    });
    // re-select previous device if still present
    if(prev){
        const still = camDevices.some(d => d.deviceId === prev);
        camSelect.value = still ? prev : "auto";
        if(!still) currentDeviceId = null;
    }
}

// pick the best default camera (prefer rear for a door)
async function pickDefaultCamera(){
    if(camDevices.length === 0) return;
    const rear = camDevices.find(d => /back|environment|rear/i.test(d.label)) ||
                 camDevices.find(d => /front|user/i.test(d.label));
    if(rear){
        currentDeviceId = rear.deviceId;
        camSelect.value = rear.deviceId;
    }
}

function applyMirror(){
    video.classList.toggle("mirror", mirror);
    canvas.classList.toggle("mirror", mirror);
    videoWrap && videoWrap.classList.toggle("mirror", mirror);
    mirrorBtn.classList.toggle("active", mirror);
    mirrorBtn.title = mirror ? "Un-mirror" : "Mirror (selfie view)";
}

async function toggleFlash(){
    if(!stream) return;
    const track = stream.getVideoTracks()[0];
    if(!track || typeof track.applyConstraints !== "function") return;
    torchOn = !torchOn;
    try{
        await track.applyConstraints({ advanced: [{ torch: torchOn }] });
        flashBtn.classList.toggle("active", torchOn);
    }catch(e){
        // torch unsupported on this camera -> reset state
        torchOn = false;
        flashBtn.disabled = true;
        flashBtn.classList.remove("active");
        flashBtn.title = "Flash not supported on this camera";
    }
}

async function switchCamera(){
    const val = camSelect.value;
    currentDeviceId = val === "auto" ? null : val;
    currentFacing = /front|user/i.test(camSelect.selectedOptions[0].text) ? "user" : "environment";
    if(running){
        // restart the stream with the new camera, keep counters
        stopStream();
        await startStream();
    }
}

async function startStream(){
    const acquired = await _acquire();
    stream = acquired;
    video.srcObject = stream;
    try{ await video.play(); }catch(e){ /* muted autoplay usually fine */ }
    await __applyStream();
}

function stopStream(){
    if(stream){
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    if(video) video.srcObject = null;
    if(flashBtn){ flashBtn.classList.remove("active"); flashBtn.disabled = true; }
    torchOn = false;
}

async function startCamera(){
    if(!modelReady){
        statusEl.textContent = "Recognition not ready yet \u2026";
        statusEl.classList.add("error");
        return;
    }
    if(!reservedDevices){ await resolveCameras(); await pickDefaultCamera(); }

    stopStream();
    try{
        await startStream();
    }catch(e){
        console.error("Camera unavailable", e);
        statusEl.textContent = "Camera not found or permission denied. Allow camera access and retry.";
        statusEl.classList.add("error");
        return;
    }

    // Permission is now granted, so labels/devices are exposed: refresh the picker.
    await resolveCameras();

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
}

async function waitForSize(){
    for(let i = 0; i < 20 && (!video.videoWidth || !video.videoHeight); i++){
        await new Promise(r => setTimeout(r, 50));
    }
}

function stopCamera(){
    running = false;
    if(detectTimer){ clearTimeout(detectTimer); detectTimer = null; }
    stopStream();
    if(ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(startBtn){
        startBtn.classList.remove("recording");
        startBtn.innerHTML = '<i class="fa-solid fa-video"></i> Start Camera';
    }
    if(statusEl && !statusEl.classList.contains("hidden")){
        statusEl.textContent = "Camera stopped.";
        statusEl.classList.remove("ok");
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
                notes: "Camera attendance (" + enteredIds.size + " unique)"
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
    applyMirror();
    resolveCameras(); // pre-populate the camera picker (may be empty until first permission)
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
camSelect.addEventListener("change", switchCamera);
flashBtn.addEventListener("click", toggleFlash);
mirrorBtn.addEventListener("click", () => {
    mirror = !mirror;
    applyMirror();
});
document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !overlay.classList.contains("hidden")) closeModal();
});
window.addEventListener("beforeunload", () => {
    if(stream) stream.getTracks().forEach(t => t.stop());
});

// ---------- INIT ----------
window.addEventListener("DOMContentLoaded", refreshCard);

})();
