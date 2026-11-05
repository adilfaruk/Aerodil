"use strict";

// Image paths, captions and location notes.
// Keep the image filenames identical to those in your assets folder.
const scenes = [
  {
    file: "delhi-sunset",
    name: "Delhi · Golden hour",
    tag: "01 / URBAN HORIZONS",
    title: "Above the familiar.",
    description:
      "A sunset cityscape frames the ambition: compact aircraft with a fresh perspective.",
    note:
      "Delhi-inspired concept. This is an illustration, not a documented or authorised flight."
  },
  {
    file: "delhi-aerial",
    name: "Delhi · Aerial study",
    tag: "02 / WINGED CONCEPT",
    title: "A wider perspective.",
    description:
      "A visual study of winged flight above a monumental urban landscape.",
    note:
      "The winged aircraft is a design reference. It does not represent the current microdrone hardware."
  },
  {
    file: "himalayan-valley",
    name: "Mountain valley",
    tag: "03 / HIGH TERRAIN",
    title: "Beyond the ridgeline.",
    description:
      "Mountain landscapes inspire questions about endurance, visibility and changing conditions.",
    note:
      "Illustrative terrain. High-altitude and wind performance have not been tested."
  },
  {
    file: "city-circle",
    name: "City · Street patterns",
    tag: "04 / URBAN PATTERNS",
    title: "See the connections.",
    description:
      "An urban scene explores the visual rhythm of streets, architecture and shared spaces.",
    note:
      "Concept image only. No urban deployment or overflight capability is claimed."
  },
  {
    file: "tea-estates",
    name: "Tea-growing landscapes",
    tag: "05 / CULTIVATED LAND",
    title: "Closer to the landscape.",
    description:
      "Terraced fields suggest future exploration of landscape observation and agricultural imagery.",
    note:
      "Potential application study. Crop analysis, surveying accuracy and payload capability are unvalidated."
  },
  {
    file: "river-corridor",
    name: "River corridor",
    tag: "06 / WATERWAYS",
    title: "Follow a new course.",
    description:
      "A river landscape offers another perspective on connected environments and changing terrain.",
    note:
      "Concept image. Waterproofing, over-water reliability and maritime operations are not established."
  }
];

const getElement = (id) => document.getElementById(id);

const imagePath = (scene) => `assets/${scene.file}.png`;

let activeScene = 0;

const sceneTabs = getElement("scene-tabs");
const sceneImage = getElement("scene-image");
const sceneTag = getElement("scene-tag");
const sceneTitle = getElement("scene-title");
const sceneDescription = getElement("scene-description");
const sceneNote = getElement("scene-note");
const sceneCount = getElement("scene-count");

// Generate the six image selection buttons.
scenes.forEach((scene, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "scene-tab";
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-controls", "scene-image");

  const image = document.createElement("img");
  image.src = imagePath(scene);
  image.alt = "";
  image.loading = "lazy";

  const label = document.createElement("span");
  label.textContent = scene.name;

  button.append(image, label);
  button.addEventListener("click", () => selectScene(index));

  sceneTabs.appendChild(button);
});

function selectScene(index) {
  activeScene = index;

  const scene = scenes[index];

  sceneImage.src = imagePath(scene);
  sceneImage.alt = `${scene.name} — concept illustration`;

  sceneTag.textContent = scene.tag;
  sceneTitle.textContent = scene.title;
  sceneDescription.textContent = scene.description;
  sceneNote.textContent = scene.note;

  sceneCount.textContent =
    `${String(index + 1).padStart(2, "0")} / ` +
    String(scenes.length).padStart(2, "0");

  Array.from(sceneTabs.children).forEach((button, buttonIndex) => {
    button.setAttribute(
      "aria-pressed",
      String(buttonIndex === index)
    );
  });
}

selectScene(0);

// Full-size image viewer.
// Native dialog also supports closing with the Escape key.
const lightbox = getElement("lightbox");
const enlargeButton = getElement("enlarge-button");

enlargeButton.addEventListener("click", () => {
  const scene = scenes[activeScene];

  getElement("full-image").src = imagePath(scene);
  getElement("full-image").alt =
    `${scene.name} — concept illustration`;

  getElement("full-caption").textContent = scene.note;

  lightbox.showModal();
});

getElement("close-lightbox").addEventListener("click", () => {
  lightbox.close();
});

lightbox.addEventListener("close", () => {
  enlargeButton.focus();
});

// Close when the user clicks outside the dialog itself.
lightbox.addEventListener("click", (event) => {
  if (event.target !== lightbox) return;

  const bounds = lightbox.getBoundingClientRect();

  const outside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (outside) {
    lightbox.close();
  }
});

// Interactive CSS 3D aircraft.
const stage = getElement("stage");
const aircraft = getElement("aircraft");
const rotateButton = getElement("rotate-button");
const resetButton = getElement("reset-button");
const angleInput = getElement("view-angle");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

let yaw = 0;
let pitch = -24;
let rotating = !reducedMotion.matches;
let dragging = false;
let pointerId = null;
let previousX = 0;
let previousTime = 0;
let stageVisible = true;

function drawAircraft() {
  aircraft.style.transform = `
    translate(-50%, -50%)
    rotateX(${pitch}deg)
    rotateY(${yaw}deg)
    rotateZ(-20deg)
  `;
}

function updateRotateButton() {
  rotateButton.textContent = rotating
    ? "Pause rotation"
    : "Resume rotation";

  rotateButton.setAttribute(
    "aria-pressed",
    String(rotating)
  );
}

rotateButton.addEventListener("click", () => {
  rotating = !rotating;
  updateRotateButton();
});

resetButton.addEventListener("click", () => {
  yaw = 0;
  pitch = -24;
  angleInput.value = String(pitch);

  drawAircraft();
});

angleInput.addEventListener("input", (event) => {
  pitch = Number(event.target.value);
  drawAircraft();
});

// Mouse, pen and touch drag support.
stage.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;

  dragging = true;
  pointerId = event.pointerId;
  previousX = event.clientX;

  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointermove", (event) => {
  if (!dragging || event.pointerId !== pointerId) return;

  const movement = event.clientX - previousX;

  yaw = (yaw + movement * 0.6) % 360;
  previousX = event.clientX;

  drawAircraft();
});

function stopDragging(event) {
  if (event.pointerId !== pointerId) return;

  dragging = false;
  pointerId = null;
}

stage.addEventListener("pointerup", stopDragging);
stage.addEventListener("pointercancel", stopDragging);
stage.addEventListener("lostpointercapture", stopDragging);

// Keyboard support.
stage.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    return;
  }

  event.preventDefault();

  yaw += event.key === "ArrowLeft" ? -12 : 12;
  yaw %= 360;

  drawAircraft();
});

// Avoid changing the model while its section is off-screen.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    stageVisible = entries[0].isIntersecting;
  });

  observer.observe(stage);
}

// Respect changes to the user's reduced-motion preference.
reducedMotion.addEventListener("change", (event) => {
  if (event.matches) {
    rotating = false;
    updateRotateButton();
  }
});

function animate(time) {
  if (
    previousTime &&
    rotating &&
    !dragging &&
    stageVisible &&
    !document.hidden
  ) {
    const elapsed = Math.min(time - previousTime, 50);

    yaw = (yaw + elapsed * 0.012) % 360;
    drawAircraft();
  }

  previousTime = time;
  window.requestAnimationFrame(animate);
}

updateRotateButton();
drawAircraft();
window.requestAnimationFrame(animate);

// Automatically update the footer year.
getElement("year").textContent = new Date().getFullYear();