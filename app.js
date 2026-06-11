import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const SIZE = 1080;

const canvas = document.getElementById("c"); // animated scene (2d)
const glCanvas = document.getElementById("g"); // 3d chick overlay
const ctx = canvas.getContext("2d");
const stage = document.getElementById("stage");

// ---------- tochi color variants (palettes lifted from the real chickens) ----------

const VARIANTS = [
    {
        id: "peach",
        css: "#ffb35c",
        c: {
            hi: "#ffd9a0", body: "#ffb35c", shade: "#f2924a",
            crest: "#ffe6bc", belly: "#ffb3c8", bellyHi: "#ffd3df", wing: "#f2a04e",
            beak: "#f08a3c", beakDark: "#d2691e", feet: "#efa0c6",
            stitch: "#c9742e", patch: "#ffe0b0"
        }
    },
    {
        id: "lavender",
        css: "#c5b4f0",
        c: {
            hi: "#e6dcfc", body: "#c5b4f0", shade: "#a796dd",
            crest: "#f2a7c6", belly: "#e9d9fa", bellyHi: "#f5ecfd", wing: "#b4a2e6",
            beak: "#f08a3c", beakDark: "#d2691e", feet: "#f08a3c",
            stitch: "#9c6fd0", patch: "#e4d6fa"
        }
    },
    {
        id: "golden",
        css: "#ffc83d",
        c: {
            hi: "#ffe27a", body: "#ffc83d", shade: "#efa42f",
            crest: "#ffe9a8", belly: "#ffb9ce", bellyHi: "#ffd5e1", wing: "#efa42f",
            beak: "#f08a3c", beakDark: "#c9601c", feet: "#f08a3c",
            stitch: "#b96e12", patch: "#ffdf86"
        }
    },
    {
        id: "matcha",
        css: "#9fe0bd",
        c: {
            hi: "#d6f5e3", body: "#9fe0bd", shade: "#74c99b",
            crest: "#d6f5e3", belly: "#ffcfe0", bellyHi: "#ffe3ec", wing: "#74c99b",
            beak: "#f08a3c", beakDark: "#c9601c", feet: "#f08a3c",
            stitch: "#3f9a72", patch: "#cdf2de"
        }
    }
];

// ---------- animated scenes (2d background layer) ----------

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
    dancing: false
};

let danceStart = 0;
let tiltTarget = 0;
let tilt = 0;

// ---------- three.js scene ----------

