const SIZE = 1080;
// face hole in canvas px — must match the mask circle in the svg (cx 300 cy 240 r 115 in a 600 viewbox)
const HOLE = { x: 540, y: 432, r: 207 };
const GROUND = { x: 540, y: 1010 };
// wing shoulder pivots, canvas px (local 600-box coords × 1.8)
const PIVOT_L = { x: 216, y: 594 };
const PIVOT_R = { x: 864, y: 594 };

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const stage = document.getElementById("stage");

// ---------- chick color variants ----------

const VARIANTS = [
    {
        id: "classic",
        css: "#ffc83d",
        c: {
            hi: "#ffe27a", body: "#ffc83d", shade: "#efa42f", lo: "#c97f1a",
            belly: "#ffaf97", crest: "#ffda5c", wing: "#efa42f",
            beak: "#e87b2e", beakDark: "#c9601c", feet: "#dd7e2c",
            blush: "#ff8e7a", stitch: "#b96e12", patch: "#ffda5c"
        }
    },
    {
        id: "strawberry",
        css: "#ff9ec2",
        c: {
            hi: "#ffc9dd", body: "#ff9ec2", shade: "#f27baa", lo: "#d75a8f",
            belly: "#ffd9e6", crest: "#ffbcd6", wing: "#f27baa",
            beak: "#e87b2e", beakDark: "#c9601c", feet: "#dd7e2c",
            blush: "#ff6e9c", stitch: "#c2497e", patch: "#ffc7db"
        }
    },
    {
        id: "mint",
        css: "#8fe3c0",
        c: {
            hi: "#c2f4dd", body: "#8fe3c0", shade: "#65cca3", lo: "#3aa97f",
            belly: "#d9f8ea", crest: "#aeefd3", wing: "#65cca3",
            beak: "#e87b2e", beakDark: "#c9601c", feet: "#dd7e2c",
            blush: "#ff9d8a", stitch: "#2e9d72", patch: "#c3f2dd"
        }
    },
    {
        id: "blueberry",
        css: "#9cc9ff",
        c: {
            hi: "#c8e2ff", body: "#9cc9ff", shade: "#6fa9f2", lo: "#4f86d8",
            belly: "#d9e9ff", crest: "#bcdaff", wing: "#6fa9f2",
            beak: "#e87b2e", beakDark: "#c9601c", feet: "#dd7e2c",
            blush: "#ff9d8a", stitch: "#3d74c9", patch: "#cae3ff"
        }
    }
];

function bodySVG(c) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
    <radialGradient id="bodyGrad" cx="38%" cy="26%" r="88%">
        <stop offset="0%" stop-color="${c.hi}"/>
        <stop offset="45%" stop-color="${c.body}"/>
        <stop offset="100%" stop-color="${c.shade}"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="42%" r="62%">
        <stop offset="72%" stop-color="${c.lo}" stop-opacity="0"/>
        <stop offset="100%" stop-color="${c.lo}" stop-opacity="0.38"/>
    </radialGradient>
    <radialGradient id="bellyG" cx="50%" cy="38%" r="68%">
        <stop offset="0%" stop-color="${c.belly}"/>
        <stop offset="70%" stop-color="${c.belly}"/>
        <stop offset="100%" stop-color="${c.belly}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blushG">
        <stop offset="0%" stop-color="${c.blush}" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="${c.blush}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hiBlob">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="beakGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c.beak}"/>
        <stop offset="100%" stop-color="${c.beakDark}"/>
    </linearGradient>
    <linearGradient id="feetGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c.feet}"/>
        <stop offset="100%" stop-color="${c.beakDark}"/>
    </linearGradient>
    <linearGradient id="crestGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c.hi}"/>
        <stop offset="100%" stop-color="${c.crest}"/>
    </linearGradient>
    <mask id="faceHole">
        <rect width="600" height="600" fill="white"/>
        <circle cx="300" cy="240" r="115" fill="black"/>
    </mask>
</defs>

<!-- feet -->
<ellipse cx="258" cy="560" rx="32" ry="17" fill="url(#feetGrad)" transform="rotate(-8 258 560)"/>
<ellipse cx="342" cy="560" rx="32" ry="17" fill="url(#feetGrad)" transform="rotate(8 342 560)"/>

