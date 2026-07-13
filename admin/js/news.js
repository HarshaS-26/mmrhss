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

const newsForm = document.getElementById("newsForm");
const newsList = document.getElementById("newsList");
const formMessage = document.getElementById("formMessage");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const imageInput = document.getElementById("news_image");
const imagePreviewBox = document.getElementById("imagePreviewBox");
const imagePreview = document.getElementById("imagePreview");

let currentImageUrl = null;

imageInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        imagePreviewBox.style.display = "none";
        imagePreview.src = "";
        return;
    }

    imagePreview.src = URL.createObjectURL(file);
    imagePreviewBox.style.display = "block";
    imagePreviewBox.querySelector("span").textContent = "New Image Preview";
});

function showMessage(message, color = "green") {
    formMessage.style.display = "block";
    formMessage.style.color = color;
    formMessage.textContent = message;

    clearTimeout(window.formMessageTimer);

    window.formMessageTimer = setTimeout(() => {
        formMessage.textContent = "";
        formMessage.style.display = "none";
    }, 1800);
}

newsForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    formMessage.style.color = "#64748B";
    formMessage.innerHTML = "Saving...";

    const newsId = document.getElementById("news_id").value;
    const imageFile = imageInput.files[0];

    let imageUrl = null;

    try {
        if (imageFile) {
            formMessage.innerHTML = "Compressing image...";

            imageUrl = await uploadCompressedImage(
                "news-images",
                "news",
                imageFile
            );

            if (newsId && currentImageUrl) {
                await deleteStorageFile("news-images", currentImageUrl);
            }
        }

        const newsData = {
            title: document.getElementById("title").value.trim(),
            category: document.getElementById("category").value,
            event_date: document.getElementById("event_date").value,
            description: document.getElementById("description").value.trim(),
            status: document.getElementById("status").value
        };

        if (imageUrl) {
            newsData.image_url = imageUrl;
        }

        let error;

        if (newsId) {
            ({ error } = await supabaseClient
                .from("news_events")
                .update(newsData)
                .eq("id", newsId));
        } else {
            ({ error } = await supabaseClient
                .from("news_events")
                .insert([newsData]));
        }

        if (error) {
            showMessage(error.message, "#dc3545");
            return;
        }

        showMessage(
            newsId ? "News/Event updated successfully." : "News/Event saved successfully.",
            "green"
        );

        resetNewsForm();
        loadNews();

    } catch (err) {
        showMessage(err.message || err, "#dc3545");
    }
});

async function loadNews() {
    const { data, error } = await supabaseClient
        .from("news_events")
        .select("*")
        .order("event_date", { ascending: false });

    if (error) {
        newsList.innerHTML = `<p style="color:red">${error.message}</p>`;
        return;
    }

    if (!data.length) {
        newsList.innerHTML = "<p>No news or events added yet.</p>";
        return;
    }

    newsList.innerHTML = data.map(item => `
        <div class="news-item">

            ${item.image_url ? `
                <div class="news-image">
                    <img src="${item.image_url}" alt="${item.title}">
                </div>
            ` : ""}

            <div class="news-content">
                <small>${item.category} • ${item.event_date} • ${item.status}</small>
                <h4>${item.title}</h4>
                <p>${item.description}</p>

                <div class="news-actions">
                    <button class="edit-btn" onclick="editNews('${item.id}')">
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>

                    <button class="delete-btn" onclick="deleteNews('${item.id}', '${item.image_url || ""}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>

        </div>
    `).join("");
}

async function editNews(id) {
    const { data, error } = await supabaseClient
        .from("news_events")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById("news_id").value = data.id;
    document.getElementById("title").value = data.title;
    document.getElementById("category").value = data.category;
    document.getElementById("event_date").value = data.event_date;
    document.getElementById("description").value = data.description;
    document.getElementById("status").value = data.status;

    currentImageUrl = data.image_url || null;

    if (data.image_url) {
        imagePreview.src = data.image_url;
        imagePreviewBox.style.display = "block";
        imagePreviewBox.querySelector("span").textContent = "Current Image";
    } else {
        imagePreview.src = "";
        imagePreviewBox.style.display = "none";
    }

    document.getElementById("formTitle").textContent = "Edit News / Event";
    saveBtn.innerHTML = "Update";
    cancelEditBtn.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

async function deleteNews(id, imageUrl) {
    if (!confirm("Delete this news/event?")) return;

    const { error } = await supabaseClient
        .from("news_events")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    if (imageUrl) {
        await deleteStorageFile("news-images", imageUrl);
    }

    resetNewsForm();
    loadNews();
}

function resetNewsForm() {
    newsForm.reset();
    document.getElementById("news_id").value = "";
    saveBtn.innerHTML = "Publish";
    document.getElementById("formTitle").innerHTML = "Add News / Event";
    cancelEditBtn.style.display = "none";
    formMessage.textContent = "";

    currentImageUrl = null;

    imagePreview.src = "";
    imagePreviewBox.style.display = "none";
    imagePreviewBox.querySelector("span").textContent = "Image Preview";
}

cancelEditBtn.addEventListener("click", resetNewsForm);

loadNews();