const seoData = {

    "index.html": {
        title: "MMRHSS & Sainik School | Thiruvananthapuram",
        description: "MMRHSS & Sainik School in Thiruvananthapuram offers quality education, discipline, leadership training and dedicated academic and Sainik School programmes.",
        canonical: "https://mmrhsssainikschool.com/",
        image: "https://mmrhsssainikschool.com/assets/images/mmrhssmain.jpeg"
    },

    "about.html": {
        title: "About MMRHSS & Sainik School | Thiruvananthapuram",
        description: "Learn about the history, vision, leadership and legacy of MMRHSS & Sainik School, serving students with excellence since 1971.",
        canonical: "https://mmrhsssainikschool.com/about.html",
        image: "https://mmrhsssainikschool.com/assets/images/mmrhssmain.jpeg"
    },

    "academics.html": {
        title: "Academics | MMRHSS & Sainik School",
        description: "Explore the academic curriculum, learning environment and educational programmes offered by MMRHSS & Sainik School.",
        canonical: "https://mmrhsssainikschool.com/academics.html",
        image: "https://mmrhsssainikschool.com/assets/images/mmrhssmain.jpeg"
    },

    "admissions.html": {
        title: "Admissions | MMRHSS & Sainik School",
        description: "Find admission-related information and updates from MMRHSS & Sainik School. Application details will be published when admissions are open.",
        canonical: "https://mmrhsssainikschool.com/admissions.html",
        image: "https://mmrhsssainikschool.com/assets/images/mmrhssmain.jpeg"
    },

    "gallery.html": {
        title: "Gallery | MMRHSS & Sainik School",
        description: "Browse campus life, academics, student activities, events and achievements through our gallery.",
        canonical: "https://mmrhsssainikschool.com/gallery.html",
        image: "https://mmrhsssainikschool.com/assets/images/mmrhssmain.jpeg"
    },

    "contact.html": {
        title: "Contact Us | MMRHSS & Sainik School",
        description: "Contact MMRHSS & Sainik School for admissions, enquiries and campus information.",
        canonical: "https://mmrhsssainikschool.com/contact.html",
        image: "https://mmrhsssainikschool.com/assets/images/mmrhssmain.jpeg"
    },

    "sainik-wing.html": {
        title: "Sainik School Wing | MMRHSS",
        description: "Learn about the Sainik School Wing and its focus on discipline, leadership and excellence.",
        canonical: "https://mmrhsssainikschool.com/sainik-wing.html",
        image: "https://mmrhsssainikschool.com/assets/images/mmrhssmain.jpeg"
    }

};

const page =
    location.pathname.split("/").pop() || "index.html";

const seo = seoData[page];

if (seo) {

    document.title = seo.title;

    function addMeta(name, content, property = false) {

        let tag = document.querySelector(
            property
                ? `meta[property="${name}"]`
                : `meta[name="${name}"]`
        );

        if (!tag) {
            tag = document.createElement("meta");

            if (property)
                tag.setAttribute("property", name);
            else
                tag.setAttribute("name", name);

            document.head.appendChild(tag);
        }

        tag.content = content;
    }

    addMeta("description", seo.description);

    let canonical = document.querySelector("link[rel='canonical']");

    if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
    }

    canonical.href = seo.canonical;

    addMeta("og:type", "website", true);
    addMeta("og:title", seo.title, true);
    addMeta("og:description", seo.description, true);
    addMeta("og:url", seo.canonical, true);
    addMeta("og:image", seo.image, true);
    addMeta("og:site_name", "MMRHSS & Sainik School", true);

    addMeta("twitter:card", "summary_large_image");
    addMeta("twitter:title", seo.title);
    addMeta("twitter:description", seo.description);
    addMeta("twitter:image", seo.image);
}