/* ============================================================
   MockTest Pro — home.js
   Home page logic: naam input, section select, quiz redirect
   ============================================================ */

let selectedSection = null;

/* ===== Section tile select karo ===== */
function selectSec(btn) {
    /* Pehle sab tiles se selected class hatao */
    document.querySelectorAll(".sec-tile").forEach(t => t.classList.remove("selected"));

    /* Clicked tile ko selected mark karo */
    btn.classList.add("selected");
    selectedSection = Number(btn.dataset.sec);

    /* Error hide karo agar pehle dikha tha */
    document.getElementById("secErr").classList.add("hidden");

    /* Haptic feel — short vibration (mobile) */
    if (navigator.vibrate) navigator.vibrate(30);
}

/* ===== Name input validation ===== */
function validateName() {
    const val = document.getElementById("userName").value.trim();
    const err = document.getElementById("nameErr");

    if (!val) {
        err.classList.remove("hidden");
        document.getElementById("userName").focus();
        return null;
    }
    err.classList.add("hidden");
    return val;
}

/* ===== Section validation ===== */
function validateSection() {
    const err = document.getElementById("secErr");
    if (!selectedSection) {
        err.classList.remove("hidden");
        /* Scroll to section card */
        document.querySelector(".card--navy").scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
    }
    err.classList.add("hidden");
    return true;
}

/* ===== Test shuru karo ===== */
function startTest() {
    const name = validateName();
    if (!name) return;
    if (!validateSection()) return;

    /* State sessionStorage mein save karo */
    Store.set("userName", name);
    Store.set("sectionId", selectedSection);
    Store.set("answers", []);     // blank slate
    Store.set("currentQ", 0);

    /* Quiz page pe jaao */
    window.location.href = "quiz.html";
}

/* ===== Enter key se bhi start ho sake ===== */
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("userName");

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") startTest();
    });

    /* Name typing ke saath error hatao */
    input.addEventListener("input", () => {
        if (input.value.trim()) {
            document.getElementById("nameErr").classList.add("hidden");
        }
    });

    /* Agar koi pehle test de chuka hai to clear karo */
    Store.clear();
});