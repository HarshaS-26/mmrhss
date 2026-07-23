async function checkUser() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        window.location.href = "index.html";
        return false;
    }

    return true;
}

document.addEventListener("DOMContentLoaded", async () => {

    const statusFilter = document.getElementById("statusFilter");

    const modalElement = document.getElementById("enquiryModal");
    const enquiryModal = new bootstrap.Modal(modalElement);

    const modalName = document.getElementById("modalName");
    const modalEmail = document.getElementById("modalEmail");
    const modalPhone = document.getElementById("modalPhone");
    const modalDate = document.getElementById("modalDate");
    const modalMessage = document.getElementById("modalMessage");

    const markReadBtn = document.getElementById("markReadBtn");
    const closeEnquiryBtn = document.getElementById("closeEnquiryBtn");
    const deleteEnquiryBtn = document.getElementById("deleteEnquiryBtn");

    let enquiries = [];
    let selectedEnquiry = null;
    let dataTable = null;
    let lastFocusedButton = null;

    const loggedIn = await checkUser();

    if (!loggedIn) return;

    await loadEnquiries();

    async function loadEnquiries() {

        const { data, error } = await supabaseClient
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Unable to load enquiries:", error);

            document.querySelector("#enquiriesTable tbody").innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger py-4">
                        Unable to load enquiries.
                    </td>
                </tr>
            `;

            return;
        }

        enquiries = data || [];

        initialiseDataTable();
    }

    function initialiseDataTable() {

        if (dataTable) {
            dataTable.destroy();
            $("#enquiriesTable tbody").empty();
            $("#exportButtons").empty();
            $("#searchBox").empty();
        }

        dataTable = $("#enquiriesTable").DataTable({

            data: enquiries,

            columns: [
                {
                    data: "name",

                    render(data, type) {
                        if (type === "display") {
                            return escapeHtml(data || "-");
                        }

                        return data || "";
                    }
                },
                {
                    data: "phone",

                    render(data, type) {
                        if (type === "display") {
                            return escapeHtml(data || "Not provided");
                        }

                        return data || "";
                    }
                },
                {
                    data: "email",

                    render(data, type) {
                        if (type === "display") {

                            if (!data) {
                                return `
                                    <span class="text-muted">
                                        Not provided
                                    </span>
                                `;
                            }

                            return `
                                <a href="mailto:${escapeHtml(data)}">
                                    ${escapeHtml(data)}
                                </a>
                            `;
                        }

                        return data || "";
                    }
                },
                {
                    data: "created_at",

                    render(data, type) {
                        if (type === "sort" || type === "type") {
                            return data;
                        }

                        return escapeHtml(formatISTDate(data));
                    }
                },
                {
                    data: "status",

                    render(data, type) {
                        if (type !== "display") {
                            return data || "";
                        }

                        const status = data || "unread";

                        return `
                            <span class="enquiry-status ${getStatusClass(status)}">
                                ${escapeHtml(capitalize(status))}
                            </span>
                        `;
                    }
                },
                {
                    data: "id",
                    orderable: false,
                    searchable: false,

                    render(data) {
                        return `
                            <button
                                type="button"
                                class="btn btn-sm btn-outline-primary btn-view-enquiry"
                                data-id="${escapeHtml(data)}">

                                <i class="bi bi-eye"></i>
                                View
                            </button>
                        `;
                    }
                }
            ],

            order: [[3, "desc"]],

            pageLength: 10,

            lengthMenu: [
                [10, 25, 50, 100],
                [10, 25, 50, 100]
            ],

            responsive: true,

            dom:
                "<'d-none'Bf>" +
                "rt" +
                "<'d-flex justify-content-between align-items-center mt-3'ip>",

            buttons: [
                {
                    extend: "excelHtml5",
                    text: '<i class="bi bi-file-earmark-excel me-1"></i> Excel',
                    className: "btn btn-success btn-sm",
                    title: "MMRHSS Enquiries",

                    filename: () => {
                        return `MMRHSS_Enquiries_${getExportDate()}`;
                    },

                    exportOptions: {
                        columns: [0, 1, 2, 3, 4],

                        format: {
                            body(data, row, column, node) {
                                return node.textContent.trim();
                            }
                        }
                    }
                },
                {
                    extend: "print",
                    text: '<i class="bi bi-printer me-1"></i> Print',
                    className: "btn btn-secondary btn-sm",
                    title: "MMRHSS Enquiries",

                    exportOptions: {
                        columns: [0, 1, 2, 3, 4]
                    }
                }
            ],

            language: {
                search: "",
                searchPlaceholder: "Search enquiries",
                emptyTable: "No enquiries found.",
                zeroRecords: "No matching enquiries found.",
                lengthMenu: "Show _MENU_ enquiries",
                info: "Showing _START_ to _END_ of _TOTAL_ enquiries",
                infoEmpty: "No enquiries available"
            },

            createdRow(row, data) {
                if (data.status === "unread") {
                    row.classList.add("table-warning");
                }
            }
        });

        dataTable
            .buttons()
            .container()
            .appendTo("#exportButtons");

        $("#enquiriesTable_filter")
            .appendTo("#searchBox");

        bindTableEvents();
        applyStatusFilter();
    }

    function bindTableEvents() {

        $("#enquiriesTable tbody")
            .off("click", ".btn-view-enquiry")
            .on("click", ".btn-view-enquiry", function () {

                lastFocusedButton = this;

                openEnquiry(this.dataset.id);
            });
    }

    function openEnquiry(id) {

        selectedEnquiry = enquiries.find(
            enquiry => String(enquiry.id) === String(id)
        );

        if (!selectedEnquiry) return;

        modalName.textContent =
            selectedEnquiry.name || "-";

        if (selectedEnquiry.email) {
            modalEmail.textContent = selectedEnquiry.email;
            modalEmail.href = `mailto:${selectedEnquiry.email}`;
        } else {
            modalEmail.textContent = "Not provided";
            modalEmail.removeAttribute("href");
        }

        if (selectedEnquiry.phone) {
            modalPhone.textContent = selectedEnquiry.phone;
            modalPhone.href = `tel:${selectedEnquiry.phone}`;
        } else {
            modalPhone.textContent = "Not provided";
            modalPhone.removeAttribute("href");
        }

        modalDate.textContent =
            formatISTDate(selectedEnquiry.created_at);

        modalMessage.textContent =
            selectedEnquiry.message || "-";

        markReadBtn.style.display =
            selectedEnquiry.status === "unread"
                ? "inline-block"
                : "none";

        closeEnquiryBtn.style.display =
            selectedEnquiry.status === "closed"
                ? "none"
                : "inline-block";

        enquiryModal.show();
    }

    async function updateStatus(status) {

        if (!selectedEnquiry) return;

        setActionButtonsDisabled(true);

        const { error } = await supabaseClient
            .from("contact_messages")
            .update({ status })
            .eq("id", selectedEnquiry.id);

        setActionButtonsDisabled(false);

        if (error) {
            console.error("Unable to update enquiry:", error);
            alert("Unable to update enquiry status.");
            return;
        }

        const enquiryIndex = enquiries.findIndex(
            enquiry => enquiry.id === selectedEnquiry.id
        );

        if (enquiryIndex !== -1) {
            enquiries[enquiryIndex].status = status;
        }

        selectedEnquiry.status = status;

        closeModalSafely();

        initialiseDataTable();
    }

    async function deleteEnquiry() {

        if (!selectedEnquiry) return;

        const confirmed = confirm(
            `Delete the enquiry from ${
                selectedEnquiry.name || "this person"
            }?`
        );

        if (!confirmed) return;

        setActionButtonsDisabled(true);

        const { error } = await supabaseClient
            .from("contact_messages")
            .delete()
            .eq("id", selectedEnquiry.id);

        setActionButtonsDisabled(false);

        if (error) {
            console.error("Unable to delete enquiry:", error);
            alert("Unable to delete the enquiry.");
            return;
        }

        enquiries = enquiries.filter(
            enquiry => enquiry.id !== selectedEnquiry.id
        );

        selectedEnquiry = null;

        closeModalSafely();

        initialiseDataTable();
    }

    function closeModalSafely() {

        if (
            document.activeElement &&
            modalElement.contains(document.activeElement)
        ) {
            document.activeElement.blur();
        }

        enquiryModal.hide();
    }

    modalElement.addEventListener("hidden.bs.modal", () => {

        if (
            lastFocusedButton &&
            document.body.contains(lastFocusedButton)
        ) {
            lastFocusedButton.focus();
        }

        lastFocusedButton = null;
    });

    function applyStatusFilter() {

        if (!dataTable) return;

        const selectedStatus = statusFilter.value;

        if (selectedStatus === "all") {
            dataTable
                .column(4)
                .search("")
                .draw();
        } else {
            dataTable
                .column(4)
                .search(`^${selectedStatus}$`, true, false)
                .draw();
        }
    }

    statusFilter.addEventListener(
        "change",
        applyStatusFilter
    );

    markReadBtn.addEventListener("click", () => {
        updateStatus("read");
    });

    closeEnquiryBtn.addEventListener("click", () => {
        updateStatus("closed");
    });

    deleteEnquiryBtn.addEventListener(
        "click",
        deleteEnquiry
    );

    function setActionButtonsDisabled(disabled) {
        markReadBtn.disabled = disabled;
        closeEnquiryBtn.disabled = disabled;
        deleteEnquiryBtn.disabled = disabled;
    }

    function formatISTDate(value) {

        if (!value) return "-";

        return new Date(value).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }

    function getExportDate() {

        return new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata"
        });
    }

    function capitalize(value) {

        if (!value) return "";

        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    }

    function getStatusClass(status) {

        switch (status) {

            case "unread":
                return "status-unread";

            case "read":
                return "status-read";

            case "closed":
                return "status-closed";

            default:
                return "";
        }
    }

    function escapeHtml(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
});