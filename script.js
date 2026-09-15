/* ═══════════════════════════════════════════════════════════
   Chapelle du Viaulnay — affichage piloté par data.js
   Le contenu (photos, titres, descriptions) se modifie dans
   data.js, chargé avant ce script : aucun serveur nécessaire,
   index.html s'ouvre directement par double-clic.
   ═══════════════════════════════════════════════════════════ */

const FRESQUES = { nord: [], sud: [] };

/* ─────────────── État & navigation entre écrans ─────────────── */

const state = { side: "nord", index: 0, introPart: 0 };

const screens = {
  home: document.getElementById("screen-home"),
  intro: document.getElementById("screen-intro"),
  gallery: document.getElementById("screen-gallery"),
  detail: document.getElementById("screen-detail"),
  outro: document.getElementById("screen-outro"),
};
let currentScreen = "home";

/* Retire le focus de l'élément actif : la navigation clavier change
   d'écran ou de fresque sans jamais mettre un bouton en surbrillance. */
function clearFocus() {
  const el = document.activeElement;
  if (el && el !== document.body && typeof el.blur === "function") el.blur();
}

function showScreen(name) {
  currentScreen = name;
  clearFocus();
  if (
    typeof closeLightbox === "function" &&
    name !== "intro" &&
    name !== "outro"
  )
    closeLightbox();
  // stoppe la vidéo de restitution et le son quand on quitte le détail
  if (name !== "detail") {
    const v = document.getElementById("detail-video-right");
    if (v && !v.paused) v.pause();
    if (typeof stopFresqueSound === "function") stopFresqueSound();
  }
  Object.entries(screens).forEach(([key, el]) =>
    el.classList.toggle("is-active", key === name),
  );
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

/* ─────────────── Écran d'introduction (3 parties) ─────────────── */

/* Parties déclarées dans data.js (intro[]) : titre, sous-titre et
   liste de photos. Une entrée de `images` peut être un couple
   [a, b] : les deux photos restent côte à côte sur la même ligne. */
const INTRO_PARTS =
  typeof FRESQUES_DATA === "object" &&
  FRESQUES_DATA !== null &&
  Array.isArray(FRESQUES_DATA.intro)
    ? FRESQUES_DATA.intro
    : [];

/* Photos de la partie affichée, à plat, pour la fenêtre d'agrandissement */
let introPhotos = [];

function introPartCount() {
  return INTRO_PARTS.length;
}

function showIntro(part) {
  if (!introPartCount()) return showGallery("nord");
  const p = Math.min(introPartCount() - 1, Math.max(0, part));
  const changed = p !== state.introPart || currentScreen !== "intro";
  state.introPart = p;
  const data = INTRO_PARTS[p];

  document.getElementById("intro-title").textContent = data.titre || "";
  document.getElementById("intro-subtitle").textContent =
    data.sousTitre || "";
  document.getElementById("intro-counter").textContent =
    `${p + 1} / ${introPartCount()}`;
  document.getElementById("btn-intro-prev").disabled = p === 0;

  if (changed) renderMosaic(data.images || []);
  if (currentScreen !== "intro") {
    showScreen("intro");
    // sur petit écran la section était masquée (display: none) : ses
    // dimensions ne sont connues qu'une fois affichée
    requestAnimationFrame(layoutMosaic);
  } else clearFocus();
}

/* Construit les tuiles de la mosaïque. Chaque tuile porte une ou deux
   photos ; la mise en page (hauteur des lignes) est calculée ensuite
   par layoutMosaic(), une fois les dimensions des photos connues. */
function renderMosaic(images) {
  const viewport = document.getElementById("mosaic-viewport");
  const old = document.getElementById("mosaic");
  const mosaic = document.createElement("div");
  mosaic.className = "mosaic";
  mosaic.id = "mosaic";
  introPhotos = [];

  const pending = [];
  images.forEach((entry) => {
    const files = Array.isArray(entry) ? entry : [entry];
    const tile = document.createElement("div");
    tile.className = "mosaic-tile" + (files.length > 1 ? " is-pair" : "");
    files.forEach((src) => {
      const index = introPhotos.length;
      introPhotos.push(src);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mosaic-item";
      btn.setAttribute("aria-label", `Agrandir la photo ${index + 1}`);
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.decoding = "async";
      // ratio par défaut tant que la photo n'est pas chargée
      btn.dataset.ratio = "1.333";
      pending.push(
        new Promise((resolve) => {
          const done = () => {
            if (img.naturalWidth && img.naturalHeight)
              btn.dataset.ratio = String(img.naturalWidth / img.naturalHeight);
            resolve();
          };
          if (img.complete && img.naturalWidth) done();
          else {
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }
        }),
      );
      btn.appendChild(img);
      btn.addEventListener("click", () => openLightbox(index, introPhotos));
      tile.appendChild(btn);
    });
    mosaic.appendChild(tile);
  });

  old.replaceWith(mosaic);
  viewport.scrollTop = 0;
  layoutMosaic();
  Promise.all(pending).then(() => {
    // ne relance la mise en page que si cette mosaïque est toujours affichée
    if (document.getElementById("mosaic") === mosaic) layoutMosaic();
  });
}

/* Mise en page « justifiée » : les tuiles d'une même ligne partagent la
   même hauteur et remplissent exactement la largeur. On cherche la plus
   grande hauteur de ligne « cible » pour laquelle l'ensemble tient dans
   la zone ; au-delà d'un minimum, la mosaïque défile. */
const MOSAIC_MIN_ROW = 120;

function layoutMosaic() {
  const viewport = document.getElementById("mosaic-viewport");
  const mosaic = document.getElementById("mosaic");
  if (!mosaic || !viewport) return;
  const tiles = Array.from(mosaic.children);
  if (!tiles.length) return;

  const gap = parseFloat(getComputedStyle(mosaic).gap) || 16;
  const vs = getComputedStyle(viewport);
  const W =
    viewport.clientWidth -
    parseFloat(vs.paddingLeft) -
    parseFloat(vs.paddingRight);
  const H =
    viewport.clientHeight -
    parseFloat(vs.paddingTop) -
    parseFloat(vs.paddingBottom);
  if (W <= 0 || H <= 0) return;

  // une tuile de hauteur h mesure r·h + écart interne (photos côte à côte)
  const specs = tiles.map((tile) => {
    const items = Array.from(tile.children);
    const r = items.reduce((sum, it) => sum + parseFloat(it.dataset.ratio), 0);
    return { r, inner: gap * (items.length - 1) };
  });
  const widthAt = (t, h) => t.r * h + t.inner;

  /* Découpe en lignes pour une hauteur cible h : une tuile rejoint la
     ligne courante si cela rapproche la ligne de la largeur W (léger
     dépassement toléré, résorbé ensuite en réduisant la hauteur). Chaque
     ligne prend la hauteur qui remplit W ; une dernière ligne incomplète
     garde la hauteur cible. Renvoie les lignes et la hauteur totale. */
  function pack(h) {
    const rows = [];
    let row = [];
    let used = 0;
    specs.forEach((t, i) => {
      const w = widthAt(t, h);
      const next = used + (row.length ? gap : 0) + w;
      if (row.length && Math.abs(next - W) > Math.abs(used - W)) {
        rows.push(row);
        row = [];
        used = w;
      } else used = next;
      row.push(i);
    });
    if (row.length) rows.push(row);

    const heights = rows.map((r, ri) => {
      const sumR = r.reduce((s, i) => s + specs[i].r, 0);
      const fixed = r.reduce((s, i) => s + specs[i].inner, 0) + gap * (r.length - 1);
      const fill = (W - fixed) / sumR;
      const last = ri === rows.length - 1;
      // dernière ligne incomplète : pas d'étirement au-delà de la cible
      return last && fill > h ? h : fill;
    });
    const total = heights.reduce((s, x) => s + x, 0) + gap * (rows.length - 1);
    return { rows, heights, total };
  }

  // plus grande hauteur cible dont la mise en page tient dans la zone
  let best = null;
  for (let h = Math.floor(H); h >= MOSAIC_MIN_ROW; h -= 2) {
    const candidate = pack(h);
    if (candidate.total <= H) {
      best = candidate;
      break;
    }
  }
  if (!best) best = pack(MOSAIC_MIN_ROW); // trop de photos : défilement

  best.rows.forEach((row, ri) => {
    const rowH = best.heights[ri];
    row.forEach((i) => {
      const tile = tiles[i];
      tile.style.height = `${rowH}px`;
      tile.style.width = `${widthAt(specs[i], rowH)}px`;
      Array.from(tile.children).forEach((it) => {
        it.style.width = `${parseFloat(it.dataset.ratio) * rowH}px`;
      });
    });
  });
}

let mosaicResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(mosaicResizeTimer);
  mosaicResizeTimer = setTimeout(() => {
    layoutMosaic();
    if (typeof layoutOutro === "function") layoutOutro();
    if (isLightboxOpen()) fitLightboxImage();
  }, 120);
});

