// main.js — Rotating 3D Cube Camera Playground

import { Vec3, Mat4 } from "./math3d.js";

// 1. Inisialisasi Canvas dan WebGL2 Context
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL2 tidak tersedia.");
}

// 2. Definisi Source Shader (GLSL ES 3.00)
// Vertex Shader: mengalikan posisi vertex dengan Model, View, dan Projection Matrix
const vertexShaderSource = `#version 300 es

in vec3 a_position;
in vec3 a_color;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 v_color;

void main() {
  gl_Position =
    u_projection *
    u_view *
    u_model *
    vec4(a_position, 1.0);

  v_color = a_color;
}
`;

// Fragment Shader: mewarnai setiap piksel sesuai interpolasi warna vertex
const fragmentShaderSource = `#version 300 es

precision highp float;

in vec3 v_color;

out vec4 outColor;

void main() {
  outColor = vec4(v_color, 1.0);
}
`;

// 3. Helper Kompilasi Shader dan Linking Program
function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compile error:\n" + info);
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!success) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link error:\n" + info);
  }

  return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// 4. Deklarasi Objek: Geometri Cube (36 Vertex vec3) & Warna per Sisi
// Kubus 3D berpusat di origin dengan 6 sisi x 2 segitiga x 3 vertex = 36 vertex
const cubePositions = new Float32Array([
  // Front face (Z = +0.5)
  -0.5, -0.5,  0.5,
   0.5, -0.5,  0.5,
   0.5,  0.5,  0.5,
  -0.5, -0.5,  0.5,
   0.5,  0.5,  0.5,
  -0.5,  0.5,  0.5,

  // Back face (Z = -0.5)
   0.5, -0.5, -0.5,
  -0.5, -0.5, -0.5,
  -0.5,  0.5, -0.5,
   0.5, -0.5, -0.5,
  -0.5,  0.5, -0.5,
   0.5,  0.5, -0.5,

  // Left face (X = -0.5)
  -0.5, -0.5, -0.5,
  -0.5, -0.5,  0.5,
  -0.5,  0.5,  0.5,
  -0.5, -0.5, -0.5,
  -0.5,  0.5,  0.5,
  -0.5,  0.5, -0.5,

  // Right face (X = +0.5)
   0.5, -0.5,  0.5,
   0.5, -0.5, -0.5,
   0.5,  0.5, -0.5,
   0.5, -0.5,  0.5,
   0.5,  0.5, -0.5,
   0.5,  0.5,  0.5,

  // Top face (Y = +0.5)
  -0.5,  0.5,  0.5,
   0.5,  0.5,  0.5,
   0.5,  0.5, -0.5,
  -0.5,  0.5,  0.5,
   0.5,  0.5, -0.5,
  -0.5,  0.5, -0.5,

  // Bottom face (Y = -0.5)
  -0.5, -0.5, -0.5,
   0.5, -0.5, -0.5,
   0.5, -0.5,  0.5,
  -0.5, -0.5, -0.5,
   0.5, -0.5,  0.5,
  -0.5, -0.5,  0.5
]);

// Warna berbeda per sisi agar orientasi dan kedalaman kubus mudah diamati
const cubeColors = new Float32Array([
  // Front - cyan (R=0.0, G=0.8, B=1.0)
  0.0, 0.8, 1.0,
  0.0, 0.8, 1.0,
  0.0, 0.8, 1.0,
  0.0, 0.8, 1.0,
  0.0, 0.8, 1.0,
  0.0, 0.8, 1.0,

  // Back - blue (R=0.2, G=0.3, B=1.0)
  0.2, 0.3, 1.0,
  0.2, 0.3, 1.0,
  0.2, 0.3, 1.0,
  0.2, 0.3, 1.0,
  0.2, 0.3, 1.0,
  0.2, 0.3, 1.0,

  // Left - orange (R=1.0, G=0.5, B=0.1)
  1.0, 0.5, 0.1,
  1.0, 0.5, 0.1,
  1.0, 0.5, 0.1,
  1.0, 0.5, 0.1,
  1.0, 0.5, 0.1,
  1.0, 0.5, 0.1,

  // Right - green (R=0.2, G=1.0, B=0.4)
  0.2, 1.0, 0.4,
  0.2, 1.0, 0.4,
  0.2, 1.0, 0.4,
  0.2, 1.0, 0.4,
  0.2, 1.0, 0.4,
  0.2, 1.0, 0.4,

  // Top - magenta (R=1.0, G=0.2, B=0.8)
  1.0, 0.2, 0.8,
  1.0, 0.2, 0.8,
  1.0, 0.2, 0.8,
  1.0, 0.2, 0.8,
  1.0, 0.2, 0.8,
  1.0, 0.2, 0.8,

  // Bottom - yellow (R=1.0, G=0.9, B=0.1)
  1.0, 0.9, 0.1,
  1.0, 0.9, 0.1,
  1.0, 0.9, 0.1,
  1.0, 0.9, 0.1,
  1.0, 0.9, 0.1,
  1.0, 0.9, 0.1
]);

// 5. Pembuatan Buffer dan Setup Atribut (VAO)
// Buffer untuk data koordinat vertex
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);

