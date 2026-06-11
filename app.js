const SIZE = 1080;
// face hole in canvas px — must match the mask circle in the svg (cx 300 cy 240 r 115 in a 600 viewbox)
const HOLE = { x: 540, y: 432, r: 207 };
const GROUND = { x: 540, y: 1010 };
// wing shoulder pivots, canvas px (local 600-box coords × 1.8)
const PIVOT_L = { x: 221, y: 569 };
const PIVOT_R = { x: 859, y: 569 };

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const stage = document.getElementById("stage");

// ---------- tochi color variants (palettes lifted from the real chickens) ----------

const VARIANTS = [
    {
        id: "peach",
        css: "#ffb35c",
        c: {
            hi: "#ffd9a0", body: "#ffb35c", shade: "#f2924a", lo: "#d9743b",
            crest: "#ffe6bc", belly: "#ffb3c8", bellyHi: "#ffd3df", wing: "#f2a04e",
            beak: "#f08a3c", beakDark: "#d2691e", feet: "#efa0c6",
            stitch: "#c9742e", patch: "#ffe0b0"
        }
    },
    {
        id: "lavender",
        css: "#c5b4f0",
        c: {
            hi: "#e6dcfc", body: "#c5b4f0", shade: "#a796dd", lo: "#8674bf",
            crest: "#f2a7c6", belly: "#e9d9fa", bellyHi: "#f5ecfd", wing: "#b4a2e6",
            beak: "#f08a3c", beakDark: "#d2691e", feet: "#f08a3c",
            stitch: "#9c6fd0", patch: "#e4d6fa"
        }
    },
    {
        id: "golden",
        css: "#ffc83d",
        c: {
            hi: "#ffe27a", body: "#ffc83d", shade: "#efa42f", lo: "#c97f1a",
            crest: "#ffe9a8", belly: "#ffb9ce", bellyHi: "#ffd5e1", wing: "#efa42f",
            beak: "#f08a3c", beakDark: "#c9601c", feet: "#f08a3c",
            stitch: "#b96e12", patch: "#ffdf86"
        }
    },
    {
        id: "matcha",
        css: "#9fe0bd",
        c: {
            hi: "#d6f5e3", body: "#9fe0bd", shade: "#74c99b", lo: "#4fa87c",
            crest: "#d6f5e3", belly: "#ffcfe0", bellyHi: "#ffe3ec", wing: "#74c99b",
            beak: "#f08a3c", beakDark: "#c9601c", feet: "#f08a3c",
            stitch: "#3f9a72", patch: "#cdf2de"
        }
    }
];

// pear-shaped tochi silhouette: round head flowing into wide hips
const BODY_PATH =
    "M300,65 C210,65 148,130 148,215 C148,280 120,330 112,415 " +
    "C108,505 195,560 300,560 C405,560 492,505 488,415 " +
    "C480,330 452,280 452,215 C452,130 390,65 300,65 Z";

function bodySVG(c) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
    <radialGradient id="bodyGrad" cx="40%" cy="22%" r="92%">
        <stop offset="0%" stop-color="${c.hi}"/>
        <stop offset="45%" stop-color="${c.body}"/>
        <stop offset="100%" stop-color="${c.shade}"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="44%" r="60%">
        <stop offset="72%" stop-color="${c.lo}" stop-opacity="0"/>
        <stop offset="100%" stop-color="${c.lo}" stop-opacity="0.32"/>
    </radialGradient>
    <linearGradient id="bellyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c.bellyHi}"/>
        <stop offset="100%" stop-color="${c.belly}"/>
    </linearGradient>
    <linearGradient id="crestGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c.crest}"/>
        <stop offset="100%" stop-color="${c.body}"/>
    </linearGradient>
    <radialGradient id="hiBlob">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
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
        <path d="${BODY_PATH}"/>
    </clipPath>
</defs>

