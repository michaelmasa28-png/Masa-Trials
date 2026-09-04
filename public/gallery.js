/// =====================================
// Kingdom Ways Church
// Gallery JavaScript
// =====================================

// XSS sanitize
function escapeHtml(val) {
    return String(val == null ? "" : val).replace(/[&<>"']/g, function(c) {
        return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c];
    });
}

// Global State
let images = [];
let activeCategory = "All";
let activeSearchQuery = "";

// DOM Elements
const gallery = document.getElementById("gallery");
const buttons = document.querySelectorAll(".filters button");
const search = document.getElementById("search");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const close = document.getElementById("close");

// =====================================
// LOAD GALLERY FROM DATABASE
// =====================================
async function loadGallery() {
    try {
        const response = await fetch("/api/gallery/");

        if (!response.ok) {
            throw new Error("Failed to load gallery.");
        }

        images = await response.json();
        
        // Re-apply existing filters/search terms during auto-refreshes
        applyFiltersAndSearch();

    } catch (error) {
        console.error(error);
        gallery.innerHTML = `
            <h2 style="text-align:center;padding:40px;">
                Failed to load gallery.
            </h2>
        `;
    }
}

// =====================================
// FILTER AND SEARCH ENGINE
// =====================================
function applyFiltersAndSearch() {
    let filtered = images;

    // 1. Filter by category
    if (activeCategory !== "All") {
        filtered = filtered.filter(img => 
            img.category.toLowerCase() === activeCategory.toLowerCase()
        );
    }

    // 2. Filter by search input
    if (activeSearchQuery !== "") {
        filtered = filtered.filter(img => 
            img.title.toLowerCase().includes(activeSearchQuery) ||
            img.category.toLowerCase().includes(activeSearchQuery)
        );
    }

    displayGallery(filtered);
}

// =====================================
// DISPLAY GALLERY
// =====================================
function displayGallery(items) {
    gallery.innerHTML = "";

    if (items.length === 0) {
        gallery.innerHTML = `
            <h2 style="text-align:center;padding:40px;">
                No images found.
            </h2>
        `;
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "gallery-card";
        card.innerHTML = `
            <img
                src="${escapeHtml(item.image)}"
                alt="${escapeHtml(item.title)}"
                data-image="${escapeHtml(item.image)}"
            >
            <div class="caption">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.category)}</p>
            </div>
        `;
        gallery.appendChild(card);
    });
}

// =====================================
// FILTER BUTTON EVENT LISTENERS
// =====================================
buttons.forEach(button => {
    button.addEventListener("click", () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        activeCategory = button.textContent.trim();
        applyFiltersAndSearch();
    });
});

// =====================================
// SEARCH INPUT EVENT LISTENER
// =====================================
search.addEventListener("keyup", () => {
    activeSearchQuery = search.value.trim().toLowerCase();
    applyFiltersAndSearch();
});

// =====================================
// REFRESH GALLERY UTILITY
// =====================================
function refreshGallery() {
    loadGallery();
}

// =====================================
// LIGHTBOX (Event Delegation)
// =====================================
// Captures clicks globally on the container to prevent multiple listener attachments
gallery.addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
        lightbox.style.display = "flex";
        lightboxImg.src = e.target.dataset.image;
        lightboxImg.alt = e.target.alt;
    }
});

// Close button click
close.addEventListener("click", () => {
    lightbox.style.display = "none";
});

// Click outside image area
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = "none";
    }
});

// Close via ESC key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        lightbox.style.display = "none";
    }
});

// =====================================
// TIMERS & ENGINE INITIALIZATION
// =====================================

// Run auto-refresh every 30 seconds
setInterval(loadGallery, 30000);

// Single execution trigger for page load
loadGallery();