/* ─────────────── Fenêtre d'agrandissement ─────────────── */

const lightbox = document.getElementById("lightbox");
/* série de photos parcourue par la fenêtre (intro ou clôture) */
let lightboxPhotos = [];
let lightboxIndex = 0;

function isLightboxOpen() {
  return !lightbox.hidden;
}

/* Agrandit la photo au maximum de la fenêtre en respectant son ratio
   (les originaux sont petits : sans cela ils resteraient à leur taille) */
function fitLightboxImage() {
  const img = document.getElementById("lightbox-img");
  const box = document.querySelector(".lightbox-figure");
  const caption = document.getElementById("lightbox-counter");
  if (!img.naturalWidth || !img.naturalHeight || !box) return;
  const ls = getComputedStyle(lightbox);
  const maxW =
    lightbox.clientWidth -
    parseFloat(ls.paddingLeft) -
    parseFloat(ls.paddingRight);
  const maxH =
    lightbox.clientHeight -
    parseFloat(ls.paddingTop) -
    parseFloat(ls.paddingBottom) -
    (caption ? caption.offsetHeight + parseFloat(getComputedStyle(caption).marginTop) : 0);
  // la bordure (content-box) s'ajoute autour de la photo : on la retire
  // de l'espace disponible, et on ne fixe que la largeur pour que le
  // navigateur conserve exactement le ratio de l'image
  const is = getComputedStyle(img);
  const bx = parseFloat(is.borderLeftWidth) + parseFloat(is.borderRightWidth);
  const by = parseFloat(is.borderTopWidth) + parseFloat(is.borderBottomWidth);
  const scale = Math.min(
    (maxW - bx) / img.naturalWidth,
    (maxH - by) / img.naturalHeight,
  );
  img.style.width = `${Math.floor(img.naturalWidth * scale)}px`;
  img.style.height = "auto";
}

