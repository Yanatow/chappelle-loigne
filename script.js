/* ═══════════════════════════════════════════════════════════
   Chapelle du Viaulnay — affichage piloté par data.js
   Le contenu (photos, titres, descriptions) se modifie dans
   data.js, chargé avant ce script : aucun serveur nécessaire,
   index.html s'ouvre directement par double-clic.
   ═══════════════════════════════════════════════════════════ */

const FRESQUES = { nord: [], sud: [] };

/* ─────────────── État & navigation entre écrans ─────────────── */

const state = { side: "nord", index: 0 };

const screens = {
  home: document.getElementById("screen-home"),
  intro: document.getElementById("screen-intro"),
  gallery: document.getElementById("screen-gallery"),
  detail: document.getElementById("screen-detail"),
};
let currentScreen = "home";

function showScreen(name, focusTarget) {
  currentScreen = name;
  // stoppe la vidéo de restitution quand on quitte l'écran de détail
  if (name !== "detail") {
    const v = document.getElementById("detail-video-right");
    if (v && !v.paused) v.pause();
  }
  Object.entries(screens).forEach(([key, el]) =>
    el.classList.toggle("is-active", key === name),
  );
  const target =
    focusTarget || screens[name].querySelector('button, [tabindex="0"]');
  if (target) setTimeout(() => target.focus({ preventScroll: true }), 450);
}

/* ─────────────── Chargement des données ─────────────── */

function loadFresques() {
  if (typeof FRESQUES_DATA === "object" && FRESQUES_DATA !== null) {
    FRESQUES.nord = Array.isArray(FRESQUES_DATA.nord) ? FRESQUES_DATA.nord : [];
    FRESQUES.sud = Array.isArray(FRESQUES_DATA.sud) ? FRESQUES_DATA.sud : [];
  } else {
    document.getElementById("grid-nord").innerHTML =
      '<p class="load-error">Données introuvables : le fichier <strong>data.js</strong> ' +
      "doit être présent à côté d'index.html.</p>";
  }
  renderGrid("nord");
  renderGrid("sud");
  setSide("nord");
}

/* ─────────────── Écran d'introduction ─────────────── */

function renderIntro() {
  const intro =
    typeof FRESQUES_DATA === "object" && FRESQUES_DATA !== null
      ? FRESQUES_DATA.intro
      : null;
  if (!intro) return;
  if (intro.titre)
    document.getElementById("intro-title").textContent = intro.titre;
  document.getElementById("intro-text").textContent = intro.texte || "";
  document.getElementById("intro-caption").textContent = intro.legende || "";
  const img = document.getElementById("intro-img");
  if (intro.image) {
    // si le fichier est absent, le onerror de la balise affiche
    // l'emplacement en attente (cadre .is-empty)
    img.src = intro.image;
    img.alt = intro.legende || intro.titre || "Illustration";
  } else {
    img.hidden = true;
    img.closest("figure").classList.add("is-empty");
  }
}

/* ─────────────── Galerie & window component ─────────────── */

function renderGrid(side) {
  const grid = document.getElementById(`grid-${side}`);
  const items = FRESQUES[side];
  if (!items.length) return;
  grid.innerHTML = "";
  items.forEach((f, i) => {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    // cadrage vertical de la prévisualisation : 0 = haut, 50 = centre, 100 = bas
    const offset = Math.min(100, Math.max(0, f.preview_offset ?? 50));
    // vignette légère (générée par gen-thumbs.sh) chargée dès l'ouverture du
    // site : la galerie s'affiche instantanément ; repli sur la photo
    // d'origine si la vignette n'existe pas encore
    card.innerHTML = `
      <span class="card-media">
        <img src="thumbs/${f.photo}" alt="${f.titre}" decoding="async"
          style="object-position: 50% ${offset}%"
          onerror="this.onerror=null;this.src='${f.photo}'" />
      </span>
      <span class="card-title">${f.titre}</span>
      <span class="card-subtitle">${f.descriptionCourte || ""}</span>`;
    card.addEventListener("click", () => openDetail(side, i));
    grid.appendChild(card);
  });
}

