async function checkUser() {
    const { data } = await supabaseClient.auth.getUser();

    if (!data.user) {
        window.location = "index.html";
    }
}

checkUser();

document.getElementById("logoutBtn").addEventListener("click", async function () {
    await supabaseClient.auth.signOut();
    window.location = "index.html";
});

const galleryForm = document.getElementById("galleryForm");
const galleryList = document.getElementById("galleryList");
const formMessage = document.getElementById("formMessage");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const imageInput = document.getElementById("gallery_image");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

let currentImageUrl = null;

imageInput.addEventListener("change", function () {
    imagePreviewContainer.innerHTML = "";

    const files = Array.from(this.files);

    files.forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        imagePreviewContainer.appendChild(img);
    });
});

function showMessage(message, color = "green") {
    formMessage.style.display = "block";
    formMessage.style.color = color;
    formMessage.textContent = message;

    clearTimeout(window.formMessageTimer);

    window.formMessageTimer = setTimeout(() => {
        formMessage.textContent = "";
        formMessage.style.display = "none";
    }, 2500);
}

galleryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const galleryId = document.getElementById("gallery_id").value;
    const files = Array.from(imageInput.files);
    if (files.length > 10) {
        showMessage("You can upload a maximum of 10 images at a time.", "#dc3545");
        return;
    }

    for (const file of files) {
        if (file.size > 15 * 1024 * 1024) {
            showMessage(`"${file.name}" exceeds the 15 MB limit.`, "#dc3545");
            return;
        }
    }

    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;

    if (!galleryId && files.length === 0) {
        showMessage("Please select at least one image.", "#dc3545");
        return;
    }

    saveBtn.disabled = true;

    try {
        if (galleryId) {
            let imageUrl = null;

            if (files.length > 0) {
                formMessage.innerHTML = "Compressing image...";

                imageUrl = await uploadCompressedImage(
                    "gallery-images",
                    "gallery",
                    files[0]
                );

                if (currentImageUrl) {
                    await deleteStorageFile("gallery-images", currentImageUrl);
                }
            }

            const galleryData = {
                title,
                category,
                status
            };

            if (imageUrl) {
                galleryData.image_url = imageUrl;
            }

            const { error } = await supabaseClient
                .from("gallery")
                .update(galleryData)
                .eq("id", galleryId);

            if (error) {
                showMessage(error.message, "#dc3545");
                saveBtn.disabled = false;
                return;
            }

            showMessage("Gallery image updated successfully.", "green");
        } else {
            for (let i = 0; i < files.length; i++) {
                formMessage.innerHTML = `Uploading ${i + 1} of ${files.length}...`;

                const imageUrl = await uploadCompressedImage(
                    "gallery-images",
                    "gallery",
                    files[i]
                );

                const galleryData = {
                    title: files.length === 1 ? title : `${title} ${i + 1}`,
                    category,
                    status,
                    image_url: imageUrl
                };

                const { error } = await supabaseClient
                    .from("gallery")
                    .insert([galleryData]);

                if (error) {
                    showMessage(error.message, "#dc3545");
                    saveBtn.disabled = false;
                    return;
                }
            }

            showMessage(`${files.length} image(s) uploaded successfully.`, "green");
        }

        resetGalleryForm();
        loadGallery();

    } catch (err) {
        showMessage(err.message || err, "#dc3545");
    }

    saveBtn.disabled = false;
});

async function loadGallery() {
    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        galleryList.innerHTML = `<p style="color:red">${error.message}</p>`;
        return;
    }

    if (!data.length) {
        galleryList.innerHTML = "<p>No gallery images added yet.</p>";
        return;
    }

    galleryList.innerHTML = data.map(item => `
        <div class="news-item">

            <div class="news-image">
                <img src="${item.image_url}" alt="${item.title}">
            </div>

            <div class="news-content">
                <small>${item.category} • ${item.status}</small>
                <h4>${item.title}</h4>

                <div class="news-actions">
                    <button class="edit-btn" onclick="editGallery('${item.id}')">
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>

                    <button class="delete-btn" onclick="deleteGallery('${item.id}', '${item.image_url}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>

        </div>
    `).join("");
}

async function editGallery(id) {
    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById("gallery_id").value = data.id;
    document.getElementById("title").value = data.title;
    document.getElementById("category").value = data.category;
    document.getElementById("status").value = data.status;

    currentImageUrl = data.image_url;

    imagePreviewContainer.innerHTML = `
        <img src="${data.image_url}" alt="${data.title}">
    `;

    document.getElementById("formTitle").textContent = "Edit Gallery Image";
    saveBtn.innerHTML = "Update";
    cancelEditBtn.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

async function deleteGallery(id, imageUrl) {
    if (!confirm("Delete this gallery image?")) return;

    const { error } = await supabaseClient
        .from("gallery")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    if (imageUrl) {
        await deleteStorageFile("gallery-images", imageUrl);
    }

    resetGalleryForm();
    loadGallery();
}

function resetGalleryForm() {
    galleryForm.reset();
    document.getElementById("gallery_id").value = "";
    saveBtn.innerHTML = "Publish";
    saveBtn.disabled = false;
    document.getElementById("formTitle").innerHTML = "Add Gallery Image";
    cancelEditBtn.style.display = "none";
    formMessage.textContent = "";

    currentImageUrl = null;
    imagePreviewContainer.innerHTML = "";
}

cancelEditBtn.addEventListener("click", resetGalleryForm);

loadGallery();