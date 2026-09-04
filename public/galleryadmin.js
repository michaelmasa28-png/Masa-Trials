// =====================================
// Kingdom Ways Church CMS
// Gallery Admin JS
// Drag & Drop + Multiple Upload
// =====================================

// XSS sanitize
function escapeHtml(val) {
    return String(val == null ? "" : val).replace(/[&<>"']/g, function(c) {
        return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c];
    });
}

const form = document.getElementById("galleryForm");

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");

const imageInput = document.getElementById("image");

const preview = document.getElementById("previewImage");

const gallery = document.getElementById("admingallery");

const dropArea = imageInput ? imageInput.parentElement : null;

let galleryImages = [];
let selectedFiles = [];

function getToken() {
    const session = JSON.parse(localStorage.getItem("adminSession") || "{}");
    return session.token || "";
}

// =====================================
// SHOW SAVED IMAGES
// =====================================

async function displayGallery() {

    try {

        const response = await fetch("/api/gallery/", {
            headers: { "Authorization": `Bearer ${getToken()}` }
        });
        galleryImages = await response.json();

        if (gallery) {
            gallery.innerHTML = "";

            if (!Array.isArray(galleryImages) || galleryImages.length === 0) {
                gallery.innerHTML = '<p style="color:#999; padding:20px;">No gallery images yet.</p>';
                return;
            }

            galleryImages.forEach((item) => {

                const card = document.createElement("div");

                card.className = "gallery-card";

                card.innerHTML = `
                    <img src="${escapeHtml(item.image)}" style="width:100%; max-width:200px; display:block; margin-bottom:10px;">

                    <h3>${escapeHtml(item.title || "Untitled")}</h3>

                    <p>${escapeHtml(item.category || "General")}</p>

                    <button type="button" onclick="deleteImage(${item.id})">
                        Delete
                    </button>
                `;

                gallery.appendChild(card);

            });
        }

    } catch (err) {

        console.error("Failed to load gallery:", err);

    }

}

// =====================================
// FILE SELECT
// =====================================

if (imageInput) {
    imageInput.addEventListener("change", (e) => {

        selectedFiles = [...e.target.files];

        if (selectedFiles.length) {
            showPreview(selectedFiles[0]);
        }

    });
}

// =====================================
// DRAG EVENTS
// =====================================

if (dropArea) {
    dropArea.addEventListener("dragover", (e) => {

        e.preventDefault();
        dropArea.style.background = "#e8eaff";

    });

    dropArea.addEventListener("dragleave", () => {

        dropArea.style.background = "";

    });

    dropArea.addEventListener("drop", (e) => {

        e.preventDefault();

        dropArea.style.background = "";

        selectedFiles = [...e.dataTransfer.files]
            .filter(file => file.type.startsWith("image/"));

        if (selectedFiles.length) {
            showPreview(selectedFiles[0]);
        }

    });
}

// =====================================
// IMAGE PREVIEW
// =====================================

function showPreview(file) {

    if (!preview) return;

    const reader = new FileReader();

    reader.onload = function () {

        preview.src = reader.result;
        preview.style.display = "block";

    };

    reader.readAsDataURL(file);

}

// =====================================
// SAVE IMAGES
// =====================================

if (form) {
    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert("Please select an image.");
            return;
        }

        for (const file of selectedFiles) {

            const formData = new FormData();

            formData.append("title", titleInput ? titleInput.value : "");
            formData.append("category", categoryInput ? categoryInput.value : "");
            formData.append("image", file);

            const response = await fetch("/api/gallery/", {
                method: "POST",
                headers: { "Authorization": `Bearer ${getToken()}` },
                body: formData
            });

            const result = await response.json();

        }

        form.reset();

        if (preview) {
            preview.style.display = "none";
            preview.src = "";
        }

        selectedFiles = [];

        await displayGallery();

        alert("Gallery image uploaded successfully.");

    });
}

// =====================================
// DELETE IMAGE
// =====================================

async function deleteImage(id) {

    if (!confirm("Delete this image?")) return;

    try {

        const response = await fetch(`/api/gallery/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${getToken()}` }
        });

        const result = await response.json();

        if (response.ok && result.success) {

            await displayGallery();

            alert("Image deleted successfully.");

        } else {

            alert(result.message || "Failed to delete image.");

        }

    } catch (err) {

        console.error(err);
        alert("Server error while deleting image.");

    }

}

window.deleteImage = deleteImage;

// =====================================
// LOAD ON START
// =====================================

displayGallery();