<!-- toed feet peeking out under the body -->
<path d="M222,564 Q252,548 282,564 Q292,580 278,588 Q266,580 256,590 Q246,580 236,590 Q222,580 222,564 Z" fill="${c.feet}"/>
<path d="M318,564 Q348,548 378,564 Q378,580 364,590 Q354,580 344,590 Q334,580 322,588 Q308,580 318,564 Z" fill="${c.feet}"/>

<!-- swoopy pompadour crest -->
<path d="M250,108 C190,78 182,18 234,10 C270,5 288,55 282,102 Z" fill="url(#crestGrad)"/>
<path d="M286,98 C258,30 296,-14 338,0 C376,14 354,72 322,102 Z" fill="url(#crestGrad)"/>
<path d="M322,102 C342,42 400,32 420,58 C436,80 394,110 348,116 Z" fill="url(#crestGrad)"/>

<!-- body with the face hole cut out -->
<g mask="url(#faceHole)">
    <path d="${BODY_PATH}" fill="url(#bodyGrad)"/>
    <path d="M95,450 Q145,372 195,427 Q245,374 300,427 Q355,374 405,427 Q455,372 505,450 L505,600 L95,600 Z"
        fill="url(#bellyG)" clip-path="url(#bodyClip)"/>
    <ellipse cx="195" cy="140" rx="85" ry="55" fill="url(#hiBlob)" transform="rotate(-30 195 140)"/>
    <path d="${BODY_PATH}" fill="url(#vig)"/>
</g>

<!-- fluffy cheek tufts, tucked under the patch ring -->
<g fill="${c.crest}">
    <ellipse cx="158" cy="284" rx="34" ry="17" transform="rotate(-32 158 284)"/>
    <ellipse cx="148" cy="314" rx="36" ry="18" transform="rotate(-8 148 314)"/>
    <ellipse cx="158" cy="344" rx="32" ry="16" transform="rotate(16 158 344)"/>
    <ellipse cx="442" cy="284" rx="34" ry="17" transform="rotate(32 442 284)"/>
    <ellipse cx="452" cy="314" rx="36" ry="18" transform="rotate(8 452 314)"/>
    <ellipse cx="442" cy="344" rx="32" ry="16" transform="rotate(-16 442 344)"/>
</g>

<!-- stitched patch ring around the hole, with a soft bevel shadow -->
<circle cx="300" cy="245" r="126" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="22"/>
<circle cx="300" cy="240" r="126" fill="none" stroke="${c.patch}" stroke-width="20"/>
<circle cx="300" cy="240" r="126" fill="none" stroke="${c.stitch}" stroke-width="6"
    stroke-dasharray="16 18" stroke-linecap="round"/>

<!-- 3d two-part beak, worn over the face -->
<path d="M300,328 C324,328 342,344 339,358 C336,370 318,376 300,376 C282,376 264,370 261,358 C258,344 276,328 300,328 Z"
    fill="url(#beakGrad)"/>
<ellipse cx="300" cy="374" rx="22" ry="10" fill="${c.beakDark}"/>
<ellipse cx="288" cy="344" rx="11" ry="6" fill="#ffffff" opacity="0.45" transform="rotate(-18 288 344)"/>
</svg>`;
}

function wingSVG(c, side) {
    const path =
        side === "l"
            ? "M123,316 C66,328 38,426 70,476 C85,497 119,476 132,420 C141,376 140,336 123,316 Z"
            : "M477,316 C534,328 562,426 530,476 C515,497 481,476 468,420 C459,376 460,336 477,316 Z";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
    <radialGradient id="wg" cx="40%" cy="25%" r="90%">
        <stop offset="0%" stop-color="${c.body}"/>
        <stop offset="100%" stop-color="${c.wing}"/>
    </radialGradient>
</defs>
<path d="${path}" fill="url(#wg)"/>
</svg>`;
}

// ---------- animated scenes ----------

function seeded(seed) {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return s / 2147483647;
    };
}

