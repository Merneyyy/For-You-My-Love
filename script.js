/* ================== FIREBASE CONFIG ================== */
const FIREBASE_URL =
  "https://love-58a84-default-rtdb.asia-southeast1.firebasedatabase.app";

async function saveData(path, data) {
  const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function loadData(path) {
  const res = await fetch(`${FIREBASE_URL}/${path}.json`);
  return res.json();
}

/* ================== INTRO FADE ================== */
window.addEventListener("load", () => {
  const intro = document.getElementById("intro");
  if (intro) {
    setTimeout(() => {
      intro.style.display = "none";
      document.body.classList.add("intro-finished");
    }, 4000);
  }
});

/* ================== PASSWORD ================== */
const SECRET = "120209";
const pwScreen = document.getElementById("password-screen");
const pwInput = document.getElementById("password-input");
const pwBtn = document.getElementById("password-btn");
const app = document.getElementById("app");

pwBtn.addEventListener("click", () => {
  if ((pwInput.value || "").trim() === SECRET) {
    pwScreen.classList.add("hidden");
    app.classList.remove("hidden");
    // Set initial active page to letter
    const defaultPage = document.getElementById("letter");
    defaultPage.classList.add("active");
    current = defaultPage;
  } else {
    pwInput.value = "";
    pwInput.placeholder = "Wrong code!";
    pwInput.style.border = "2px solid #ff8aa8";
    setTimeout(() => (pwInput.style.border = ""), 900);
  }
});

/* ================== NAVIGATION ================== */
const pills = document.querySelectorAll(".pill");
const pages = document.querySelectorAll(".page");
let current = document.querySelector(".page.active");

pills.forEach((p) => {
  p.addEventListener("click", () => {
    const target = p.dataset.target;
    if (!target || current.id === target) return;
    pills.forEach((x) => x.classList.remove("active"));
    p.classList.add("active");
    current.classList.remove("active");
    const next = document.getElementById(target);
    next.classList.add("active");
    current = next;
  });
});

/* ================== HEARTS BACKGROUND ================== */
const heartContainer = document.getElementById("heart-background");
let heartTimer = null;
function spawnHeart() {
  const h = document.createElement("div");
  h.className = "heart";
  h.textContent = ["💖", "💕", "❤️"][Math.floor(Math.random() * 3)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 12 + Math.random() * 18 + "px";
  h.style.animationDuration = 4 + Math.random() * 6 + "s";
  heartContainer.appendChild(h);
  setTimeout(() => h.remove(), 11000);
}
heartTimer = setInterval(spawnHeart, 360);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearInterval(heartTimer);
  else heartTimer = setInterval(spawnHeart, 360);
});

/* ================== LETTERS ================== */
const lettersList = document.getElementById("letters-list");
const letterContent = document.getElementById("letterContent");
const addLetterBtn = document.getElementById("add-letter");
const saveLettersBtn = document.getElementById("save-letters");
const refreshLettersBtn = document.getElementById("refresh-letters");
let lettersData = [];
let currentOpenLetterIndex = -1;

async function loadLetters() {
  try {
    const online = await loadData("letters");
    if (online && Array.isArray(online)) lettersData = online;
    else
      lettersData = JSON.parse(localStorage.getItem("foryou_letters") || "[]");
    localStorage.setItem("foryou_letters", JSON.stringify(lettersData));
  } catch {
    lettersData = JSON.parse(localStorage.getItem("foryou_letters") || "[]");
  }
  renderLetters();
}

function renderLetters() {
  if (!lettersList) return;
  lettersList.innerHTML = "";
  lettersData.forEach((letter, i) => {
    const isOpen = currentOpenLetterIndex === i;
    const btnText = isOpen ? "Click to close" : "Click to open";
    const div = document.createElement("div");
    div.className = "letter-card";
    div.innerHTML = `
  <div class="letter-left">
    <div class="icon">💌</div>
    <div class="meta">
      <div class="letter-title">${letter.title || "My Love Letter"}</div>
      <div class="letter-date">${letter.date || "Today"}</div>
    </div>
  </div>
  <div class="letter-actions">
    <button class="open-btn" data-index="${i}">${btnText}</button>
  </div>
  <button class="delete-letter" data-index="${i}">✖</button>
`;
    lettersList.appendChild(div);
  });

  lettersList.querySelectorAll(".open-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const i = e.target.dataset.index;
      if (currentOpenLetterIndex === parseInt(i)) {
        closeLetter(i);
      } else {
        openLetter(i);
      }
    });
  });

  lettersList.querySelectorAll(".delete-letter").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const i = e.target.dataset.index;
      lettersData.splice(i, 1);
      localStorage.setItem("foryou_letters", JSON.stringify(lettersData));
      renderLetters();
      await saveData("letters", lettersData);
    });
  });
}