<!-- crest tufts -->
<path d="M300,118 C282,72 288,26 304,18 C320,32 318,82 310,118 Z" fill="url(#crestGrad)"/>
<path d="M264,128 C242,98 240,60 254,50 C270,60 274,100 278,126 Z" fill="url(#crestGrad)"/>
<path d="M336,128 C358,98 360,60 346,50 C330,60 326,100 322,126 Z" fill="url(#crestGrad)"/>

<!-- body with the face hole cut out -->
<g mask="url(#faceHole)">
    <ellipse cx="300" cy="325" rx="205" ry="225" fill="url(#bodyGrad)"/>
    <ellipse cx="300" cy="445" rx="160" ry="120" fill="url(#bellyG)"/>
    <ellipse cx="185" cy="148" rx="95" ry="62" fill="url(#hiBlob)" transform="rotate(-28 185 148)"/>
    <ellipse cx="300" cy="325" rx="205" ry="225" fill="url(#vig)"/>
</g>

<!-- stitched patch ring around the hole, with a soft bevel shadow -->
<circle cx="300" cy="245" r="126" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="22"/>
<circle cx="300" cy="240" r="126" fill="none" stroke="${c.patch}" stroke-width="20"/>
<circle cx="300" cy="240" r="126" fill="none" stroke="${c.stitch}" stroke-width="6"
    stroke-dasharray="16 18" stroke-linecap="round"/>

<!-- blush -->
<ellipse cx="172" cy="356" rx="40" ry="26" fill="url(#blushG)"/>
<ellipse cx="428" cy="356" rx="40" ry="26" fill="url(#blushG)"/>

<!-- beak, worn over the face like a tiny costume -->
<path d="M300,334 L332,356 L300,384 L268,356 Z" fill="url(#beakGrad)"
    stroke="${c.beakDark}" stroke-width="10" stroke-linejoin="round" paint-order="stroke"/>