function hash(n) {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
}

// app-style floating bokeh dots, slowly rising
function bokeh(g, t, seed) {
    const rand = seeded(seed);
    for (let i = 0; i < 12; i++) {
        const x = rand() * SIZE;
        const base = rand() * SIZE;
        const r = 10 + rand() * 28;
        const sp = 12 + rand() * 22;
        const a = 0.1 + rand() * 0.16;
        const span = SIZE + 120;
        const y = ((((base - t * sp) % span) + span) % span) - 60;
        g.fillStyle = `rgba(255,255,255,${a})`;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
    }
}

function paintSunburst(g, t) {
    g.fillStyle = "#ff5fa2";
    g.fillRect(0, 0, SIZE, SIZE);
    g.save();
    g.translate(SIZE / 2, SIZE / 2);
    g.rotate(t * 0.12);
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
    bokeh(g, t, 5);
}

function paintSnacks(g, t) {
    g.fillStyle = "#fff4e0";
    g.fillRect(0, 0, SIZE, SIZE);
    const snacks = ["🍕", "🧋", "🍟", "🍩", "🍓", "🍦"];
    g.font = "64px serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    const fall = t * 55;
    const span = 160 * 9;
    for (let k = 0; k < 9; k++) {
        const y = ((k * 160 + fall) % span) - 160 + 70;
        for (let col = 0; col < 7; col++) {
            const h = hash(k * 31 + col * 7 + 1);
            const x = 70 + col * 160 + (k % 2) * 80 + Math.sin(t * 0.8 + h * 6) * 8;
            g.save();
            g.translate(x, y);
            g.rotate((h - 0.5) * 0.7 + Math.sin(t * 1.5 + h * 9) * 0.1);
            g.fillText(snacks[Math.floor(h * snacks.length)], 0, 0);
            g.restore();
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

function paintSky(g, t) {
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
    const span = SIZE + 360;
    cloud(g, ((700 + t * 26) % span) - 180, 200, 1.1);
    cloud(g, ((120 + t * 16) % span) - 180, 470, 0.8);
    cloud(g, ((820 + t * 36) % span) - 180, 660, 0.7);
}

function paintDisco(g, t) {
    const grad = g.createLinearGradient(0, 0, 0, SIZE);
    grad.addColorStop(0, "#2b2052");
    grad.addColorStop(1, "#15102e");
    g.fillStyle = grad;
    g.fillRect(0, 0, SIZE, SIZE);
    const colors = ["#ff5fa2", "#21c4be", "#ffd56b", "#b29bf2"];
    const rand = seeded(77);
    for (let i = 0; i < 14; i++) {
        const x = rand() * SIZE + Math.sin(t * 0.7 + i) * 40;
        const y = rand() * SIZE + Math.cos(t * 0.5 + i * 2) * 30;
        const r = (60 + rand() * 110) * (0.8 + 0.25 * Math.sin(t * 2 + i * 1.3));
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
        g.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.4 + i * 1.7));
        g.fillText("✨", rand() * SIZE, rand() * SIZE);
    }
    g.globalAlpha = 1;
}

function paintSprinkles(g, t) {
    g.fillStyle = "#fffdf8";
    g.fillRect(0, 0, SIZE, SIZE);
    const colors = ["#ff8fc0", "#7fd8d5", "#ffd56b", "#b29bf2", "#a8d98a", "#ff9d8a"];
    const rand = seeded(33);
    g.lineWidth = 14;
    g.lineCap = "round";
    const span = SIZE + 80;
    for (let i = 0; i < 46; i++) {
        const x = rand() * SIZE;
        const by = rand() * SIZE;
        const ba = rand() * Math.PI;
        const y = ((by + t * 45) % span) - 40;
        const a = ba + t * 0.7 * (i % 2 ? 1 : -1);
        g.strokeStyle = colors[i % colors.length];
        g.beginPath();
        g.moveTo(x - Math.cos(a) * 26, y - Math.sin(a) * 26);
        g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26);
        g.stroke();
    }
}

