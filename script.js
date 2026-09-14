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
  if (typeof closeLightbox === "function" && name !== "intro") closeLightbox();
  // stoppe la vidéo de restitution quand on quitte l'écran de détail
  if (name !== "detail") {
    const v = document.getElementById("detail-video-right");
    if (v && !v.paused) v.pause();
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
      btn.addEventListener("click", () => openLightbox(index));
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
    if (isLightboxOpen()) fitLightboxImage();
  }, 120);
});

/* ─────────────── Fenêtre d'agrandissement ─────────────── */

const lightbox = document.getElementById("lightbox");
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

function openLightbox(index) {
  if (!introPhotos.length) return;
  lightboxIndex = Math.min(introPhotos.length - 1, Math.max(0, index));
  const img = document.getElementById("lightbox-img");
  img.style.width = "";
  img.style.height = "";
  img.onload = fitLightboxImage;
  img.src = introPhotos[lightboxIndex];
  img.alt = `Photo ${lightboxIndex + 1} sur ${introPhotos.length}`;
  document.getElementById("lightbox-counter").textContent =
    `${lightboxIndex + 1} / ${introPhotos.length}`;
  document.getElementById("lightbox-prev").disabled = lightboxIndex === 0;
  document.getElementById("lightbox-next").disabled =
    lightboxIndex === introPhotos.length - 1;
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

  if (currentScreen !== "detail") showScreen("detail");
  else clearFocus();
}

/* Parcours linéaire du site :
   accueil → intro 1 → intro 2 → intro 3 → galerie (nord) → nord 1 … nord N
           → galerie (sud) → sud 1 … sud M (fin).
   Utilisé par les boutons ← / → du détail et par le clavier. */

function isLastFresque(side, index) {
  return side === "sud" && index === FRESQUES.sud.length - 1;
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
  // dernière fresque sud : fin du parcours
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
  // accueil : début du parcours
}

/* ─────────────── Événements ─────────────── */

document
  .getElementById("btn-start")
  .addEventListener("click", () => showIntro(0));
document
  .getElementById("btn-intro-home")
  .addEventListener("click", () => showScreen("home"));
document.getElementById("btn-intro-next").addEventListener("click", goForward);
document.getElementById("btn-intro-prev").addEventListener("click", goBackward);
document
  .getElementById("btn-home")
  .addEventListener("click", () => showScreen("home"));
document
  .getElementById("btn-back")
  .addEventListener("click", () => showScreen("gallery"));
document.getElementById("btn-next").addEventListener("click", goForward);
document.getElementById("btn-prev").addEventListener("click", goBackward);
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

/* ─────────────── Initialisation ─────────────── */

loadFresques();
// prépare la première partie de l'introduction (titre, mosaïque) sans l'afficher
if (introPartCount()) {
  const first = INTRO_PARTS[0];
  document.getElementById("intro-title").textContent = first.titre || "";
  document.getElementById("intro-subtitle").textContent = first.sousTitre || "";
  document.getElementById("intro-counter").textContent = `1 / ${introPartCount()}`;
  document.getElementById("btn-intro-prev").disabled = true;
}