// Buffer untuk data warna vertex
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

// Mendapatkan lokasi atribut & uniform dari shader program
const positionLocation = gl.getAttribLocation(program, "a_position");
const colorLocation = gl.getAttribLocation(program, "a_color");

const modelLocation = gl.getUniformLocation(program, "u_model");
const viewLocation = gl.getUniformLocation(program, "u_view");
const projectionLocation = gl.getUniformLocation(program, "u_projection");

// Setup Vertex Array Object (VAO) untuk menyimpan binding atribut
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// Menghubungkan buffer posisi ke attribute a_position (size: 3 = X, Y, Z)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

// Menghubungkan buffer warna ke attribute a_color (size: 3 = R, G, B)
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

// 6. State Objek & Pembuatan Model Matrix
function degToRad(degree) {
  return (degree * Math.PI) / 180;
}

// State sudut rotasi kubus (dalam derajat)
const cube = {
  rotationX: 20,
  rotationY: 30
};

// Fungsi menghitung Model Matrix 4x4 kubus
function createModelMatrix() {
  const rx = Mat4.rotationX(degToRad(cube.rotationX));
  const ry = Mat4.rotationY(degToRad(cube.rotationY));

  let model = Mat4.identity();
  model = Mat4.multiply(model, rx);
  model = Mat4.multiply(model, ry);

  return model;
}

// 7. State Kamera & Proyeksi
// State kamera (posisi pengamat, target pandangan, dan up vector)
const camera = {
  position: [0.0, 1.5, 4.0],
  target:   [0.0, 0.0, 0.0],
  up:       [0.0, 1.0, 0.0]
};

// State proyeksi (mode, fov vertikal, clipping plane near dan far)
const projectionState = {
  mode: "perspective",
  fov: 60,
  near: 0.1,
  far: 100.0
};

// Fungsi menghitung Projection Matrix 4x4 (Perspective / Orthographic)
function createProjectionMatrix() {
  const aspect = canvas.width / canvas.height;

  if (projectionState.mode === "perspective") {
    return Mat4.perspective(
      degToRad(projectionState.fov),
      aspect,
      projectionState.near,
      projectionState.far
    );
  }

  // Orthographic projection mempertahankan aspect ratio viewport
  const size = 2.0;

  return Mat4.orthographic(
    -size * aspect,
    size * aspect,
    -size,
    size,
    projectionState.near,
    projectionState.far
  );
}

// 8. Fungsi Gambar (Draw Call)
// Mengirim matriks ke uniform shader dan menggambar 36 vertex kubus
function drawCube(model, view, projection) {
  gl.uniformMatrix4fv(modelLocation, false, model);
  gl.uniformMatrix4fv(viewLocation, false, view);
  gl.uniformMatrix4fv(projectionLocation, false, projection);

  gl.drawArrays(gl.TRIANGLES, 0, 36);
}

// 9. Fungsi Animasi & Update State per Frame
// Rotasi otomatis kubus secara kontinu (derajat per detik)
function updateCube(dt) {
  cube.rotationX += 25 * dt;
  cube.rotationY += 40 * dt;
}

// State input keyboard (continuous key capture)
const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;

  if (
    event.key.startsWith("Arrow") ||
    event.key === "PageUp" ||
    event.key === "PageDown"
  ) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

// Kontrol posisi kamera (gerakan halus berdasarkan delta time)
const cameraSpeed = 2.0;

// State Challenge A (Orbit Camera)
let isOrbiting = false;
let orbitAngle = Math.atan2(camera.position[2], camera.position[0]);
const orbitSpeed = 1.0;

function updateCamera(dt) {
  // Arrow keys: menggeser kamera sumbu X dan Y
  if (keys["arrowleft"]) {
    camera.position[0] -= cameraSpeed * dt;
  }
  if (keys["arrowright"]) {
    camera.position[0] += cameraSpeed * dt;
  }
  if (keys["arrowup"]) {
    camera.position[1] += cameraSpeed * dt;
  }
  if (keys["arrowdown"]) {
    camera.position[1] -= cameraSpeed * dt;
  }

  // W / S: menggeser kamera sumbu Z (maju/mundur)
  if (keys["w"]) {
    camera.position[2] -= cameraSpeed * dt;
  }
  if (keys["s"]) {
    camera.position[2] += cameraSpeed * dt;
  }

  // Challenge B: PageUp / PageDown untuk mengubah ketinggian kamera (Y)
  if (keys["pageup"]) {
    camera.position[1] += cameraSpeed * dt;
  }
  if (keys["pagedown"]) {
    camera.position[1] -= cameraSpeed * dt;
  }

  // Challenge A: Menggerakkan kamera melingkar mengelilingi target (0,0,0)
  if (isOrbiting) {
    orbitAngle += orbitSpeed * dt;
    const radius = Math.hypot(camera.position[0], camera.position[2]) || 4.0;
    camera.position[0] = Math.cos(orbitAngle) * radius;
    camera.position[2] = Math.sin(orbitAngle) * radius;
  }
}

// Kontrol perubahan FOV secara continuous dengan tombol '[' dan ']' (30° - 100°)
const fovSpeed = 35.0;

