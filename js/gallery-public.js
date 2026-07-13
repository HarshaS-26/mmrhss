const publicGalleryGrid = document.getElementById("publicGalleryGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const galleryTabs = document.getElementById("galleryTabs");

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.getElementById("modalClose");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalCounter = document.getElementById("modalCounter");

let galleryItems = [];
let filteredItems = [];
let visibleCount = 0;
let activeCategory = "All";
let currentIndex = 0;

const itemsPerLoad = 12;

function showSkeletons(count = 8) {
    publicGalleryGrid.innerHTML = "";

    for (let i = 0; i < count; i++) {
        publicGalleryGrid.innerHTML += `<div class="gallery-skeleton"></div>`;
    }
}

async function loadPublicGallery() {
    showSkeletons(12);

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: true });

    if (error) {
        publicGalleryGrid.innerHTML = "<p>Unable to load gallery.</p>";
        galleryTabs.innerHTML = "";
        return;
    }

    galleryItems = data || [];
    filteredItems = galleryItems;

    if (!galleryItems.length) {
        publicGalleryGrid.innerHTML = "<p>No gallery images available yet.</p>";
        galleryTabs.innerHTML = "";
        return;
    }

    createCategoryTabs();
    resetGalleryView(false);
}

function createCategoryTabs() {
    const categories = [...new Set(galleryItems.map(item => item.category))];
    const allCount = galleryItems.length;

    galleryTabs.innerHTML = `
        <span class="active" data-category="All">All (${allCount})</span>
        ${categories.map(category => {
            const count = galleryItems.filter(item => item.category === category).length;
            return `<span data-category="${category}">${category} (${count})</span>`;
        }).join("")}
    `;

    document.querySelectorAll("#galleryTabs span").forEach(tab => {
        tab.addEventListener("click", function () {
            document.querySelectorAll("#galleryTabs span").forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            activeCategory = this.dataset.category;

            filteredItems = activeCategory === "All"
                ? galleryItems
                : galleryItems.filter(item => item.category === activeCategory);

            resetGalleryView(true);
        });
    });
}

function resetGalleryView(showTransition = true) {
    visibleCount = 0;
    loadMoreBtn.style.display = "none";

    if (showTransition) {
        showSkeletons(Math.min(filteredItems.length, 8));

        setTimeout(() => {
            publicGalleryGrid.innerHTML = "";
            showMoreImages();
        }, 300);
    } else {
        publicGalleryGrid.innerHTML = "";
        showMoreImages();
    }
}

function showMoreImages() {
    const nextItems = filteredItems.slice(visibleCount, visibleCount + itemsPerLoad);

    nextItems.forEach((item, index) => {
        const realIndex = visibleCount + index;

        publicGalleryGrid.innerHTML += `
            <div class="gallery-item" data-index="${realIndex}">
                <img src="${item.image_url}" alt="${item.title}" class="gallery-img" loading="lazy">
            </div>
        `;
    });

    visibleCount += nextItems.length;

    loadMoreBtn.style.display = visibleCount < filteredItems.length ? "inline-block" : "none";

    enableLightbox();
}

loadMoreBtn.addEventListener("click", showMoreImages);

function enableLightbox() {
    document.querySelectorAll(".gallery-item").forEach(item => {
        item.onclick = () => {
            currentIndex = Number(item.dataset.index);
            openModal(currentIndex);
        };
    });
}

function openModal(index) {
    const item = filteredItems[index];

    if (!item) return;

    modalImage.src = item.image_url;
    modalTitle.textContent = item.title;
    modalCategory.textContent = item.category;
    modalCounter.textContent = `${index + 1} / ${filteredItems.length}`;

    imageModal.style.display = "flex";
}

nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % filteredItems.length;
    openModal(currentIndex);
};

prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    openModal(currentIndex);
};

modalClose.onclick = () => {
    imageModal.style.display = "none";
};

imageModal.onclick = (e) => {
    if (e.target === imageModal) {
        imageModal.style.display = "none";
    }
};

document.addEventListener("keydown", (e) => {
    if (imageModal.style.display === "flex") {
        if (e.key === "ArrowRight") nextBtn.click();
        if (e.key === "ArrowLeft") prevBtn.click();
        if (e.key === "Escape") imageModal.style.display = "none";
    }
});

loadPublicGallery();