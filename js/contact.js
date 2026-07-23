document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");

    if (!form) return;

    const sendBtn = document.getElementById("sendBtn");
    const status = document.getElementById("contactStatus");

    const EMAILJS_SERVICE_ID = "service_j1gr4ir";
    const EMAILJS_TEMPLATE_ID = "template_q2qscsj";

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        status.innerHTML = "";

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !message) {

            status.innerHTML =
                '<div class="alert alert-danger">Please fill in all required fields.</div>';

            return;
        }

        sendBtn.disabled = true;

        sendBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            Sending...
        `;

        try {

            /*
             * STEP 1:
             * Save the enquiry in Supabase.
             */
            const { error: databaseError } = await supabaseClient
                .from("contact_messages")
                .insert([
                    {
                        name,
                        email,
                        phone,
                        message
                    }
                ]);

            if (databaseError) {
                throw databaseError;
            }

            /*
             * STEP 2:
             * Send the notification email through EmailJS.
             *
             * These property names must match the variables
             * in the EmailJS template:
             *
             * {{name}}
             * {{email}}
             * {{phone}}
             * {{message}}
             */
            const templateParams = {
                name: name,
                email: email || "Not provided",
                phone: phone || "Not provided",
                message: message
            };

            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams
            );

            status.innerHTML =
                '<div class="alert alert-success">Thank you! Your message has been submitted successfully.</div>';

            form.reset();

        } catch (err) {

            console.error("Contact form error:", err);

            status.innerHTML =
                '<div class="alert alert-danger">Sorry! Something went wrong. Please try again later.</div>';

        } finally {

            sendBtn.disabled = false;
            sendBtn.textContent = "Send Message";

        }

    });

});