function setSide(side) {
  state.side = side;
  document
    .querySelector(".segmented")
    .classList.toggle("side-sud", side === "sud");
  document
    .getElementById("slider-track")
    .classList.toggle("side-sud", side === "sud");
  document.querySelectorAll(".segmented-btn").forEach((btn) => {
    const active = btn.dataset.side === side;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });
}

/* ─────────────── Écran détail ─────────────── */

function openDetail(side, index) {
  state.side = side;
  state.index = index;
  const list = FRESQUES[side];
  const f = list[index];
  if (!f) return;
  const versant = side === "nord" ? "Versant Nord" : "Versant Sud";

  document.getElementById("detail-title").textContent = f.titre;
  document.getElementById("detail-subtitle").textContent = f.descriptionCourte
    ? `${versant} · ${f.descriptionCourte}`
    : versant;
  document.getElementById("detail-counter").textContent =
    `${index + 1} / ${list.length}`;
  document.getElementById("detail-description").textContent =
    f.descriptionLongue || "";

  const left = document.getElementById("detail-img-left");
  const right = document.getElementById("detail-img-right");
  const rightVideo = document.getElementById("detail-video-right");
  left.src = f.photo;
  left.alt = `${f.titre} — état actuel`;

  // la restitution peut être une photo ou une vidéo (mp4/webm)
  const restored = f.photo_restored || f.photo;
  const isVideo = /\.(mp4|webm|ogv)$/i.test(restored);
  right.hidden = isVideo;
  rightVideo.hidden = !isVideo;
  if (isVideo) {
    right.removeAttribute("src");
    rightVideo.src = restored;
    rightVideo.play().catch(() => {});
  } else {
    rightVideo.pause();
    rightVideo.removeAttribute("src");
    right.src = restored;
    right.alt = `${f.titre} — restitution`;
  }

  if (currentScreen !== "detail")
    showScreen("detail", document.getElementById("btn-next"));
}

function nextFresque() {
  openDetail(state.side, (state.index + 1) % FRESQUES[state.side].length);
}

function prevFresque() {
  const len = FRESQUES[state.side].length;
  openDetail(state.side, (state.index - 1 + len) % len);
}

/* ─────────────── Événements ─────────────── */

document
  .getElementById("btn-start")
  .addEventListener("click", () => showScreen("intro"));
document
  .getElementById("btn-intro-home")
  .addEventListener("click", () => showScreen("home"));
document
  .getElementById("btn-intro-continue")
  .addEventListener("click", () => showScreen("gallery"));
document
  .getElementById("btn-home")
  .addEventListener("click", () => showScreen("home"));
document
  .getElementById("btn-back")
  .addEventListener("click", () => showScreen("gallery"));
document.getElementById("btn-next").addEventListener("click", nextFresque);
document.getElementById("btn-prev").addEventListener("click", prevFresque);
document
  .querySelectorAll(".segmented-btn")
  .forEach((btn) =>
    btn.addEventListener("click", () => setSide(btn.dataset.side)),
  );

/* Navigation clavier / télécommande :
   flèches = déplacer la sélection, Entrée = valider, Échap = retour.
   Sur l'écran détail, ← / → changent directement de fresque. */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "Backspace") {
    e.preventDefault();
    if (currentScreen === "detail") showScreen("gallery");
    else if (currentScreen === "gallery") showScreen("intro");
    else if (currentScreen === "intro") showScreen("home");
    return;
  }

  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
    return;
  e.preventDefault();

  if (currentScreen === "detail") {
    if (e.key === "ArrowRight") nextFresque();
    if (e.key === "ArrowLeft") prevFresque();
    return;
  }

  // Déplacement du focus parmi les éléments visibles de l'écran actif
  const focusables = [
    ...screens[currentScreen].querySelectorAll("button"),
  ].filter((el) => el.offsetParent !== null);
  const visible = focusables.filter((el) => {
    const panel = el.closest(".slider-panel");
    if (!panel) return true;
    const panels = [...document.querySelectorAll(".slider-panel")];
    return panels.indexOf(panel) === (state.side === "nord" ? 0 : 1);
  });
  if (!visible.length) return;
  const pos = visible.indexOf(document.activeElement);
  const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
  const next =
    pos === -1
      ? 0
      : (pos + (forward ? 1 : -1) + visible.length) % visible.length;
  visible[next].focus();
});

/* ─────────────── Initialisation ─────────────── */

renderIntro();
loadFresques();
