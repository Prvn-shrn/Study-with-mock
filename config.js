/* ============================================================
   MockTest Pro — config.js
   Central config file (DRY Principle)
   Yahan apne links aur settings change karein
   ============================================================ */

const APP_CONFIG = {

    /* ===== SOCIAL LINKS — apne links yahan daalo ===== */
    social: {
        instagram: "https://www.instagram.com/",   // <- apna IG link
        youtube: "https://www.youtube.com/",     // <- apna YT link
    },

    /* ===== APP INFO ===== */
    app: {
        name: "MockTest Pro",
        tagline: "Apni Taiyari Ko Parakhein 🇮🇳",
    },

    /* ===== TIMER (seconds per question) ===== */
    timer: {
        perQuestion: 60,   // 1 minute
        warnAt: 15,   // red warning jab 15s bache
    },

    /* ===== SECTIONS METADATA ===== */
    sections: [
        {
            id: 1,
            title: "Chapter 1",
            topic: "Samanya Gyan",
            emoji: "📖",
            dataKey: "sec1MockData",   // data1.js mein naam
        },
        {
            id: 2,
            title: "Chapter 2",
            topic: "Vigyan",
            emoji: "🔬",
            dataKey: "sec2MockData",   // data2.js mein naam
        },
        {
            id: 3,
            title: "Chapter 3",
            topic: "Itihas",
            emoji: "🏛️",
            dataKey: "sec3MockData",   // data3.js mein naam
        },
    ],

    /* ===== PERFORMANCE BADGES (% ke hisaab se) ===== */
    badges: [
        { minPct: 90, label: "🏆 Topper!", color: "#FFD700" },
        { minPct: 75, label: "🥇 Bahut Badiya!", color: "#FF9933" },
        { minPct: 50, label: "👍 Achha Prayas!", color: "#138808" },
        { minPct: 25, label: "📚 Aur Padhein", color: "#000080" },
        { minPct: 0, label: "💪 Himmat Rakhein", color: "#c0392b" },
    ],

};

/* ===== HELPER: Section config ID se laao ===== */
function getSectionById(id) {
    return APP_CONFIG.sections.find(s => s.id === Number(id)) || null;
}

/* ===== HELPER: Performance badge % se laao ===== */
function getBadge(pct) {
    return APP_CONFIG.badges.find(b => pct >= b.minPct) || APP_CONFIG.badges.at(-1);
}

/* ===== HELPER: Social links pages par inject karo ===== */
function applySocialLinks() {
    const ig = document.getElementById("igLink");
    const yt = document.getElementById("ytLink");
    if (ig) ig.href = APP_CONFIG.social.instagram;
    if (yt) yt.href = APP_CONFIG.social.youtube;
}

/* ===== HELPER: sessionStorage se user state lo/rakho ===== */
const Store = {
    set(key, val) { sessionStorage.setItem(key, JSON.stringify(val)); },
    get(key) { try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; } },
    clear() { sessionStorage.clear(); },
};

/* ===== Auto-inject social links on DOM ready ===== */
document.addEventListener("DOMContentLoaded", applySocialLinks);