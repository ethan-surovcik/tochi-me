const SIZE = 1080;
// face hole in canvas px — must match the mask circle in the svg (cx 300 cy 240 r 115 in a 600 viewbox)
const HOLE = { x: 540, y: 432, r: 207 };

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const stage = document.getElementById("stage");

// ---------- chick color variants ----------

const VARIANTS = [
    {
        id: "classic",
        css: "#ffc83d",
        c: {
            body: "#ffc83d", shade: "#efa42f", belly: "#ffaf97", crest: "#ffda5c",
            wing: "#efa42f", beak: "#e87b2e", beakDark: "#c9601c", feet: "#dd7e2c",
            blush: "#ff8e7a", stitch: "#b96e12", patch: "#ffda5c"
        }
    },
    {
        id: "strawberry",
        css: "#ff9ec2",
        c: {
            body: "#ff9ec2", shade: "#f27baa", belly: "#ffd9e6", crest: "#ffbcd6",
            wing: "#f27baa", beak: "#e87b2e", beakDark: "#c9601c", feet: "#dd7e2c",
            blush: "#ff6e9c", stitch: "#c2497e", patch: "#ffc7db"
        }
    },
    {
        id: "mint",
        css: "#8fe3c0",
        c: {
            body: "#8fe3c0", shade: "#65cca3", belly: "#d9f8ea", crest: "#aeefd3",
            wing: "#65cca3", beak: "#e87b2e", beakDark: "#c9601c", feet: "#dd7e2c",
            blush: "#ff9d8a", stitch: "#2e9d72", patch: "#c3f2dd"
        }
    },
    {
        id: "blueberry",
        css: "#9cc9ff",
        c: {
            body: "#9cc9ff", shade: "#6fa9f2", belly: "#d9e9ff", crest: "#bcdaff",
            wing: "#6fa9f2", beak: "#e87b2e", beakDark: "#c9601c", feet: "#dd7e2c",
            blush: "#ff9d8a", stitch: "#3d74c9", patch: "#cae3ff"
        }
    }
];

function chickenSVG(c) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
    <radialGradient id="bodyGrad" cx="45%" cy="32%" r="80%">
        <stop offset="0%" stop-color="${c.body}"/>
        <stop offset="78%" stop-color="${c.body}"/>
        <stop offset="100%" stop-color="${c.shade}"/>
    </radialGradient>
    <linearGradient id="beakGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c.beak}"/>
        <stop offset="100%" stop-color="${c.beakDark}"/>
    </linearGradient>
    <mask id="faceHole">
        <rect width="600" height="600" fill="white"/>
        <circle cx="300" cy="240" r="115" fill="black"/>
    </mask>
    <clipPath id="bodyClip">
        <ellipse cx="300" cy="325" rx="205" ry="225"/>
    </clipPath>
</defs>

<!-- feet -->
<ellipse cx="258" cy="560" rx="32" ry="17" fill="${c.feet}" transform="rotate(-8 258 560)"/>
<ellipse cx="342" cy="560" rx="32" ry="17" fill="${c.feet}" transform="rotate(8 342 560)"/>

<!-- wings, tucked behind the body -->
<ellipse cx="90" cy="378" rx="38" ry="74" fill="${c.wing}" transform="rotate(30 90 378)"/>
<ellipse cx="510" cy="378" rx="38" ry="74" fill="${c.wing}" transform="rotate(-30 510 378)"/>

<!-- crest tufts -->
<path d="M300,118 C282,72 288,26 304,18 C320,32 318,82 310,118 Z" fill="${c.crest}"/>
<path d="M264,128 C242,98 240,60 254,50 C270,60 274,100 278,126 Z" fill="${c.crest}"/>
<path d="M336,128 C358,98 360,60 346,50 C330,60 326,100 322,126 Z" fill="${c.crest}"/>

<!-- body with the face hole cut out -->
<g mask="url(#faceHole)">
    <ellipse cx="300" cy="325" rx="205" ry="225" fill="url(#bodyGrad)"/>
    <ellipse cx="300" cy="442" rx="150" ry="112" fill="${c.belly}" clip-path="url(#bodyClip)"/>
</g>

<!-- stitched patch ring around the hole -->
<circle cx="300" cy="240" r="126" fill="none" stroke="${c.patch}" stroke-width="20"/>
<circle cx="300" cy="240" r="126" fill="none" stroke="${c.stitch}" stroke-width="6"
    stroke-dasharray="16 18" stroke-linecap="round"/>

<!-- blush -->
<ellipse cx="172" cy="356" rx="34" ry="22" fill="${c.blush}" opacity="0.55"/>
<ellipse cx="428" cy="356" rx="34" ry="22" fill="${c.blush}" opacity="0.55"/>

