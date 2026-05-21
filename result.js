/* ============================================================
   MockTest Pro — result.js
   Score calculate, review render, screenshot, social links
   ============================================================ */

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
    const answers = Store.get("answers");
    const secId = Store.get("sectionId");
    const name = Store.get("userName");

    /* Guard */
    if (!answers || !name || !secId) {
        window.location.href = "index.html";
        return;
    }

    const sec = getSectionById(secId);

    /* Inject social links */
    applySocialLinks();

    /* Calculate score */
    const stats = calcStats(answers);

    /* Render all sections */
    renderHeader(name, sec);
    renderScore(stats, answers.length);
    renderReview(answers, sec);
});

/* ===== CALCULATE STATS ===== */
function calcStats(answers) {
    const correct = answers.filter(a => a.correct).length;
    const skipped = answers.filter(a => a.skipped).length;
    const wrong = answers.filter(a => !a.correct && !a.skipped).length;
    const pct = Math.round((correct / answers.length) * 100);
    return { correct, skipped, wrong, pct };
}

/* ===== RENDER HEADER ===== */
function renderHeader(name, sec) {
    document.getElementById("resName").textContent = name;
    document.getElementById("resSec").textContent =
        `${sec.title} — ${sec.topic}`;
}

/* ===== RENDER SCORE ===== */
function renderScore(stats, total) {
    /* Numbers */
    document.getElementById("scNum").textContent = `${stats.correct}/${total}`;
    document.getElementById("scPct").textContent = `${stats.pct}%`;
    document.getElementById("cntCorrect").textContent = stats.correct;
    document.getElementById("cntWrong").textContent = stats.wrong;
    document.getElementById("cntSkip").textContent = stats.skipped;

    /* Score circle — conic gradient fill */
    const deg = Math.round((stats.pct / 100) * 360);
    const circle = document.getElementById("scoreCircle");
    circle.style.background =
        `conic-gradient(var(--saffron) ${deg}deg, var(--saffron-lt) ${deg}deg)`;

    /* Performance badge */
    const badge = getBadge(stats.pct);
    const badgeEl = document.getElementById("perfBadge");
    badgeEl.textContent = badge.label;
    badgeEl.style.background =
        `linear-gradient(135deg, ${badge.color}, ${badge.color}cc)`;

    /* Animate score count up */
    animateCount("scNum", stats.correct, total);
    animateCount("scPct", stats.pct, null, "%");
}

/* Count-up animation helper */
function animateCount(elId, target, outOf, suffix = "") {
    const el = document.getElementById(elId);
    const steps = 30;
    let cur = 0;

    const tick = setInterval(() => {
        cur = Math.min(cur + Math.ceil(target / steps), target);
        el.textContent = outOf !== null
            ? `${cur}/${outOf}`
            : `${cur}${suffix}`;
        if (cur >= target) clearInterval(tick);
    }, 30);
}

/* ===== RENDER REVIEW LIST ===== */
function renderReview(answers, sec) {
    const list = document.getElementById("reviewList");
    list.innerHTML = "";

    answers.forEach((a, idx) => {
        const item = document.createElement("div");
        item.className = "review-item " + getReviewClass(a);

        /* Top row: Q number + icon */
        const top = document.createElement("div");
        top.className = "rv-top";
        top.innerHTML =
            `<span class="rv-num">Q${idx + 1}</span>
       <span class="rv-icon">${getReviewIcon(a)}</span>`;

        /* Question text */
        const qText = document.createElement("p");
        qText.className = "rv-q";
        qText.textContent = a.q;

        /* Answer rows */
        const rows = buildAnswerRows(a);

        item.appendChild(top);
        item.appendChild(qText);
        rows.forEach(r => item.appendChild(r));
        list.appendChild(item);
    });
}

/* Review item class */
function getReviewClass(a) {
    if (a.skipped) return "rv-skip";
    return a.correct ? "rv-correct" : "rv-wrong";
}

/* Review icon */
function getReviewIcon(a) {
    if (a.skipped) return "⏭";
    return a.correct ? "✅" : "❌";
}

/* Build answer detail rows */
function buildAnswerRows(a) {
    const labels = ["A", "B", "C", "D"];
    const rows = [];

    /* Correct answer row */
    const correctRow = makeRow(
        "✅ Sahi Jawab:",
        "correct",
        a.options[a.answer]?.text || "—"
    );
    rows.push(correctRow);

    /* User answer row */
    if (a.skipped) {
        rows.push(makeRow("⏭ Aapka Jawab:", "skip", "Skip kiya"));
    } else {
        const chosenText = a.options[a.chosen]?.text || "—";
        rows.push(makeRow(
            "📝 Aapka Jawab:",
            a.correct ? "correct" : "wrong",
            chosenText
        ));
    }

    return rows;
}

/* Helper: single row div */
function makeRow(label, type, value) {
    const row = document.createElement("div");
    row.className = "rv-row";

    const lbl = document.createElement("span");
    lbl.className = `rv-lbl ${type}`;
    lbl.textContent = label;

    const ans = document.createElement("span");
    ans.className = "rv-ans";
    ans.textContent = value;

    row.appendChild(lbl);
    row.appendChild(ans);
    return row;
}

/* ===== SCREENSHOT ===== */
function takeScreenshot() {
    const btn = document.querySelector(".res-actions .btn-primary");
    btn.textContent = "⏳ Please wait...";
    btn.disabled = true;

    const target = document.getElementById("resultCapture");

    /* Temporarily hide action buttons from capture */
    const actionsEl = document.querySelector(".res-actions");
    actionsEl.style.display = "none";

    html2canvas(target, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: "#fdf7ee",
        scrollY: -window.scrollY,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
        onclone: (doc) => {
            doc.querySelector(".result-scroll").style.overflow = "visible";
            doc.querySelector(".result-capture").style.padding = "0";
        },
    }).then(canvas => {
        actionsEl.style.display = "";
        btn.textContent = "📸 Screenshot Le";
        btn.disabled = false;

        /* Download */
        const link = document.createElement("a");
        link.download = `MockTest_Result_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }).catch(() => {
        actionsEl.style.display = "";
        btn.textContent = "📸 Screenshot Le";
        btn.disabled = false;
        alert("Screenshot nahi ho saka. Manually screenshot lein.");
    });
}

/* ===== GO HOME ===== */
function goHome() {
    Store.clear();
    window.location.href = "index.html";
}