function openLetter(index) {
  // Close any currently open letter
  if (
    currentOpenLetterIndex !== -1 &&
    currentOpenLetterIndex !== parseInt(index)
  ) {
    closeLetter(currentOpenLetterIndex);
  }

  const letter = lettersData[index];
  const letterText = document.getElementById("letterText");

  letterText.innerHTML =
    letter.content ||
    "Dear [Name],<br><br>I wanted to take a moment to express how much you mean to me...";

  letterContent.style.display = "block";
  letterContent.classList.add("show");

  currentOpenLetterIndex = parseInt(index);

  // Update button text
  renderLetters();

  // Add save functionality for edited content
  letterText.addEventListener("input", async () => {
    lettersData[index].content = letterText.innerHTML;
    localStorage.setItem("foryou_letters", JSON.stringify(lettersData));
    await saveData("letters", lettersData);
  });
}

function closeLetter(index) {
  letterContent.classList.remove("show");
  setTimeout(() => (letterContent.style.display = "none"), 360);
  currentOpenLetterIndex = -1;
  renderLetters();
}

if (addLetterBtn)
  addLetterBtn.addEventListener("click", async () => {
    const title = prompt("Letter title:") || "My Love Letter";
    const content =
      "Dear [Name],<br><br>I wanted to take a moment to express how much you mean to me...";
    const date = new Date().toLocaleDateString();
    lettersData.push({ title, content, date });
    localStorage.setItem("foryou_letters", JSON.stringify(lettersData));
    renderLetters();
    await saveData("letters", lettersData);
  });

if (saveLettersBtn)
  saveLettersBtn.addEventListener("click", async () => {
    localStorage.setItem("foryou_letters", JSON.stringify(lettersData));
    await saveData("letters", lettersData);
    alert("Letters saved online 💌");
  });

if (refreshLettersBtn) refreshLettersBtn.addEventListener("click", loadLetters);

document.addEventListener("DOMContentLoaded", loadLetters);

/* ================== NOTES ================== */
const notesContainer = document.getElementById("notes-container");
const addNoteBtn = document.getElementById("add-note");
const saveNotesOnline = document.getElementById("save-notes-online");
const refreshNotes = document.getElementById("refresh-notes");
let notesData = [];

async function loadNotes() {
  try {
    const online = await loadData("notes");
    if (online && Array.isArray(online)) notesData = online;
    else
      notesData = JSON.parse(localStorage.getItem("foryou_love_notes") || "[]");
    localStorage.setItem("foryou_love_notes", JSON.stringify(notesData));
  } catch {
    notesData = JSON.parse(localStorage.getItem("foryou_love_notes") || "[]");
  }
  renderNotes();
}

function renderNotes() {
  if (!notesContainer) return;
  notesContainer.innerHTML = "";
  notesData.forEach((note, i) => {
    const div = document.createElement("div");
    div.className = "note-card";
    div.innerHTML = `
      <button class="delete-btn" data-index="${i}">✖</button>
      <textarea data-index="${i}" rows="3">${note}</textarea>
    `;
    notesContainer.appendChild(div);
  });

  notesContainer.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const idx = e.target.dataset.index;
      notesData.splice(idx, 1);
      localStorage.setItem("foryou_love_notes", JSON.stringify(notesData));
      renderNotes();
      await saveData("notes", notesData);
    });
  });

  notesContainer.querySelectorAll("textarea").forEach((txt) => {
    txt.addEventListener("input", async (e) => {
      const idx = e.target.dataset.index;
      notesData[idx] = e.target.value;
      localStorage.setItem("foryou_love_notes", JSON.stringify(notesData));
      await saveData("notes", notesData);
    });
  });
}

function addNote() {
  notesData.push("");
  localStorage.setItem("foryou_love_notes", JSON.stringify(notesData));
  renderNotes();
}

if (addNoteBtn)
  addNoteBtn.addEventListener("click", async () => {
    addNote();
    await saveData("notes", notesData);
  });
if (saveNotesOnline)
  saveNotesOnline.addEventListener("click", async () => {
    await saveData("notes", notesData);
    alert("Notes saved online 💾");
  });
if (refreshNotes) refreshNotes.addEventListener("click", loadNotes);

document.addEventListener("DOMContentLoaded", loadNotes);

/* ================== MUSIC ================== */
const player = document.getElementById("player");
const playBtns = document.querySelectorAll(".play");
const pauseBtns = document.querySelectorAll(".pause");
const saveMusicBtn = document.getElementById("save-music");
const musicUrlInput = document.getElementById("music-url");
const addSongBtn = document.getElementById("add-song");
const saveMusicOnline = document.getElementById("save-music-online");
const refreshMusic = document.getElementById("refresh-music");
let musicData = [];