<path d="M300,334 L332,356 L300,384 L268,356 Z" fill="url(#beakGrad)"/>
<ellipse cx="288" cy="348" rx="10" ry="6" fill="#ffffff" opacity="0.5" transform="rotate(-20 288 348)"/>
</svg>`;
}

function wingSVG(c, side) {
    const cx = side === "l" ? 90 : 510;
    const rot = side === "l" ? 30 : -30;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
    <radialGradient id="wg" cx="38%" cy="28%" r="85%">
        <stop offset="0%" stop-color="${c.body}"/>
        <stop offset="100%" stop-color="${c.wing}"/>
    </radialGradient>
</defs>
<ellipse cx="${cx}" cy="378" rx="40" ry="76" fill="url(#wg)" transform="rotate(${rot} ${cx} 378)"/>
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

function paintSunburst(g) {
    g.fillStyle = "#ff5fa2";
    g.fillRect(0, 0, SIZE, SIZE);
    g.save();
    g.translate(SIZE / 2, SIZE / 2);
    g.fillStyle = "rgba(255,255,255,0.16)";
    const rays = 18;
    for (let i = 0; i < rays; i += 2) {
        const a0 = (i / rays) * Math.PI * 2;
        const a1 = ((i + 1) / rays) * Math.PI * 2;
        g.beginPath();
        g.moveTo(0, 0);
        g.arc(0, 0, 900, a0, a1);
        g.closePath();
        g.fill();
    }
    g.restore();
}

function paintSnacks(g) {
    g.fillStyle = "#fff4e0";
    g.fillRect(0, 0, SIZE, SIZE);
    const snacks = ["🍕", "🧋", "🍟", "🍩", "🍓", "🍦"];
    const rand = seeded(99);
    g.font = "64px serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    let n = 0;
    for (let y = 70; y < SIZE; y += 160) {
        const off = (Math.floor(y / 160) % 2) * 80;
        for (let x = 70 + off; x < SIZE; x += 160) {
            g.save();
            g.translate(x, y);
            g.rotate((rand() - 0.5) * 0.7);
            g.fillText(snacks[n % snacks.length], 0, 0);
            g.restore();
            n++;
        }
    }
    g.textBaseline = "alphabetic";
}

function cloud(g, x, y, s) {
    g.beginPath();
    g.arc(x, y, 46 * s, 0, Math.PI * 2);
    g.arc(x + 50 * s, y - 18 * s, 38 * s, 0, Math.PI * 2);
    g.arc(x + 100 * s, y, 42 * s, 0, Math.PI * 2);
    g.arc(x + 50 * s, y + 16 * s, 44 * s, 0, Math.PI * 2);
    g.fill();
}

function paintSky(g) {
    const grad = g.createLinearGradient(0, 0, 0, SIZE);
    grad.addColorStop(0, "#8ecdf7");
    grad.addColorStop(1, "#eaf7ff");
    g.fillStyle = grad;
    g.fillRect(0, 0, SIZE, SIZE);
    const sun = g.createRadialGradient(170, 170, 20, 170, 170, 170);
    sun.addColorStop(0, "#ffe27a");
    sun.addColorStop(0.55, "#ffe27a");
    sun.addColorStop(1, "rgba(255,226,122,0)");
    g.fillStyle = sun;
    g.beginPath();
    g.arc(170, 170, 170, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.92)";
    cloud(g, 700, 200, 1.1);
    cloud(g, 120, 480, 0.8);
    cloud(g, 820, 640, 0.7);
}

function paintDisco(g) {
    const grad = g.createLinearGradient(0, 0, 0, SIZE);
    grad.addColorStop(0, "#2b2052");
    grad.addColorStop(1, "#15102e");
    g.fillStyle = grad;
    g.fillRect(0, 0, SIZE, SIZE);
    const colors = ["#ff5fa2", "#21c4be", "#ffd56b", "#b29bf2"];
    const rand = seeded(77);
    for (let i = 0; i < 14; i++) {
        const x = rand() * SIZE;
        const y = rand() * SIZE;
        const r = 60 + rand() * 110;
        const light = g.createRadialGradient(x, y, 0, x, y, r);
        const col = colors[i % colors.length];
        light.addColorStop(0, col + "55");
        light.addColorStop(1, col + "00");
        g.fillStyle = light;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
    }
    g.font = "44px serif";
    g.textAlign = "center";
    for (let i = 0; i < 9; i++) {
        g.fillText("✨", rand() * SIZE, rand() * SIZE);
    }
}

function paintSprinkles(g) {
    g.fillStyle = "#fffdf8";
    g.fillRect(0, 0, SIZE, SIZE);
    const colors = ["#ff8fc0", "#7fd8d5", "#ffd56b", "#b29bf2", "#a8d98a", "#ff9d8a"];
    const rand = seeded(33);
    g.lineWidth = 14;
    g.lineCap = "round";
    for (let i = 0; i < 46; i++) {
        const x = rand() * SIZE;
        const y = rand() * SIZE;
        const a = rand() * Math.PI;
        g.strokeStyle = colors[i % colors.length];
        g.beginPath();
        g.moveTo(x - Math.cos(a) * 26, y - Math.sin(a) * 26);
        g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26);
        g.stroke();
    }
}

function paintSunset(g) {
    const grad = g.createLinearGradient(0, 0, 0, SIZE);
    grad.addColorStop(0, "#ffd56b");
    grad.addColorStop(0.55, "#ff8a5c");
    grad.addColorStop(1, "#ff6f91");
    g.fillStyle = grad;
    g.fillRect(0, 0, SIZE, SIZE);
    const sun = g.createRadialGradient(540, 840, 40, 540, 840, 320);
    sun.addColorStop(0, "rgba(255,244,200,0.55)");
    sun.addColorStop(1, "rgba(255,244,200,0)");
    g.fillStyle = sun;
    g.fillRect(0, 0, SIZE, SIZE);
}

const BACKDROPS = [
    { id: "sunburst", css: "repeating-conic-gradient(#ff7fb5 0 20deg, #ff5fa2 20deg 40deg)", paint: paintSunburst },
    { id: "snacks", css: "#fff4e0", icon: "🍕", paint: paintSnacks },
    { id: "sky", css: "linear-gradient(#8ecdf7,#eaf7ff)", paint: paintSky },
    { id: "disco", css: "radial-gradient(circle at 30% 30%, #6a4fd0, #15102e)", paint: paintDisco },
    { id: "sprinkles", css: "#fffdf8", icon: "🍬", paint: paintSprinkles },
    { id: "sunset", css: "linear-gradient(#ffd56b,#ff8a5c,#ff6f91)", paint: paintSunset }
];

// ---------- state ----------

const state = {
    photo: null,
    view: { x: 0, y: 0, zoom: 1.15 },
    backdrop: BACKDROPS[0],
    variant: VARIANTS[0],
    parts: null,
    dancing: false
};

let danceStart = 0;

// ---------- chick loading ----------

function svgToImage(svg) {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.src = url;
    });
}

async function loadChicken() {
    const c = state.variant.c;
    const [body, wingL, wingR] = await Promise.all([
        svgToImage(bodySVG(c)),
        svgToImage(wingSVG(c, "l")),
        svgToImage(wingSVG(c, "r"))
    ]);
    state.parts = { body, wingL, wingR };
    render();
}

// ---------- pose + rendering ----------

const REST = { hop: 0, sx: 1, sy: 1, sway: 0, flap: 0 };

function poseAt(t) {
    const beat = t * 2.1; // hops per second
    const hn = Math.abs(Math.sin(beat * Math.PI)); // 0 on the ground, 1 mid-air
    const sy = 0.93 + 0.1 * hn;
    return {
        hop: hn * 52,
        sx: 1 + (1 - sy) * 0.9,
        sy,
        sway: 0.055 * Math.sin(beat * Math.PI),
        flap: 0.12 + 0.5 * hn
    };
}

function render() {
    const pose = state.dancing ? poseAt((performance.now() - danceStart) / 1000) : REST;

    state.backdrop.paint(ctx);

    // ground shadow shrinks while airborne
    const hn = pose.hop / 52;
    ctx.fillStyle = `rgba(0,0,0,${0.13 - hn * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(GROUND.x, 1022, 280 * (1 - hn * 0.22), 34 * (1 - hn * 0.22), 0, 0, Math.PI * 2);
    ctx.fill();

    // whole-chick dance transform, anchored at the ground point
    ctx.save();
    ctx.translate(GROUND.x, GROUND.y - pose.hop);
    ctx.rotate(pose.sway);
    ctx.scale(pose.sx, pose.sy);
    ctx.translate(-GROUND.x, -GROUND.y);

    if (state.parts) {
        // wings flap around their shoulder pivots
        ctx.save();
        ctx.translate(PIVOT_L.x, PIVOT_L.y);
        ctx.rotate(pose.flap);
        ctx.translate(-PIVOT_L.x, -PIVOT_L.y);
        ctx.drawImage(state.parts.wingL, 0, 0, SIZE, SIZE);
        ctx.restore();
        ctx.save();
        ctx.translate(PIVOT_R.x, PIVOT_R.y);
        ctx.rotate(-pose.flap);
        ctx.translate(-PIVOT_R.x, -PIVOT_R.y);
        ctx.drawImage(state.parts.wingR, 0, 0, SIZE, SIZE);
        ctx.restore();
    }

    // photo (or placeholder) inside the face hole — rides along with the dance
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

    if (state.parts) {
        ctx.drawImage(state.parts.body, 0, 0, SIZE, SIZE);
    }
    ctx.restore();

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

// ---------- dance loop ----------

function danceLoop() {
    if (!state.dancing) return;
    render();
    requestAnimationFrame(danceLoop);
}

function setDancing(on) {
    state.dancing = on;
    document.getElementById("dance").textContent = on ? "🧊 freeze" : "🕺 make it dance";
    if (on) {
        danceStart = performance.now();
        danceLoop();
    } else {
        render();
    }
}

document.getElementById("dance").addEventListener("click", () => setDancing(!state.dancing));

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
        if (item.icon) b.textContent = item.icon;
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

const params = new URLSearchParams(location.search);
state.backdrop = BACKDROPS.find((b) => b.id === params.get("bg")) || state.backdrop;
state.variant = VARIANTS.find((v) => v.id === params.get("chick")) || state.variant;

buildSwatches("bgs", BACKDROPS, (i) => i === state.backdrop, (i) => {
    state.backdrop = i;
    render();
});
buildSwatches("chicks", VARIANTS, (i) => i === state.variant, (i) => {
    state.variant = i;
    loadChicken();
});

loadChicken();
render();
if (params.get("demo")) loadDemoFace();
if (params.get("dance")) setDancing(true);