const renderer = new THREE.WebGLRenderer({
    canvas: glCanvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true
});
renderer.setSize(SIZE, SIZE, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
camera.position.set(0, 1.6, 7.0);
camera.lookAt(0, 1.12, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const hemi = new THREE.HemisphereLight(0xffffff, 0xffd9c0, 0.5);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(2.5, 5, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.bias = -0.002;
key.shadow.radius = 6;
scene.add(key);
const fill = new THREE.DirectionalLight(0xbfe5ff, 0.4);
fill.position.set(-3, 2, 2);
scene.add(fill);

// pedestal — the little white stage every tochi stands on
const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.32, 1.42, 0.14, 64),
    new THREE.MeshStandardMaterial({ color: 0xf5f8fa, roughness: 0.85 })
);
pedestal.position.y = -0.07;
pedestal.receiveShadow = true;
scene.add(pedestal);

// chick root — origin at foot level so hops/squash anchor on the ground
const root = new THREE.Group();
scene.add(root);

// face texture: stitched patch ring + the photo, redrawn on demand
const FACE_PX = 512;
const PHOTO_R = 219; // photo radius inside the 256-radius face disc
const faceCanvas = document.createElement("canvas");
faceCanvas.width = faceCanvas.height = FACE_PX;
const faceCtx = faceCanvas.getContext("2d");
const faceTexture = new THREE.CanvasTexture(faceCanvas);
faceTexture.colorSpace = THREE.SRGBColorSpace;

function drawFace() {
    const g = faceCtx;
    const c = state.variant.c;
    const half = FACE_PX / 2;
    // patch ring
    g.fillStyle = c.patch;
    g.beginPath();
    g.arc(half, half, half, 0, Math.PI * 2);
    g.fill();
    // stitches
    g.strokeStyle = c.stitch;
    g.lineWidth = 11;
    g.lineCap = "round";
    g.setLineDash([26, 22]);
    g.beginPath();
    g.arc(half, half, (PHOTO_R + half) / 2, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
    // photo window
    g.save();
    g.beginPath();
    g.arc(half, half, PHOTO_R, 0, Math.PI * 2);
    g.clip();
    if (state.photo) {
        const p = state.photo;
        const base = (PHOTO_R * 2) / Math.min(p.width, p.height);
        const s = base * state.view.zoom;
        const w = p.width * s;
        const h = p.height * s;
        const k = PHOTO_R / 207; // ui drag offsets are in 1080-canvas px
        g.drawImage(p, half - w / 2 + state.view.x * k, half - h / 2 + state.view.y * k, w, h);
    } else {
        g.fillStyle = "#fff2d4";
        g.fillRect(0, 0, FACE_PX, FACE_PX);
        g.fillStyle = "#c79c4e";
        g.font = "800 52px Nunito, system-ui, sans-serif";
        g.textAlign = "center";
        g.fillText("your face", half, half - 26);
        g.fillText("goes here", half, half + 38);
    }
    g.restore();
    faceTexture.needsUpdate = true;
}

// chick body — pear profile lathe with a baked scalloped-belly texture
function bodyTexture(c) {
    const tc = document.createElement("canvas");
    tc.width = tc.height = 512;
    const g = tc.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, c.hi);
    grad.addColorStop(0.45, c.body);
    grad.addColorStop(1, c.shade);
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    // scalloped belly band (low v = bottom of the mesh = bottom of texture)
    const top = 285;
    const bg = g.createLinearGradient(0, top, 0, 512);
    bg.addColorStop(0, c.bellyHi);
    bg.addColorStop(1, c.belly);
    g.fillStyle = bg;
    g.beginPath();
    g.moveTo(0, 512);
    for (let x = 0; x <= 512; x += 4) {
        g.lineTo(x, top + 16 * Math.sin((x / 512) * Math.PI * 2 * 6));
    }
    g.lineTo(512, 512);
    g.closePath();
    g.fill();
    const tex = new THREE.CanvasTexture(tc);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

const PROFILE = [
    [0.0, 0.0], [0.5, 0.04], [0.78, 0.3], [0.88, 0.75], [0.84, 1.05],
    [0.72, 1.35], [0.64, 1.6], [0.6, 1.85], [0.5, 2.1], [0.32, 2.28], [0.0, 2.36]
].map(([x, y]) => new THREE.Vector2(x, y));

let chickMats = [];
const chickParts = new THREE.Group();
root.add(chickParts);
let wingLGroup, wingRGroup;

function buildChick() {
    chickParts.clear();
    chickMats.forEach((m) => m.dispose());
    chickMats = [];
    const c = state.variant.c;

    const mat = (color, opts = {}) => {
        const m = new THREE.MeshStandardMaterial({ color, roughness: 0.92, ...opts });
        chickMats.push(m);
        return m;
    };

    const bodyMat = mat(0xffffff, { map: bodyTexture(c) });
    const body = new THREE.Mesh(new THREE.LatheGeometry(PROFILE, 64), bodyMat);
    body.castShadow = true;
    chickParts.add(body);

    const blob = (material, x, y, z, sx, sy, sz, rz = 0, rx = 0) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
        m.position.set(x, y, z);
        m.scale.set(sx, sy, sz);
        m.rotation.z = rz;
        m.rotation.x = rx;
        m.castShadow = true;
        return m;
    };

    const crestMat = mat(c.crest);
    // swoopy pompadour, leaning right like the real renders
    chickParts.add(blob(crestMat, -0.16, 2.42, 0, 0.16, 0.34, 0.12, -0.5));
    chickParts.add(blob(crestMat, 0.04, 2.52, 0, 0.18, 0.42, 0.13, -0.1));
    chickParts.add(blob(crestMat, 0.26, 2.42, 0, 0.17, 0.34, 0.12, 0.55));

    // cheek fluff beside the face
    chickParts.add(blob(crestMat, -0.64, 1.58, 0.36, 0.17, 0.3, 0.12, -0.45));
    chickParts.add(blob(crestMat, 0.64, 1.58, 0.36, 0.17, 0.3, 0.12, 0.45));

    // wings on pivot groups so they can flap
    const wingMat = mat(c.wing);
    wingLGroup = new THREE.Group();
    wingLGroup.position.set(-0.78, 1.3, 0);
    wingLGroup.add(blob(wingMat, -0.1, -0.42, 0, 0.2, 0.5, 0.13, -0.25));
    chickParts.add(wingLGroup);
    wingRGroup = new THREE.Group();
    wingRGroup.position.set(0.78, 1.3, 0);
    wingRGroup.add(blob(wingMat, 0.1, -0.42, 0, 0.2, 0.5, 0.13, 0.25));
    chickParts.add(wingRGroup);

    // feet
    const feetMat = mat(c.feet);
    chickParts.add(blob(feetMat, -0.3, 0.04, 0.3, 0.17, 0.07, 0.24));
    chickParts.add(blob(feetMat, 0.3, 0.04, 0.3, 0.17, 0.07, 0.24));

    // face disc with the stitched photo, slightly proud of the head
    const faceMat = new THREE.MeshBasicMaterial({ map: faceTexture });
    chickMats.push(faceMat);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.58, 64), faceMat);
    face.position.set(0, 1.68, 0.68);
    face.rotation.x = -0.06;
    chickParts.add(face);

    // 3d two-part beak below the face window
    const beakMat = mat(c.beak, { roughness: 0.7 });
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.26, 32), beakMat);
    beak.rotation.x = Math.PI / 2 - 0.12;
    beak.scale.y = 0.9;
    beak.scale.x = 1.25;
    beak.position.set(0, 1.1, 0.92);
    beak.castShadow = true;
    chickParts.add(beak);
    const lipMat = mat(c.beakDark, { roughness: 0.7 });
    chickParts.add(blob(lipMat, 0, 1.0, 0.88, 0.13, 0.05, 0.1));

    drawFace();
}