async function loadMusic() {
  try {
    const online = await loadData("music");
    if (online && Array.isArray(online)) musicData = online;
    else
      musicData = JSON.parse(localStorage.getItem("foryou_music_data") || "[]");
    localStorage.setItem("foryou_music_data", JSON.stringify(musicData));
    if (musicData.length > 0) {
      player.src = musicData[0].url || "";
      musicUrlInput.value = musicData[0].url || "";
    }
  } catch {
    musicData = JSON.parse(localStorage.getItem("foryou_music_data") || "[]");
    if (musicData.length > 0) {
      player.src = musicData[0].url || "";
      musicUrlInput.value = musicData[0].url || "";
    }
  }
  renderMusic();
}

playBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const src = btn.dataset.src;
    if (!src) return;
    if (player.src !== src) player.src = src;
    player.play().catch(() => {});
  });
});
pauseBtns.forEach((btn) => btn.addEventListener("click", () => player.pause()));

function renderMusic() {
  const musicList = document.getElementById("music-list");
  if (!musicList) return;
  musicList.innerHTML = "";
  musicData.forEach((song, i) => {
    const div = document.createElement("div");
    div.className = "song-card";
    div.innerHTML = `
      <div class="song-left">
        <div class="icon">🎵</div>
        <div class="meta">
          <div class="song-title">${song.title || "Untitled"}</div>
          <div class="song-artist">${song.artist || "Unknown"}</div>
        </div>
      </div>
      <div class="song-actions">
        <button class="circle play" data-src="${song.url}">▶</button>
        <button class="circle pause">⏸</button>
        <button class="delete-song" data-index="${i}">✖</button>
      </div>
    `;
    musicList.appendChild(div);
  });

  musicList.querySelectorAll(".delete-song").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const i = e.target.dataset.index;
      musicData.splice(i, 1);
      localStorage.setItem("foryou_music_data", JSON.stringify(musicData));
      renderMusic();
      await saveData("music", musicData);
    });
  });
}

if (addSongBtn)
  addSongBtn.addEventListener("click", async () => {
    const url = (musicUrlInput.value || "").trim();
    if (!url) return alert("Paste a valid mp3 URL first.");
    const title = prompt("Song title:") || "Untitled";
    const artist = prompt("Artist:") || "Unknown";
    musicData.push({ title, artist, url });
    localStorage.setItem("foryou_music_data", JSON.stringify(musicData));
    renderMusic();
    await saveData("music", musicData);
  });

if (saveMusicOnline)
  saveMusicOnline.addEventListener("click", async () => {
    await saveData("music", musicData);
    alert("Music saved online 🎵");
  });

if (refreshMusic) refreshMusic.addEventListener("click", loadMusic);

document.addEventListener("DOMContentLoaded", loadMusic);

/* ================== GALLERY ================== */
const galleryGrid = document.getElementById("gallery-grid");
const addImageBtn = document.getElementById("add-image");
const saveGalleryOnline = document.getElementById("save-gallery-online");
const refreshGallery = document.getElementById("refresh-gallery");
let galleryData = [];

async function loadGallery() {
  try {
    const online = await loadData("gallery");
    if (online && Array.isArray(online)) galleryData = online;
    else
      galleryData = JSON.parse(localStorage.getItem("foryou_gallery") || "[]");
    localStorage.setItem("foryou_gallery", JSON.stringify(galleryData));
  } catch {
    galleryData = JSON.parse(localStorage.getItem("foryou_gallery") || "[]");
  }
  renderGallery();
}

function renderGallery() {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = "";
  galleryData.forEach((url, i) => {
    const div = document.createElement("div");
    div.className = "frame";
    div.innerHTML = `<img src="${url}" /><button class="delete-image" data-index="${i}">✖</button>`;
    galleryGrid.appendChild(div);
  });
  galleryGrid.querySelectorAll("img").forEach((img) => {
    img.addEventListener("click", () => window.open(img.src, "_blank"));
  });
  galleryGrid.querySelectorAll(".delete-image").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const i = e.target.dataset.index;
      galleryData.splice(i, 1);
      localStorage.setItem("foryou_gallery", JSON.stringify(galleryData));
      renderGallery();
      await saveData("gallery", galleryData);
    });
  });
}

if (addImageBtn)
  addImageBtn.addEventListener("click", async () => {
    const url = prompt("Image URL:") || "";
    if (!url) return;
    galleryData.push(url);
    localStorage.setItem("foryou_gallery", JSON.stringify(galleryData));
    renderGallery();
    await saveData("gallery", galleryData);
  });

if (saveGalleryOnline)
  saveGalleryOnline.addEventListener("click", async () => {
    await saveData("gallery", galleryData);
    alert("Gallery saved online 🌸");
  });

if (refreshGallery) refreshGallery.addEventListener("click", loadGallery);

document.addEventListener("DOMContentLoaded", loadGallery);

/* ================== REALTIME POLLING (optional) ================== */
setInterval(() => {
  loadLetters();
  loadNotes();
  loadMusic();
  loadGallery();
}, 5000); // refresh tiap 5 detik

