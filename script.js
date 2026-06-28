const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const filterButtons = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".project-card");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("p");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const archiveGrid = document.querySelector("#archive-grid");
const albumNav = document.querySelector("#album-nav");

navToggle?.addEventListener("click", () => {
  const isOpen = header?.dataset.open === "true";
  header.dataset.open = String(!isOpen);
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "開啟導覽" : "關閉導覽");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.dataset.open = "false";
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "開啟導覽");
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    projectCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

function openLightbox(src, title, alt = "") {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;

  lightboxImage.src = src;
  lightboxImage.alt = alt;
  lightboxCaption.textContent = title || "";

  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  } else {
    lightbox.setAttribute("open", "");
  }
}

document.querySelectorAll(".project-image").forEach((button) => {
  button.addEventListener("click", () => {
    openLightbox(button.dataset.full, button.dataset.title, button.querySelector("img")?.alt || "");
  });
});

function albumInitialLimit(total = 0) {
  const visibleLimit = window.matchMedia("(max-width: 640px)").matches ? 3 : 4;
  return Math.min(total, visibleLimit);
}

function optimizedPhotoSrc(src = "") {
  const match = src.match(/^assets\/google-site\/(.+)\.(jpe?g|png)$/i);
  return match ? `assets/google-site/optimized/${match[1]}.webp` : src;
}

function buildArchive() {
  if (!archiveGrid || !Array.isArray(window.googleSitePhotos)) return;

  const fragment = document.createDocumentFragment();
  const albumNavFragment = document.createDocumentFragment();
  const albumOrder = [
    "設計亮點",
    "商業空間",
    "繽紛的童裝店",
    "韓風服飾及髮妝店",
    "展示藝術品的畫廊空間",
    "住宅空間",
    "天花板造型",
    "玄關空間",
    "客廳空間",
    "餐廳空間",
    "主次臥空間",
    "廚房及洗手間",
    "彩繪及造型",
  ];
  const albums = new Map();

  window.googleSitePhotos.forEach((photo) => {
    if (!albums.has(photo.title)) albums.set(photo.title, []);
    albums.get(photo.title).push(photo);
  });

  const sortedAlbums = [...albums.entries()].sort(([a], [b]) => {
    const indexA = albumOrder.indexOf(a);
    const indexB = albumOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  sortedAlbums.forEach(([title, photos]) => {
    const albumId = `album-${title.replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-|-$/g, "") || "photos"}`;
    const limit = albumInitialLimit(photos.length);
    const hasMore = photos.length > limit;

    const navLink = document.createElement("a");
    navLink.href = `#${albumId}`;
    navLink.textContent = title;
    albumNavFragment.append(navLink);

    const section = document.createElement("section");
    section.className = "archive-album";
    section.id = albumId;

    const head = document.createElement("div");
    head.className = "archive-album-head";
    const headText = document.createElement("div");
    const groupLabel = document.createElement("p");
    groupLabel.textContent = photos[0].group;
    const albumTitle = document.createElement("h3");
    albumTitle.textContent = title;
    headText.append(groupLabel, albumTitle);
    head.append(headText);

    const grid = document.createElement("div");
    grid.className = "archive-grid";

    photos.forEach((photo, index) => {
      const card = document.createElement("article");
      card.className = "archive-photo";
      if (hasMore && index >= limit) card.classList.add("is-hidden");

      const button = document.createElement("button");
      button.className = "archive-image";
      button.type = "button";
      button.dataset.full = photo.src;
      button.dataset.title = photo.caption || photo.title;

      const image = document.createElement("img");
      image.src = photo.thumb || optimizedPhotoSrc(photo.src);
      image.alt = photo.caption || `${photo.group} - ${photo.title}`;
      image.loading = "lazy";
      image.decoding = "async";

      const meta = document.createElement("div");
      meta.className = "archive-meta";
      if (photo.caption) {
        const caption = document.createElement("strong");
        caption.className = "archive-caption";
        caption.textContent = photo.caption;
        meta.append(caption);
      } else {
        const titleText = document.createElement("strong");
        titleText.textContent = photo.title;
        const groupText = document.createElement("span");
        groupText.textContent = photo.group;
        meta.append(titleText, groupText);
      }

      button.append(image);
      card.append(button, meta);
      grid.append(card);
    });

    section.append(head, grid);

    if (hasMore) {
      const toggle = document.createElement("button");
      toggle.className = "album-toggle";
      toggle.type = "button";
      toggle.dataset.expanded = "false";
      toggle.textContent = "查看更多作品";
      toggle.addEventListener("click", () => {
        const expanded = toggle.dataset.expanded === "true";
        section.querySelectorAll(".archive-photo").forEach((card, index) => {
          if (index >= limit) card.classList.toggle("is-hidden", expanded);
        });
        toggle.dataset.expanded = String(!expanded);
        toggle.textContent = expanded ? "查看更多作品" : "收合照片";
      });
      section.append(toggle);
    }

    fragment.append(section);
  });

  albumNav?.append(albumNavFragment);
  archiveGrid.append(fragment);
}

buildArchive();

archiveGrid?.addEventListener("click", (event) => {
  const button = event.target.closest(".archive-image");
  if (!button) return;
  openLightbox(button.dataset.full, button.dataset.title, button.querySelector("img")?.alt || "");
});

lightboxClose?.addEventListener("click", () => {
  lightbox?.close();
});

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.open) {
    lightbox.close();
  }
});