function updateFOV(dt) {
  if (keys["["]) {
    projectionState.fov -= fovSpeed * dt;
  }
  if (keys["]"]) {
    projectionState.fov += fovSpeed * dt;
  }

  projectionState.fov = Math.max(30, Math.min(100, projectionState.fov));
}

// 10. Kontrol Event-Based (Toggle & Preset)
// Tombol P: Toggle mode proyeksi (Perspective <-> Orthographic)
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "p" && !event.repeat) {
    projectionState.mode =
      projectionState.mode === "perspective"
        ? "orthographic"
        : "perspective";
  }
});

// Preset Near/Far plane untuk eksplorasi clipping dan depth precision
const clipPresets = [
  { near: 0.1, far: 100 },
  { near: 1.0, far: 20 },
  { near: 2.5, far: 8 }
];

let clipPresetIndex = 0;

function nextClipPreset() {
  clipPresetIndex = (clipPresetIndex + 1) % clipPresets.length;

  const preset = clipPresets[clipPresetIndex];
  projectionState.near = preset.near;
  projectionState.far = preset.far;
}

// Tombol N: Ganti preset near/far plane
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "n" && !event.repeat) {
    nextClipPreset();
  }
});

// State & Toggle Depth Test (gl.DEPTH_TEST)
let depthEnabled = true;

// Tombol D: Toggle depth test ON/OFF
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "d" && !event.repeat) {
    depthEnabled = !depthEnabled;
  }
});

// Fungsi reset scene ke konfigurasi awal
function resetScene() {
  camera.position[0] = 0.0;
  camera.position[1] = 1.5;
  camera.position[2] = 4.0;

  projectionState.mode = "perspective";
  projectionState.fov = 60;
  projectionState.near = 0.1;
  projectionState.far = 100.0;
  clipPresetIndex = 0;

  depthEnabled = true;
  isOrbiting = false;
  orbitAngle = Math.atan2(camera.position[2], camera.position[0]);
}

// Tombol R: Reset kamera dan proyeksi
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r" && !event.repeat) {
    resetScene();
  }
});

// Challenge A: Tombol O untuk toggle mode Orbit Camera
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "o" && !event.repeat) {
    isOrbiting = !isOrbiting;
    if (isOrbiting) {
      orbitAngle = Math.atan2(camera.position[2], camera.position[0]);
    }
  }
});

// Challenge F: Tombol 1, 2, 3 untuk FOV Preset (35°, 60°, 90°)
window.addEventListener("keydown", (event) => {
  if (!event.repeat) {
    if (event.key === "1") {
      projectionState.fov = 35;
    } else if (event.key === "2") {
      projectionState.fov = 60;
    } else if (event.key === "3") {
      projectionState.fov = 90;
    }
  }
});

// -----------------------------------------------------------------------------
// 11. Update HUD (Heads-Up Display)
// -----------------------------------------------------------------------------
const projectionInfo = document.getElementById("projectionInfo");
const cameraInfo = document.getElementById("cameraInfo");
const fovInfo = document.getElementById("fovInfo");
const clipInfo = document.getElementById("clipInfo");
const depthInfo = document.getElementById("depthInfo");

function updateHUD() {
  projectionInfo.textContent = projectionState.mode;

  cameraInfo.textContent =
    `(${camera.position[0].toFixed(2)}, ` +
    `${camera.position[1].toFixed(2)}, ` +
    `${camera.position[2].toFixed(2)})` +
    (isOrbiting ? " [Orbiting]" : "");

  fovInfo.textContent = `${projectionState.fov.toFixed(1)}°`;

  clipInfo.textContent = `${projectionState.near} / ${projectionState.far}`;

  depthInfo.textContent = depthEnabled ? "ON" : "OFF";
}

// 12. Main Rendering Loop
let lastTime = 0;

function render(time) {
  // Hitung delta time dalam satuan detik
  let dt = (time - lastTime) * 0.001;
  lastTime = time;

  // Batasi dt maksimum agar animasi stabil saat lag
  dt = Math.min(dt, 0.05);

  // Update animasi objek, kamera, dan FOV
  updateCube(dt);
  updateCamera(dt);
  updateFOV(dt);

  // Atur state depth test sesuai pilihan user
  if (depthEnabled) {
    gl.enable(gl.DEPTH_TEST);
  } else {
    gl.disable(gl.DEPTH_TEST);
  }

  // Set viewport WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Bersihkan color buffer dan depth buffer setiap frame
  gl.clearColor(0.03, 0.05, 0.10, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Pasang shader program dan binding VAO
  gl.useProgram(program);
  gl.bindVertexArray(vao);

  // Hitung matriks transformasi per frame
  const model = createModelMatrix();
  const view = Mat4.lookAt(camera.position, camera.target, camera.up);
  const projection = createProjectionMatrix();

  // Gambar objek kubus
  drawCube(model, view, projection);

  // Perbarui tampilan status teks di HUD
  updateHUD();

  // Request frame berikutnya
  requestAnimationFrame(render);
}

// Mulai loop animasi
requestAnimationFrame(render);
