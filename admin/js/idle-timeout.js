// ===============================
// Auto Logout after 30 Minutes
// ===============================

const IDLE_TIMEOUT = 60 * 60 * 1000; // 30 minutes

let idleTimer;

function resetIdleTimer() {
    clearTimeout(idleTimer);

    idleTimer = setTimeout(async () => {

        alert("Your session has expired due to inactivity.");

        await supabaseClient.auth.signOut();

        window.location.href = "index.html";

    }, IDLE_TIMEOUT);
}

[
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart"
].forEach(event => {

    document.addEventListener(event, resetIdleTimer);

});

resetIdleTimer();