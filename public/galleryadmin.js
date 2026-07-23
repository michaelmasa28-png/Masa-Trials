// =====================================
// Kingdom Ways Church CMS
// Gallery Admin JS
// Drag & Drop + Multiple Upload
// =====================================

const form = document.getElementById("galleryForm");

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");

const imageInput = document.getElementById("image");

const preview = document.getElementById("previewImage");

// FIXED CASE SENSITIVITY TO MATCH THE HTML DIV ID EXACTLY
const gallery = document.getElementById("admingallery");

const dropArea = imageInput.parentElement;

let galleryImages = [];
let selectedFiles = [];

// =====================================
// SHOW SAVED IMAGES
// =====================================

async function displayGallery() {

    try {

        const response = await fetch("/api/gallery/");
        galleryImages = await response.json();

        gallery.innerHTML = "";

        galleryImages.forEach((item) => {

            const card = document.createElement("div");

            card.className = "gallery-card";

            card.innerHTML = `
                <img src="${item.image}" style="width:100%; max-width:200px; display:block; margin-bottom:10px;">

                <h3>${item.title}</h3>

                <p>${item.category || "General"}</p>

                <button type="button" onclick="deleteImage(${item.id})">
                    Delete
                </button>
            `;

            gallery.appendChild(card);

        });

    } catch (err) {

        console.error("Failed to load gallery:", err);

    }

}

// =====================================
// FILE SELECT
// =====================================

imageInput.addEventListener("change", (e) => {

    selectedFiles = [...e.target.files];

    if (selectedFiles.length) {
        showPreview(selectedFiles[0]);
    }

});

// =====================================
// DRAG EVENTS
// =====================================

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

// =====================================
// IMAGE PREVIEW
// =====================================

function showPreview(file) {

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

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (selectedFiles.length === 0) {
        alert("Please select an image.");
        return;
    }

    for (const file of selectedFiles) {

        const formData = new FormData();

        formData.append("title", titleInput.value);
        formData.append("category", categoryInput.value);
        formData.append("image", file);

        const response = await fetch("/api/gallery/", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        console.log(result);

    }

    form.reset();

    preview.style.display = "none";
    preview.src = "";

    selectedFiles = [];

    await displayGallery();

    alert("Gallery image uploaded successfully.");

});

// =====================================
// DELETE IMAGE
// =====================================

async function deleteImage(id) {

    if (!confirm("Delete this image?")) return;

    try {

        const response = await fetch(`/api/gallery/${id}`, {
            method: "DELETE"
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

// Make deleteImage available to the HTML onclick
window.deleteImage = deleteImage;

// =====================================
// LOAD ON START
// =====================================

displayGallery();