function paintSunset(g, t) {
    const grad = g.createLinearGradient(0, 0, 0, SIZE);
    grad.addColorStop(0, "#ffd56b");
    grad.addColorStop(0.55, "#ff8a5c");
    grad.addColorStop(1, "#ff6f91");
    g.fillStyle = grad;
    g.fillRect(0, 0, SIZE, SIZE);
    const r = 320 + 24 * Math.sin(t * 0.8);
    const sun = g.createRadialGradient(540, 840, 40, 540, 840, r);
    sun.addColorStop(0, "rgba(255,244,200,0.55)");
    sun.addColorStop(1, "rgba(255,244,200,0)");
    g.fillStyle = sun;
    g.fillRect(0, 0, SIZE, SIZE);
    bokeh(g, t, 21);
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
}

// ---------- pose + rendering ----------

const REST = { hop: 0, sx: 1, sy: 1, sway: 0, flap: 0.04 };

function poseAt(t) {
    const beat = t * 2.1; // hops per second
    const hn = Math.abs(Math.sin(beat * Math.PI)); // 0 on the ground, 1 mid-air
    const sy = 0.93 + 0.1 * hn;
    return {
        hop: hn * 52,
        sx: 1 + (1 - sy) * 0.9,
        sy,
        sway: 0.055 * Math.sin(beat * Math.PI),
        flap: 0.1 + 0.55 * hn
    };
}

function drawPedestal(hn) {
    // the little white stage every tochi stands on
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath();
    ctx.ellipse(GROUND.x, 1042, 330, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dde5ea";
    ctx.beginPath();
    ctx.ellipse(GROUND.x, 1022, 312, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f5f8fa";
    ctx.beginPath();
    ctx.ellipse(GROUND.x, 1012, 312, 44, 0, 0, Math.PI * 2);
    ctx.fill();
    // chick's shadow on the pedestal, shrinking while airborne
    ctx.fillStyle = `rgba(80,100,120,${0.16 - hn * 0.07})`;
    ctx.beginPath();
    ctx.ellipse(GROUND.x, 1012, 200 * (1 - hn * 0.25), 24 * (1 - hn * 0.25), 0, 0, Math.PI * 2);
    ctx.fill();
}

function render() {
    const t = performance.now() / 1000;
    const pose = state.dancing ? poseAt(t - danceStart) : REST;

    state.backdrop.paint(ctx, t);
    drawPedestal(pose.hop / 52);

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

// ---------- main loop (scenes are always animating) ----------

function loop() {
    render();
    requestAnimationFrame(loop);
}

function setDancing(on) {
    state.dancing = on;
    document.getElementById("dance").textContent = on ? "🧊 freeze" : "🕺 make it dance";
    if (on) danceStart = performance.now() / 1000;
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
}

// ---------- interactions ----------

document.getElementById("file").addEventListener("change", (e) => loadPhoto(e.target.files[0]));
document.getElementById("demo").addEventListener("click", loadDemoFace);

document.getElementById("zoom").addEventListener("input", (e) => {
    state.view.zoom = parseFloat(e.target.value);
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
});
canvas.addEventListener("pointerup", () => (drag = null));
canvas.addEventListener("pointercancel", () => (drag = null));

canvas.addEventListener("wheel", (e) => {
    if (!state.photo) return;
    e.preventDefault();
    const next = Math.min(3, Math.max(1, state.view.zoom * (e.deltaY < 0 ? 1.05 : 0.95)));
    state.view.zoom = next;
    document.getElementById("zoom").value = String(next);
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
});
buildSwatches("chicks", VARIANTS, (i) => i === state.variant, (i) => {
    state.variant = i;
    loadChicken();
});

loadChicken();
if (params.get("demo")) loadDemoFace();
if (params.get("dance")) setDancing(true);
loop();