// ---------- pose + render loop ----------

function poseAt(t) {
    const beat = t * 2.1;
    const hn = Math.abs(Math.sin(beat * Math.PI)); // 0 on the ground, 1 mid-air
    const sy = 0.93 + 0.1 * hn;
    return {
        hop: hn * 0.16,
        sx: 1 + (1 - sy) * 0.9,
        sy,
        sway: 0.07 * Math.sin(beat * Math.PI),
        flap: 0.12 + 0.85 * hn
    };
}

function render() {
    const t = performance.now() / 1000;

    state.backdrop.paint(ctx, t);

    // wordmark stamp on the background layer
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    roundRect(ctx, 36, 992, 196, 56, 28);
    ctx.fill();
    ctx.fillStyle = "#3a2b1d";
    ctx.font = "800 30px Nunito, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🐣 tochi me", 58, 1030);

    // idle turntable sway + breathing, or the full dance
    if (state.dancing) {
        const p = poseAt(t - danceStart);
        root.position.y = p.hop;
        root.scale.set(p.sx, p.sy, p.sx);
        root.rotation.z = p.sway;
        root.rotation.y = 0.45 * Math.sin((t - danceStart) * 2.4);
        if (wingLGroup) wingLGroup.rotation.z = -p.flap;
        if (wingRGroup) wingRGroup.rotation.z = p.flap;
    } else {
        root.position.y = 0;
        root.rotation.z = 0;
        tilt += (tiltTarget - tilt) * 0.08; // chick gently turns to face your cursor
        root.rotation.y = 0.22 * Math.sin(t * 0.55) + tilt;
        const breathe = 1 + 0.012 * Math.sin(t * 1.8);
        root.scale.set(1, breathe, 1);
        if (wingLGroup) wingLGroup.rotation.z = -0.08 - 0.04 * Math.sin(t * 1.8);
        if (wingRGroup) wingRGroup.rotation.z = 0.08 + 0.04 * Math.sin(t * 1.8);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
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
        drawFace();
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
    drawFace();
}

// ---------- interactions ----------

document.getElementById("file").addEventListener("change", (e) => loadPhoto(e.target.files[0]));
document.getElementById("demo").addEventListener("click", loadDemoFace);

document.getElementById("zoom").addEventListener("input", (e) => {
    state.view.zoom = parseFloat(e.target.value);
    drawFace();
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
    drawFace();
});
canvas.addEventListener("pointerup", () => (drag = null));
canvas.addEventListener("pointercancel", () => (drag = null));

canvas.addEventListener("wheel", (e) => {
    if (!state.photo) return;
    e.preventDefault();
    const next = Math.min(3, Math.max(1, state.view.zoom * (e.deltaY < 0 ? 1.05 : 0.95)));
    state.view.zoom = next;
    document.getElementById("zoom").value = String(next);
    drawFace();
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

stage.addEventListener("mousemove", (e) => {
    const r = stage.getBoundingClientRect();
    tiltTarget = ((e.clientX - r.left) / r.width - 0.5) * 0.7;
});
stage.addEventListener("mouseleave", () => (tiltTarget = 0));

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
    const ex = document.createElement("canvas");
    ex.width = ex.height = SIZE;
    const g = ex.getContext("2d");
    g.drawImage(canvas, 0, 0);
    g.drawImage(glCanvas, 0, 0);
    ex.toBlob((blob) => {
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
    buildChick();
});

buildChick();
if (params.get("demo")) loadDemoFace();
if (params.get("dance")) setDancing(true);
render();
