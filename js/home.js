const updatesSection = document.getElementById("campusUpdatesSection");
const updatesWrapper = document.getElementById("campusUpdatesWrapper");

let allUpdates = [];
let selectedIndex = 0;

function shortText(text, limit){
    if(!text) return "";
    return text.length > limit ? text.substring(0, limit).trim() + "..." : text;
}

function renderFeatured(item){
    const featuredBox = document.getElementById("featuredUpdateBox");

    featuredBox.innerHTML = `
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}">` : `
            <div class="featured-placeholder">
                <i class="bi bi-image"></i>
            </div>
        `}

        <div class="featured-overlay"></div>

        <div class="featured-update-content">
            <span>${item.category}</span>
            <h3>${shortText(item.title, 55)}</h3>
            <p>${shortText(item.description, 180)}</p>
        </div>
    `;
}

function renderList(){
    const listBox = document.getElementById("updatesListBox");

    const listHtml = allUpdates
        .filter((item, index) => index !== selectedIndex)
        .map((item) => {
            const originalIndex = allUpdates.indexOf(item);

            return `
                <button class="mini-update" onclick="selectUpdate(${originalIndex})">
                    ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}">` : `
                        <div class="mini-placeholder">
                            <i class="bi bi-image"></i>
                        </div>
                    `}

                    <div>
                        <span>${item.category}</span>
                        <h4>${shortText(item.title, 42)}</h4>
                    </div>
                </button>
            `;
        }).join("");

    listBox.innerHTML = listHtml;
}

async function loadCampusUpdates(){

    const { data, error } = await supabaseClient
        .from("news_events")
        .select("*")
        .eq("status", "published")
        .order("event_date", { ascending:false })
        .limit(4);

    if(error || !data || data.length === 0){
        updatesSection.style.display = "none";
        return;
    }

    allUpdates = data;
    selectedIndex = 0;
    updatesSection.style.display = "block";

    updatesWrapper.innerHTML = `
        <div class="campus-updates-grid">
            <div class="featured-update" id="featuredUpdateBox"></div>
            <div class="updates-list" id="updatesListBox"></div>
        </div>
    `;

    renderFeatured(allUpdates[selectedIndex]);
    renderList();
}

function selectUpdate(index){
    selectedIndex = index;
    renderFeatured(allUpdates[selectedIndex]);
    renderList();
}

loadCampusUpdates();