<!-- beak, worn over the face like a tiny costume -->
<path d="M300,334 L332,356 L300,384 L268,356 Z" fill="url(#beakGrad)"
    stroke="${c.beakDark}" stroke-width="10" stroke-linejoin="round" paint-order="stroke"/>
<path d="M300,334 L332,356 L300,384 L268,356 Z" fill="url(#beakGrad)"/>
</svg>`;
}

// ---------- backdrops ----------

function seeded(seed) {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return s / 2147483647;
    };
}

function gradientWithDots(top, bottom, dot, seed) {
    return (g) => {
        const grad = g.createLinearGradient(0, 0, 0, SIZE);
        grad.addColorStop(0, top);
        grad.addColorStop(1, bottom);
        g.fillStyle = grad;
        g.fillRect(0, 0, SIZE, SIZE);
        if (!dot) return;
        const rand = seeded(seed);
        g.fillStyle = dot;
        for (let i = 0; i < 26; i++) {
            g.beginPath();
            g.arc(rand() * SIZE, rand() * SIZE, 8 + rand() * 30, 0, Math.PI * 2);
            g.fill();
        }
    };
}

const BACKDROPS = [
    { id: "party", css: "linear-gradient(160deg,#ff8fc0,#ff5fa2)", paint: gradientWithDots("#ff8fc0", "#ff5fa2", "rgba(255,255,255,0.28)", 7) },
    { id: "snackpass", css: "linear-gradient(160deg,#7fe3e0,#21c4be)", paint: gradientWithDots("#7fe3e0", "#21c4be", "rgba(255,255,255,0.25)", 11) },
    { id: "sunset", css: "linear-gradient(160deg,#ffd56b,#ff8a5c)", paint: gradientWithDots("#ffd56b", "#ff8a5c", "rgba(255,255,255,0.22)", 23) },
    { id: "lavender", css: "linear-gradient(160deg,#d9c8ff,#b29bf2)", paint: gradientWithDots("#d9c8ff", "#b29bf2", "rgba(255,255,255,0.3)", 31) },
    { id: "matcha", css: "linear-gradient(160deg,#d7efc4,#a8d98a)", paint: gradientWithDots("#d7efc4", "#a8d98a", "rgba(255,255,255,0.3)", 43) },
    { id: "paper", css: "#fdf6ec", paint: gradientWithDots("#fdf6ec", "#f6e9d6", "rgba(58,43,29,0.05)", 53) }
];

// ---------- state ----------

const state = {
    photo: null,
    view: { x: 0, y: 0, zoom: 1.15 },
    backdrop: BACKDROPS[0],
    variant: VARIANTS[0],
    chickenImg: null
};

// ---------- rendering ----------

function loadChicken() {
    const blob = new Blob([chickenSVG(state.variant.c)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
        URL.revokeObjectURL(url);
        state.chickenImg = img;
        render();
    };
    img.src = url;
}

function render() {
    state.backdrop.paint(ctx);

    // ground shadow
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.beginPath();
    ctx.ellipse(SIZE / 2, 1022, 280, 34, 0, 0, Math.PI * 2);
    ctx.fill();

    // photo (or placeholder) inside the face hole
    ctx.save();
    ctx.beginPath();
    ctx.arc(HOLE.x, HOLE.y, HOLE.r, 0, Math.PI * 2);
    ctx.clip();
    if (state.photo) {
        const p = state.photo;
        const base = (HOLE.r * 2) / Math.min(p.width, p.height);
        const s = base * state.view.zoom;
        const w = p.width * s;
        const h = p.height * s;
        ctx.drawImage(p, HOLE.x - w / 2 + state.view.x, HOLE.y - h / 2 + state.view.y, w, h);
    } else {
        ctx.fillStyle = "#fff2d4";
        ctx.fillRect(HOLE.x - HOLE.r, HOLE.y - HOLE.r, HOLE.r * 2, HOLE.r * 2);
        ctx.fillStyle = "#c79c4e";
        ctx.font = "800 44px Nunito, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("your face", HOLE.x, HOLE.y - 40);
        ctx.fillText("goes here", HOLE.x, HOLE.y + 14);
    }
    ctx.restore();

    if (state.chickenImg) {
        ctx.drawImage(state.chickenImg, 0, 0, SIZE, SIZE);
    }

    // little wordmark stamp
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    roundRect(ctx, 36, 992, 196, 56, 28);
    ctx.fill();
    ctx.fillStyle = "#3a2b1d";
    ctx.font = "800 30px Nunito, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🐣 tochi me", 58, 1030);
}

function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
}

// ---------- photo loading ----------

function loadPhoto(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        URL.revokeObjectURL(url);
        state.photo = img;
        state.view = { x: 0, y: 0, zoom: 1.15 };
        document.getElementById("zoom").value = "1.15";
        render();
    };
    img.src = url;
}

function loadDemoFace() {
    const d = document.createElement("canvas");
    d.width = d.height = 500;
    const g = d.getContext("2d");
    g.fillStyle = "#ffd9a8";
    g.fillRect(0, 0, 500, 500);
    g.fillStyle = "#ffc183";
    g.beginPath();
    g.arc(250, 260, 190, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#3a2b1d";
    g.beginPath();
    g.arc(180, 230, 22, 0, Math.PI * 2);
    g.arc(320, 230, 22, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#3a2b1d";
    g.lineWidth = 14;
    g.lineCap = "round";
    g.beginPath();
    g.arc(250, 290, 80, 0.25 * Math.PI, 0.75 * Math.PI);
    g.stroke();
    g.fillStyle = "rgba(255,110,130,0.5)";
    g.beginPath();
    g.ellipse(150, 300, 34, 22, 0, 0, Math.PI * 2);
    g.ellipse(350, 300, 34, 22, 0, 0, Math.PI * 2);
    g.fill();
    state.photo = d;
    state.view = { x: 0, y: 0, zoom: 1.15 };
    document.getElementById("zoom").value = "1.15";
    render();
}

// ---------- interactions ----------

document.getElementById("file").addEventListener("change", (e) => loadPhoto(e.target.files[0]));
document.getElementById("demo").addEventListener("click", loadDemoFace);

document.getElementById("zoom").addEventListener("input", (e) => {
    state.view.zoom = parseFloat(e.target.value);
    render();
});

let drag = null;
canvas.addEventListener("pointerdown", (e) => {
    if (!state.photo) return;
    canvas.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const factor = SIZE / canvas.getBoundingClientRect().width;
    state.view.x += (e.clientX - drag.x) * factor;
    state.view.y += (e.clientY - drag.y) * factor;
    drag = { x: e.clientX, y: e.clientY };
    render();
});
canvas.addEventListener("pointerup", () => (drag = null));
canvas.addEventListener("pointercancel", () => (drag = null));

canvas.addEventListener("wheel", (e) => {
    if (!state.photo) return;
    e.preventDefault();
    const next = Math.min(3, Math.max(1, state.view.zoom * (e.deltaY < 0 ? 1.05 : 0.95)));
    state.view.zoom = next;
    document.getElementById("zoom").value = String(next);
    render();
}, { passive: false });

["dragenter", "dragover"].forEach((ev) =>
    stage.addEventListener(ev, (e) => {
        e.preventDefault();
        stage.classList.add("dragging");
    })
);
["dragleave", "drop"].forEach((ev) =>
    stage.addEventListener(ev, (e) => {
        e.preventDefault();
        stage.classList.remove("dragging");
    })
);
stage.addEventListener("drop", (e) => loadPhoto(e.dataTransfer.files[0]));

window.addEventListener("paste", (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (item) loadPhoto(item.getAsFile());
});

// ---------- swatch pickers ----------

function buildSwatches(containerId, items, isSelected, onPick) {
    const box = document.getElementById(containerId);
    items.forEach((item) => {
        const b = document.createElement("button");
        b.className = "swatch" + (isSelected(item) ? " selected" : "");
        b.style.background = item.css;
        b.title = item.id;
        b.setAttribute("aria-label", item.id);
        b.addEventListener("click", () => {
            box.querySelectorAll(".swatch").forEach((s) => s.classList.remove("selected"));
            b.classList.add("selected");
            onPick(item);
        });
        box.appendChild(b);
    });
}

buildSwatches("bgs", BACKDROPS, (i) => i === state.backdrop, (i) => {
    state.backdrop = i;
    render();
});
buildSwatches("chicks", VARIANTS, (i) => i === state.variant, (i) => {
    state.variant = i;
    loadChicken();
});

// ---------- download + confetti ----------

document.getElementById("download").addEventListener("click", () => {
    canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "tochi-me.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
    confetti();
});

function confetti() {
    const emoji = ["🐣", "🧵", "✨", "🪡", "🎈"];
    for (let i = 0; i < 24; i++) {
        const s = document.createElement("span");
        s.className = "confetti";
        s.textContent = emoji[i % emoji.length];
        s.style.left = Math.random() * 100 + "vw";
        s.style.animationDuration = 1 + Math.random() * 1.2 + "s";
        s.style.animationDelay = Math.random() * 0.3 + "s";
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 3000);
    }
}

// ---------- boot ----------

loadChicken();
render();
if (new URLSearchParams(location.search).get("demo")) loadDemoFace();
