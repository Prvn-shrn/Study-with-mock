/* ============================================================
   MockTest Pro — quiz.js
   Timer, question render, option select, submit, skip, sound
   ============================================================ */

/* ===== STATE ===== */
let questions = [];
let currentIdx = 0;
let selectedOpt = null;
let timerInt = null;
let timeLeft = APP_CONFIG.timer.perQuestion;
let answers = [];   // { qId, chosen, correct, skipped }
let sectionMeta = null;
let locked = false;

/* ===== SOUND (Web Audio API — no external file needed) ===== */
function playSubmitSound(correct) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);

        if (correct) {
            /* Happy ding-ding */
            [523, 659, 784].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
                osc.connect(gain);
                gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.25);
            });
        } else {
            /* Wrong buzz */
            const osc = ctx.createOscillator();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(180, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.gain.setValueAtTime(0.22, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.38);
        }
    } catch (e) { /* silence on unsupported browsers */ }
}

function playSkipSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
        osc.connect(gain); gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
    } catch (e) { }
}

/* ===== TIMER ===== */
function startTimer() {
    clearInterval(timerInt);
    timeLeft = APP_CONFIG.timer.perQuestion;
    renderTimer();

    timerInt = setInterval(() => {
        timeLeft--;
        renderTimer();
        if (timeLeft <= 0) {
            clearInterval(timerInt);
            autoSkip();
        }
    }, 1000);
}

function renderTimer() {
    const box = document.getElementById("timerBox");
    const val = document.getElementById("timerVal");
    val.textContent = timeLeft;
    if (timeLeft <= APP_CONFIG.timer.warnAt) {
        box.classList.add("warn");
        if (navigator.vibrate && timeLeft <= 5) navigator.vibrate(50);
    } else {
        box.classList.remove("warn");
    }
}

function autoSkip() {
    if (locked) return;
    locked = true;
    recordAnswer(null, true);
    showFeedbackThenNext();
}

/* ===== RENDER QUESTION ===== */
function renderQuestion() {
    locked = false;
    selectedOpt = null;

    const q = questions[currentIdx];
    const sec = sectionMeta;

    /* Top bar */
    document.getElementById("secTag").textContent = sec.title;
    document.getElementById("qNum").textContent = `Q ${currentIdx + 1} / ${questions.length}`;
    document.getElementById("progFill").style.width = `${(currentIdx / questions.length) * 100}%`;

    /* Question card */
    document.getElementById("qBadge").textContent = `Q${q.id}`;
    document.getElementById("qChapter").textContent = sec.topic;
    document.getElementById("qText").textContent = q.q;

    /* Question image */
    const imgWrap = document.getElementById("qImgWrap");
    const imgEl = document.getElementById("qImg");
    if (q.img) {
        imgEl.src = q.img;
        imgWrap.classList.remove("hidden");
    } else {
        imgWrap.classList.add("hidden");
        imgEl.src = "";
    }

    /* Options */
    renderOptions(q);

    /* Submit btn reset */
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "✅ Submit Answer";

    /* Scroll top */
    document.getElementById("quizScroll").scrollTo({ top: 0, behavior: "smooth" });

    /* Start timer */
    startTimer();
}

function renderOptions(q) {
    const list = document.getElementById("optsList");
    list.innerHTML = "";
    const labels = ["A", "B", "C", "D"];

    q.options.forEach((opt, i) => {
        const item = document.createElement("div");
        item.className = "opt-item";
        item.dataset.idx = i;
        item.style.animationDelay = `${i * 0.07}s`;

        /* Badge */
        const badge = document.createElement("span");
        badge.className = "opt-badge";
        badge.textContent = labels[i];

        /* Text */
        const txt = document.createElement("span");
        txt.className = "opt-text";
        txt.textContent = opt.text;

        item.appendChild(badge);
        item.appendChild(txt);

        /* Option image (if any) */
        if (opt.img) {
            const img = document.createElement("img");
            img.src = opt.img;
            img.className = "opt-img";
            img.alt = `Option ${labels[i]}`;
            item.appendChild(img);
        }

        /* Click handler */
        item.addEventListener("click", () => selectOption(item, i));
        list.appendChild(item);
    });
}

/* ===== OPTION SELECT ===== */
function selectOption(item, idx) {
    if (locked) return;

    /* Remove previous selection */
    document.querySelectorAll(".opt-item").forEach(o => o.classList.remove("selected"));

    /* Mark selected */
    item.classList.add("selected");
    selectedOpt = idx;

    /* Enable submit */
    const btn = document.getElementById("submitBtn");
    btn.disabled = false;
    if (navigator.vibrate) navigator.vibrate(20);
}

/* ===== SUBMIT ANSWER ===== */
function submitAnswer() {
    if (locked || selectedOpt === null) return;
    clearInterval(timerInt);
    locked = true;

    const q = questions[currentIdx];
    const correct = selectedOpt === q.answer;

    recordAnswer(selectedOpt, false);
    playSubmitSound(correct);
    highlightAnswer(q.answer, selectedOpt, correct);

    /* Short delay then next */
    setTimeout(goNext, 1200);
}

function highlightAnswer(correctIdx, chosenIdx, wasCorrect) {
    document.querySelectorAll(".opt-item").forEach((item, i) => {
        item.classList.add("disabled");
        if (i === correctIdx) item.classList.add("correct");
        if (!wasCorrect && i === chosenIdx) item.classList.add("wrong");
    });
}

/* ===== SKIP QUESTION ===== */
function skipQuestion() {
    if (locked) return;
    clearInterval(timerInt);
    locked = true;
    playSkipSound();
    recordAnswer(null, true);
    showFeedbackThenNext();
}

function showFeedbackThenNext() {
    /* For auto-skip / skip just go next with slight delay */
    setTimeout(goNext, 600);
}

/* ===== RECORD ANSWER ===== */
function recordAnswer(chosen, skipped) {
    const q = questions[currentIdx];
    answers.push({
        qId: q.id,
        q: q.q,
        options: q.options,
        answer: q.answer,
        chosen: chosen,
        skipped: skipped,
        correct: !skipped && chosen === q.answer,
    });
}

/* ===== GO NEXT / FINISH ===== */
function goNext() {
    currentIdx++;

    if (currentIdx >= questions.length) {
        finishTest();
        return;
    }
    renderQuestion();
}

/* ===== FINISH TEST ===== */
function finishTest() {
    clearInterval(timerInt);
    Store.set("answers", answers);
    Store.set("sectionId", sectionMeta.id);

    /* Update progress fill to 100% */
    document.getElementById("progFill").style.width = "100%";
    document.getElementById("qNum").textContent = "Done!";

    window.location.href = "result.html";
}

/* ===== INIT on page load ===== */
document.addEventListener("DOMContentLoaded", () => {
    const secId = Store.get("sectionId");
    const name = Store.get("userName");

    /* Guard: agar direct open kiya quiz.html bina home ke */
    if (!secId || !name) {
        window.location.href = "index.html";
        return;
    }

    sectionMeta = getSectionById(secId);

    /* Load correct section data */
    const dataMap = {
        1: typeof sec1MockData !== "undefined" ? sec1MockData : [],
        2: typeof sec2MockData !== "undefined" ? sec2MockData : [],
        3: typeof sec3MockData !== "undefined" ? sec3MockData : [],
    };

    questions = dataMap[secId] || [];

    if (!questions.length) {
        alert("Question data nahi mila! data" + secId + ".js check karein.");
        window.location.href = "index.html";
        return;
    }

    renderQuestion();
});