/* `photos` : la série à parcourir ; omis, on reste sur la série courante
   (navigation ← / → dans la fenêtre) */
function openLightbox(index, photos) {
  if (Array.isArray(photos)) lightboxPhotos = photos;
  if (!lightboxPhotos.length) return;
  lightboxIndex = Math.min(lightboxPhotos.length - 1, Math.max(0, index));
  const img = document.getElementById("lightbox-img");
  img.style.width = "";
  img.style.height = "";
  img.onload = fitLightboxImage;
  img.src = lightboxPhotos[lightboxIndex];
  img.alt = `Photo ${lightboxIndex + 1} sur ${lightboxPhotos.length}`;
  document.getElementById("lightbox-counter").textContent =
    `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
  document.getElementById("lightbox-prev").disabled = lightboxIndex === 0;
  document.getElementById("lightbox-next").disabled =
    lightboxIndex === lightboxPhotos.length - 1;
  if (lightbox.hidden) {
    lightbox.hidden = false;
    // force le reflow avant d'animer l'apparition
    void lightbox.offsetWidth;
    lightbox.classList.add("is-open");
  }
  clearFocus();
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.classList.remove("is-open");
  lightbox.hidden = true;
  document.getElementById("lightbox-img").removeAttribute("src");
  clearFocus();
}

document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
document
  .getElementById("lightbox-prev")
  .addEventListener("click", () => openLightbox(lightboxIndex - 1));
document
  .getElementById("lightbox-next")
  .addEventListener("click", () => openLightbox(lightboxIndex + 1));
// clic sur le fond (hors photo et boutons) : fermeture
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox || e.target.classList.contains("lightbox-figure"))
    closeLightbox();
});

/* ─────────────── Écran de clôture ─────────────── */

/* Contenu déclaré dans data.js (outro) : deux photos et la prière.
   Rendu une seule fois au chargement ; showOutro() ne fait qu'afficher. */
const OUTRO =
  typeof FRESQUES_DATA === "object" &&
  FRESQUES_DATA !== null &&
  FRESQUES_DATA.outro &&
  typeof FRESQUES_DATA.outro === "object"
    ? FRESQUES_DATA.outro
    : null;

function hasOutro() {
  return OUTRO !== null;
}

/* chemins des photos de clôture, dans l'ordre : série de la fenêtre
   d'agrandissement (comme introPhotos pour l'introduction) */
let outroPhotos = [];

function renderOutro() {
  if (!hasOutro()) return;
  document.getElementById("outro-title").textContent = OUTRO.titre || "";
  document.getElementById("outro-subtitle").textContent =
    OUTRO.sousTitre || "";

  const imagesEl = document.getElementById("outro-images");
  imagesEl.innerHTML = "";
  outroPhotos = [];
  (OUTRO.images || []).forEach((entry) => {
    const { src, legende } =
      typeof entry === "string" ? { src: entry, legende: "" } : entry;
    const index = outroPhotos.length;
    outroPhotos.push(src);
    const fig = document.createElement("figure");
    fig.className = "detail-figure";
    const img = document.createElement("img");
    img.src = src;
    img.alt = legende || "";
    img.decoding = "async";
    img.addEventListener("load", layoutOutro, { once: true });
    // la photo s'ouvre en grand, comme celles de l'introduction ;
    // l'image reste l'élément dimensionné par layoutOutro()
    img.className = "outro-photo";
    img.setAttribute("role", "button");
    img.tabIndex = 0;
    img.setAttribute(
      "aria-label",
      legende ? `Agrandir : ${legende}` : `Agrandir la photo ${index + 1}`,
    );
    img.addEventListener("click", () => openLightbox(index, outroPhotos));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(index, outroPhotos);
      }
    });
    fig.appendChild(img);
    if (legende) {
      const cap = document.createElement("figcaption");
      cap.textContent = legende;
      fig.appendChild(cap);
    }
    imagesEl.appendChild(fig);
  });

  // légende commune aux deux photos, sous le diptyque
  const captionEl = document.getElementById("outro-images-caption");
  captionEl.textContent = OUTRO.legendeImages || "";
  captionEl.hidden = !OUTRO.legendeImages;

  const textEl = document.getElementById("outro-text");
  textEl.innerHTML = "";
  if (OUTRO.titreTexte) {
    const h = document.createElement("h3");
    h.textContent = OUTRO.titreTexte;
    textEl.appendChild(h);
  }
  const cols = document.createElement("div");
  cols.className = "outro-columns";
  const paragraphs = Array.isArray(OUTRO.texte)
    ? OUTRO.texte
    : String(OUTRO.texte || "").split(/\n\s*\n/);
  paragraphs.forEach((t) => {
    const para = document.createElement("p");
    para.textContent = t;
    cols.appendChild(para);
  });
  textEl.appendChild(cols);
  if (OUTRO.signature) {
    const sig = document.createElement("p");
    sig.className = "outro-signature";
    sig.textContent = OUTRO.signature;
    textEl.appendChild(sig);
  }
}

/* Dimensionne les deux portraits : même hauteur (celle de la zone,
   légende déduite), largeur suivant le ratio de chaque photo, le tout
   réduit si nécessaire pour tenir dans la largeur. Les figures prennent
   ainsi exactement la place des photos et restent serrées au centre. */
function layoutOutro() {
  const row = document.getElementById("outro-images");
  if (!row) return;
  const figs = Array.from(row.children);
  if (!figs.length) return;

  // petit écran : les photos s'empilent, le CSS suffit
  if (getComputedStyle(row).flexDirection === "column") {
    figs.forEach((fig) => {
      fig.style.width = "";
      const img = fig.querySelector("img");
      if (img) {
        img.style.width = "";
        img.style.height = "";
      }
    });
    return;
  }

  const gap = parseFloat(getComputedStyle(row).gap) || 16;
  const W = row.clientWidth;
  const H = row.clientHeight;
  if (W <= 0 || H <= 0) return;

  const specs = figs.map((fig) => {
    const img = fig.querySelector("img");
    const cap = fig.querySelector("figcaption");
    const capH = cap
      ? cap.offsetHeight + parseFloat(getComputedStyle(cap).marginTop)
      : 0;
    const ratio =
      img && img.naturalWidth && img.naturalHeight
        ? img.naturalWidth / img.naturalHeight
        : 0.72;
    return { img, capH, ratio };
  });

  // hauteur commune des photos, puis largeur totale à cette hauteur
  const imgH = H - Math.max(...specs.map((s) => s.capH));
  const total =
    specs.reduce((sum, s) => sum + s.ratio * imgH, 0) + gap * (figs.length - 1);
  const scale = total > W ? (W - gap * (figs.length - 1)) / (total - gap * (figs.length - 1)) : 1;

  specs.forEach((s, i) => {
    if (!s.img) return;
    const h = Math.floor(imgH * scale);
    const w = Math.floor(s.ratio * h);
    s.img.style.height = `${h}px`;
    s.img.style.width = `${w}px`;
    figs[i].style.width = `${w}px`;
  });
}

function showOutro() {
  if (!hasOutro()) return;
  document.getElementById("outro-text").scrollTop = 0;
  if (currentScreen !== "outro") {
    showScreen("outro");
    // sur petit écran la section était masquée : dimensions connues
    // seulement une fois affichée
    requestAnimationFrame(layoutOutro);
  } else clearFocus();
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
  // garde la galerie sur le même versant que la fresque affichée
  if (state.side !== side) setSide(side);
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
  document.getElementById("btn-next").disabled = isLastFresque(side, index);
  document.getElementById("detail-description").textContent =
    f.descriptionLongue || "";
  alignDetailLeft();

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
    rightVideo.muted = true;
    rightVideo.volume = 0;
    rightVideo.play().catch(() => {});
  } else {
    rightVideo.pause();
    rightVideo.removeAttribute("src");
    right.src = restored;
    right.alt = `${f.titre} — restitution`;
  }

  playFresqueSound(f);

  if (currentScreen !== "detail") showScreen("detail");
  else clearFocus();
}

/* ─────────────── Son des fresques ─────────────── */

/* Chaque fresque peut avoir un commentaire audio, lancé automatiquement
   à l'ouverture de son écran de détail. Le fichier est déclaré dans
   data.js (champ `son`) ; sans ce champ, la fresque est silencieuse et
   les commandes sont masquées (de même si le fichier est introuvable).
   L'état coupé / rallumé est commun à toutes les fresques et retenu
   d'une visite à l'autre. */

const detailAudio = document.getElementById("detail-audio");
const soundControls = document.getElementById("detail-sound");
const replayBtn = document.getElementById("btn-sound-replay");
const muteBtn = document.getElementById("btn-sound-mute");
const MUTE_STORAGE_KEY = "viaulnay-son-coupe";

let soundMuted = false;
try {
  soundMuted = localStorage.getItem(MUTE_STORAGE_KEY) === "1";
} catch (_) {
  /* stockage indisponible : le son reste allumé */
}

function fresqueSound(f) {
  return typeof f.son === "string" && f.son ? f.son : null;
}

function playFresqueSound(f) {
  const src = fresqueSound(f);
  soundControls.hidden = !src;
  soundControls.classList.remove("is-playing");
  if (!src) return stopFresqueSound();
  detailAudio.muted = soundMuted;
  detailAudio.src = src;
  detailAudio.currentTime = 0;
  // la lecture peut être refusée tant que l'utilisateur n'a pas interagi
  // avec la page : le bouton « rejouer » permet alors de la lancer
  detailAudio.play().catch(() => {});
}

function replayFresqueSound() {
  if (!detailAudio.getAttribute("src")) return;
  detailAudio.currentTime = 0;
  detailAudio.play().catch(() => {});
  clearFocus();
}

function stopFresqueSound() {
  if (!detailAudio.paused) detailAudio.pause();
  detailAudio.removeAttribute("src");
  soundControls.classList.remove("is-playing");
}

function updateMuteButton() {
  muteBtn.classList.toggle("is-muted", soundMuted);
  muteBtn.setAttribute("aria-pressed", String(soundMuted));
  const label = soundMuted ? "Rallumer le son" : "Couper le son";
  muteBtn.setAttribute("aria-label", label);
  muteBtn.title = label;
}

function toggleMute() {
  soundMuted = !soundMuted;
  detailAudio.muted = soundMuted;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, soundMuted ? "1" : "0");
  } catch (_) {
    /* stockage indisponible : l'état ne vaut que pour cette visite */
  }
  updateMuteButton();
  // rallumé alors que le commentaire est déjà terminé : on le rejoue
  if (!soundMuted && detailAudio.ended) replayFresqueSound();
  clearFocus();
}

replayBtn.addEventListener("click", replayFresqueSound);
muteBtn.addEventListener("click", toggleMute);

/* ─── Masquer / afficher le parchemin de texte de l'écran détail ─── */

const detailScreen = document.getElementById("screen-detail");
const textToggleBtn = document.getElementById("btn-text-toggle");
const TEXT_STORAGE_KEY = "viaulnay-texte-masque";

let textHidden = false;
try {
  textHidden = localStorage.getItem(TEXT_STORAGE_KEY) === "1";
} catch (_) {
  /* stockage indisponible : le texte reste affiché */
}

/* Aligne le coin gauche de l'en-tête (Retour, son, texte) sur le bord
   visible de la photo de gauche : inclinée en 3D, elle déborde de sa
   colonne vers la gauche, d'une quantité qui dépend de la largeur */
function alignDetailLeft() {
  const header = detailScreen.querySelector(".detail-header");
  const figure = detailScreen.querySelector(".detail-figure");
  const h = header.getBoundingClientRect();
  const f = figure.getBoundingClientRect();
  if (!h.width || !f.width) return;
  // l'écran peut être en transition (scale) : on ramène à l'échelle réelle
  const scale = h.width / header.offsetWidth || 1;
  const offset = Math.min(0, (f.left - h.left) / scale);
  header.style.setProperty("--detail-left-offset", `${offset}px`);
}

window.addEventListener("resize", alignDetailLeft);

function updateTextToggle() {
  detailScreen.classList.toggle("text-hidden", textHidden);
  alignDetailLeft();
  textToggleBtn.classList.toggle("is-hidden", textHidden);
  textToggleBtn.setAttribute("aria-pressed", String(textHidden));
  const label = textHidden ? "Afficher le texte" : "Masquer le texte";
  textToggleBtn.setAttribute("aria-label", label);
  textToggleBtn.title = label;
}

function toggleText() {
  textHidden = !textHidden;
  try {
    localStorage.setItem(TEXT_STORAGE_KEY, textHidden ? "1" : "0");
  } catch (_) {
    /* stockage indisponible : l'état ne vaut que pour cette visite */
  }
  updateTextToggle();
  clearFocus();
}

textToggleBtn.addEventListener("click", toggleText);
updateTextToggle();
detailAudio.addEventListener("play", () =>
  soundControls.classList.add("is-playing"),
);
["pause", "ended"].forEach((evt) =>
  detailAudio.addEventListener(evt, () =>
    soundControls.classList.remove("is-playing"),
  ),
);
// fichier absent ou illisible : pas de commandes pour cette fresque
detailAudio.addEventListener("error", () => {
  soundControls.hidden = true;
  soundControls.classList.remove("is-playing");
});
updateMuteButton();

/* Parcours linéaire du site :
   accueil → intro 1 → intro 2 → intro 3 → galerie (nord) → nord 1 … nord N
           → galerie (sud) → sud 1 … sud M → clôture (fin).
   Utilisé par les boutons ← / → du détail et par le clavier. */

/* Dernière étape du parcours : la dernière fresque sud s'il n'y a
   pas d'écran de clôture (sinon celui-ci prend le relais) */
function isLastFresque(side, index) {
  return (
    !hasOutro() && side === "sud" && index === FRESQUES.sud.length - 1
  );
}

function showGallery(side) {
  setSide(side);
  showScreen("gallery");
}

function goForward() {
  if (currentScreen === "home") return showIntro(0);
  if (currentScreen === "intro") {
    // parties de l'introduction, puis galerie nord
    if (state.introPart + 1 < introPartCount())
      return showIntro(state.introPart + 1);
    return showGallery("nord");
  }
  if (currentScreen === "gallery") {
    // ouvre la première fresque du versant sélectionné
    if (FRESQUES[state.side].length) return openDetail(state.side, 0);
    return;
  }
  // détail
  const { side, index } = state;
  if (index + 1 < FRESQUES[side].length) return openDetail(side, index + 1);
  // dernière fresque nord : retour à la galerie, versant sud sélectionné
  if (side === "nord") return showGallery("sud");
  // dernière fresque sud : écran de clôture, puis fin du parcours
  if (currentScreen === "detail") return showOutro();
}

function goBackward() {
  if (currentScreen === "intro") {
    if (state.introPart > 0) return showIntro(state.introPart - 1);
    return showScreen("home");
  }
  if (currentScreen === "gallery") {
    // galerie sud : revient à la dernière fresque nord
    if (state.side === "sud" && FRESQUES.nord.length)
      return openDetail("nord", FRESQUES.nord.length - 1);
    // galerie nord : dernière partie de l'introduction
    return showIntro(introPartCount() - 1);
  }
  if (currentScreen === "detail") {
    const { side, index } = state;
    if (index > 0) return openDetail(side, index - 1);
    // première fresque d'un versant : retour à la galerie de ce versant
    return showGallery(side);
  }
  if (currentScreen === "outro") {
    // clôture : retour à la dernière fresque sud
    if (FRESQUES.sud.length) return openDetail("sud", FRESQUES.sud.length - 1);
    return showGallery("sud");
  }
  // accueil : début du parcours
}

/* ─────────────── Événements ─────────────── */

document
  .getElementById("btn-start")
  .addEventListener("click", () => showIntro(0));
document
  .getElementById("btn-intro-home")
  .addEventListener("click", () => showScreen("home"));
document
  .getElementById("btn-intro-gallery")
  .addEventListener("click", () => showGallery("nord"));
document.getElementById("btn-intro-next").addEventListener("click", goForward);
document.getElementById("btn-intro-prev").addEventListener("click", goBackward);
document
  .getElementById("btn-home")
  .addEventListener("click", () => showScreen("home"));
document.getElementById("btn-thanks").addEventListener("click", showOutro);
document.getElementById("btn-thanks").hidden = !hasOutro();
document
  .getElementById("btn-back")
  .addEventListener("click", () => showScreen("gallery"));
document.getElementById("btn-next").addEventListener("click", goForward);
document.getElementById("btn-prev").addEventListener("click", goBackward);
document
  .getElementById("btn-outro-home")
  .addEventListener("click", () => showScreen("home"));
document.getElementById("btn-outro-prev").addEventListener("click", goBackward);
document
  .querySelectorAll(".segmented-btn")
  .forEach((btn) =>
    btn.addEventListener("click", () => setSide(btn.dataset.side)),
  );

/* Navigation clavier / télécommande :
   → / ↓ / Page suivante  = écran ou fresque suivante
   ← / ↑ / Page précédente = écran ou fresque précédente
   Échap / Retour arrière  = remonter d'un niveau
   Le parcours suit l'ordre : accueil, intro, galerie, puis chaque
   fresque du versant nord et du versant sud. */
const FORWARD_KEYS = ["ArrowRight", "ArrowDown", "PageDown"];
const BACKWARD_KEYS = ["ArrowLeft", "ArrowUp", "PageUp"];

document.addEventListener("keydown", (e) => {
  // fenêtre d'agrandissement ouverte : elle capte toute la navigation
  if (isLightboxOpen()) {
    if (e.key === "Escape" || e.key === "Backspace") {
      e.preventDefault();
      closeLightbox();
    } else if (FORWARD_KEYS.includes(e.key)) {
      e.preventDefault();
      openLightbox(lightboxIndex + 1);
    } else if (BACKWARD_KEYS.includes(e.key)) {
      e.preventDefault();
      openLightbox(lightboxIndex - 1);
    }
    return;
  }

  if (e.key === "Escape" || e.key === "Backspace") {
    e.preventDefault();
    if (currentScreen === "detail") showScreen("gallery");
    else if (currentScreen === "outro") showGallery("sud");
    else if (currentScreen === "gallery") showIntro(introPartCount() - 1);
    else if (currentScreen === "intro") showScreen("home");
    return;
  }

  if (FORWARD_KEYS.includes(e.key)) {
    e.preventDefault();
    goForward();
  } else if (BACKWARD_KEYS.includes(e.key)) {
    e.preventDefault();
    goBackward();
  }
});

/* ─────────────── Plein écran ─────────────── */

const fullscreenBtn = document.getElementById("btn-fullscreen");

function fullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function fullscreenEnabled() {
  return Boolean(
    document.fullscreenEnabled || document.webkitFullscreenEnabled
  );
}

function enterFullscreen() {
  const root = document.documentElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  if (request) request.call(root);
}

function exitFullscreen() {
  const exit = document.exitFullscreen || document.webkitExitFullscreen;
  if (exit) exit.call(document);
}

function toggleFullscreen() {
  if (fullscreenElement()) exitFullscreen();
  else enterFullscreen();
}

function updateFullscreenButton() {
  const active = Boolean(fullscreenElement());
  fullscreenBtn.classList.toggle("is-fullscreen", active);
  const label = active ? "Quitter le plein écran" : "Passer en plein écran";
  fullscreenBtn.setAttribute("aria-label", label);
  fullscreenBtn.title = label;
}

if (fullscreenEnabled()) {
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  updateFullscreenButton();
} else {
  fullscreenBtn.hidden = true;
}

/* ─────────────── Vidéo de restitution : son verrouillé ───────────────
   La vidéo de l'écran détail est purement visuelle. Son son est coupé en
   permanence et ne peut être réactivé par aucun moyen : ni via les
   contrôles natifs (menu contextuel « Afficher les commandes »), ni via le
   picture-in-picture, ni au clavier, ni par script. */

function lockVideoSound() {
  const v = document.getElementById("detail-video-right");
  if (!v) return;
  const enforce = () => {
    if (!v.muted) v.muted = true;
    if (v.volume !== 0) v.volume = 0;
    if (v.hasAttribute("controls")) v.removeAttribute("controls");
  };
  enforce();
  // toute tentative de réactivation est immédiatement annulée
  v.addEventListener("volumechange", enforce);
  v.addEventListener("loadedmetadata", enforce);
  v.addEventListener("play", enforce);
  v.addEventListener("playing", enforce);
  // pas de menu contextuel (empêche d'afficher les contrôles natifs)
  v.addEventListener("contextmenu", (e) => e.preventDefault());
  // pas de picture-in-picture (sa fenêtre expose un réglage de volume)
  v.addEventListener("enterpictureinpicture", () => {
    if (document.exitPictureInPicture) document.exitPictureInPicture().catch(() => {});
  });
  // si l'attribut controls ou muted est modifié depuis l'inspecteur / un script
  if (typeof MutationObserver === "function") {
    new MutationObserver(enforce).observe(v, {
      attributes: true,
      attributeFilter: ["controls", "muted"],
    });
  }
}

/* ─────────────── Initialisation ─────────────── */

lockVideoSound();
loadFresques();
renderOutro();
layoutOutro();
// prépare la première partie de l'introduction (titre, mosaïque) sans l'afficher
if (introPartCount()) {
  const first = INTRO_PARTS[0];
  document.getElementById("intro-title").textContent = first.titre || "";
  document.getElementById("intro-subtitle").textContent = first.sousTitre || "";
  document.getElementById("intro-counter").textContent = `1 / ${introPartCount()}`;
  document.getElementById("btn-intro-prev").disabled = true;
}
