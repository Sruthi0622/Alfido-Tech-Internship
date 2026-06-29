/* ===================================================================
   Netflix Clone — interactions
   - renders rows from data model (no API needed)
   - navbar scroll effect, mobile menu, search toggle
   - horizontal scrolling rows with arrow controls
   - scroll-reveal for rows via IntersectionObserver
   - live search filtering across all rows
   - click-to-open detail modal
   =================================================================== */

(() => {
  "use strict";

  /* ---------------------------------------------------------------
     1. DATA
  --------------------------------------------------------------- */
  const GENRE_POOL = ["Sci-Fi","Thriller","Drama","Fantasy","Crime","Mystery","Action","Comedy","Horror","Romance"];
  const RATINGS    = ["PG","13+","16+","18+"];
  const DURATIONS_SERIES = ["1 Season","2 Seasons","3 Seasons","4 Seasons"];
  const DURATIONS_FILM   = ["1h 42m","1h 55m","2h 05m","2h 18m"];

  const TITLES = [
    "Stranger Things","Wednesday","Money Heist","Dark",
    "Squid Game","The Witcher","Lucifer","You",
    "Peaky Blinders","The Crown","Breaking Bad","Narcos",
    "All of Us Are Dead","The Night Agent","1899","Alice in Borderland",
    "One Piece","Outer Banks","Manifest","Black Mirror",
    "Ozark","Dark Tourist","Mindhunter","Bridgerton"
  ];

  const SYNOPSES = [
    "When a boy vanishes, his friends uncover government experiments, supernatural forces and a girl with extraordinary powers.",
    "After years apart, siblings reunite to settle a family debt that runs deeper than money.",
    "A cartographer mapping a vanishing coastline discovers something that should not exist.",
    "An encrypted broadcast resurfaces every decade — always one hour before disaster strikes.",
    "Desperate people compete in deadly children's games for a life-changing prize.",
    "A monster hunter navigates a world where humans are often more monstrous than beasts.",
    "A fallen angel reinvents himself as a nightclub owner and LAPD consultant in Los Angeles.",
    "A charming bookstore manager will go to any lengths to be with the woman he loves.",
    "A small-time gangster rises through the criminal underworld of 1920s Birmingham.",
    "The reign of Queen Elizabeth II across the decades of her rule.",
    "A chemistry teacher turned drug kingpin partners with a former student to build an empire.",
    "The thrilling story of Pablo Escobar and the Medellín Cartel.",
    "After a virus turns students into zombies, survivors must find a way out of a quarantined school.",
    "A Secret Service agent uncovers a conspiracy that puts the president's life at risk.",
    "Passengers on a 19th-century ship travelling to America begin to have strange hallucinations.",
    "A man from the real world wakes up in a deadly game and must play to survive."
  ];

  function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  }

  function seededRandom(seed) {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function buildItem(title, index) {
    const rnd = seededRandom(title.length * 31 + index * 7 + 1);
    const isSeries = rnd() > 0.45;
    return {
      title,
      letter: title[0].toUpperCase(),
      posterClass: `poster-${index % 8}`,
      match:    80 + Math.floor(rnd() * 18),
      rating:   RATINGS[Math.floor(rnd() * RATINGS.length)],
      duration: isSeries
        ? DURATIONS_SERIES[Math.floor(rnd() * DURATIONS_SERIES.length)]
        : DURATIONS_FILM[Math.floor(rnd() * DURATIONS_FILM.length)],
      year:   2020 + Math.floor(rnd() * 6),
      genres: [
        GENRE_POOL[Math.floor(rnd() * GENRE_POOL.length)],
        GENRE_POOL[Math.floor(rnd() * GENRE_POOL.length)]
      ],
      desc:     SYNOPSES[Math.floor(rnd() * SYNOPSES.length)],
      progress: 0,
      posterUrl: `https://picsum.photos/seed/${slugify(title)}/400/225`
    };
  }

  function rowOf(titles, offset) {
    return titles.map((t, i) => buildItem(t, i + offset));
  }

  const ROWS = {
    "continue-watching": rowOf(TITLES.slice(0, 5), 0).map((it, i) => ({ ...it, progress: [72,35,90,18,55][i] })),
    "trending":  rowOf(TITLES.slice(2, 10), 2),
    "popular":   rowOf([...TITLES.slice(10, 16), ...TITLES.slice(0, 2)], 10),
    "tv":        rowOf(TITLES.slice(4, 12), 4),
    "scifi":     rowOf([...TITLES.slice(14, 20), ...TITLES.slice(2, 4)], 14),
    "acclaimed": rowOf(TITLES.slice(16, 23), 16)
  };

  /* ---------------------------------------------------------------
     2. RENDER CARDS
  --------------------------------------------------------------- */
  function cardTemplate(item) {
    const li = document.createElement("li");
    li.className  = "card";
    li.tabIndex   = 0;
    li.dataset.title = item.title;

    const progressBar = item.progress
      ? `<div class="card__progress"><span style="width:${item.progress}%"></span></div>`
      : "";

    li.innerHTML = `
      <div class="card__poster ${item.posterClass}">
        <img class="card__poster-img"
             src="${item.posterUrl}"
             alt="${item.title}"
             loading="lazy"
             decoding="async">
        <div class="card__label">${item.title}</div>
        ${progressBar}
      </div>
      <div class="card__info">
        <div class="card__info-actions">
          <button class="play" aria-label="Play ${item.title}">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button aria-label="Add ${item.title} to My List">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <button aria-label="Like ${item.title}">
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 11v9H4v-9h3Zm0 0 3.5-7c.4-.8 1.6-.5 1.5.4l-.6 4.6H17a2 2 0 0 1 2 2.3l-1 5.7a2 2 0 0 1-2 1.6H7" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <div class="card__info-title">${item.title}</div>
        <div class="card__info-meta">
          <span class="match">${item.match}% Match</span>
          <span>${item.year}</span>
          <span class="tag">${item.rating}</span>
          <span>${item.duration}</span>
        </div>
        <div class="card__info-genres">${item.genres.join(" · ")}</div>
      </div>
    `;

    li.addEventListener("click",   ()  => openModal(item));
    li.addEventListener("keydown", (e) => { if (e.key === "Enter") openModal(item); });
    return li;
  }

  function renderRows() {
    document.querySelectorAll("[data-row]").forEach((rowEl) => {
      const data = ROWS[rowEl.id];
      if (!data) return;
      const track = rowEl.querySelector(".row__track");
      data.forEach((item) => track.appendChild(cardTemplate(item)));
    });
  }

  /* ---------------------------------------------------------------
     3. SEARCH / FILTER  (module-level so initSearch can call it)
  --------------------------------------------------------------- */
  function filterCatalogue(rawQuery) {
    const query = rawQuery.trim().toLowerCase();
    let anyVisible = false;

    document.querySelectorAll(".row").forEach((rowEl) => {
      let matches = 0;
      rowEl.querySelectorAll(".card").forEach((card) => {
        const hit = !query || card.dataset.title.toLowerCase().includes(query);
        card.hidden = !hit;
        if (hit) matches++;
      });
      const show = query === "" || matches > 0;
      rowEl.classList.toggle("row--hidden", !show);
      if (show) anyVisible = true;
    });

    const noResults = document.getElementById("noResults");
    if (noResults) noResults.hidden = query === "" || anyVisible;
  }

  /* ---------------------------------------------------------------
     4. NAVBAR SCROLL EFFECT
  --------------------------------------------------------------- */
  function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------
     5. MOBILE MENU
  --------------------------------------------------------------- */
  function initMobileMenu() {
    const btn   = document.getElementById("hamburgerBtn");
    const links = document.getElementById("navLinks");
    btn.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      btn.classList.toggle("open", isOpen);
      btn.setAttribute("aria-expanded", String(isOpen));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        btn.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------------------------------------------------------------
     6. SEARCH TOGGLE + LIVE FILTER
  --------------------------------------------------------------- */
  function initSearch() {
    const wrap  = document.getElementById("searchWrap");
    const btn   = document.getElementById("searchBtn");
    const input = document.getElementById("searchInput");

    // live filter on every keystroke
    input.addEventListener("input", (e) => filterCatalogue(e.target.value));

    // toggle open/close
    btn.addEventListener("click", () => {
      wrap.classList.toggle("open");
      if (wrap.classList.contains("open")) input.focus();
    });

    // close when clicking outside
    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) wrap.classList.remove("open");
    });
  }

  /* ---------------------------------------------------------------
     7. HORIZONTAL SCROLL ARROWS
  --------------------------------------------------------------- */
  function initRowArrows() {
    document.querySelectorAll(".row__viewport").forEach((vp) => {
      const track = vp.querySelector(".row__track");
      const left  = vp.querySelector(".row__arrow--left");
      const right = vp.querySelector(".row__arrow--right");
      const step  = () => Math.max(track.clientWidth * 0.85, 300);
      left.addEventListener("click",  () => track.scrollBy({ left: -step(), behavior: "smooth" }));
      right.addEventListener("click", () => track.scrollBy({ left:  step(), behavior: "smooth" }));
    });
  }

  /* ---------------------------------------------------------------
     8. SCROLL-REVEAL FOR ROWS
  --------------------------------------------------------------- */
  function initRowReveal() {
    const rows = document.querySelectorAll(".row");
    if (!("IntersectionObserver" in window)) {
      rows.forEach((r) => r.classList.add("in-view"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in-view"); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    rows.forEach((r) => obs.observe(r));
  }

  /* ---------------------------------------------------------------
     9. DETAIL MODAL
  --------------------------------------------------------------- */
  let lastFocused = null;

  function openModal(item) {
    const modal = document.getElementById("detailModal");
    document.getElementById("modalBannerLetter").textContent    = item.letter;
    document.getElementById("modalBanner").className            = `modal__banner ${item.posterClass}`;
    document.getElementById("modalTitle").textContent           = item.title;
    document.getElementById("modalMatch").textContent           = `${item.match}% Match`;
    document.getElementById("modalYear").textContent            = item.year;
    document.getElementById("modalRating").textContent          = item.rating;
    document.getElementById("modalDuration").textContent        = item.duration;
    document.getElementById("modalDesc").textContent            = item.desc;
    document.getElementById("modalGenres").textContent          = item.genres.join(" · ");

    // show poster image in modal banner if available
    const bannerEl = document.getElementById("modalBanner");
    let bannerImg = bannerEl.querySelector(".modal__banner-img");
    if (!bannerImg) {
      bannerImg = document.createElement("img");
      bannerImg.className = "modal__banner-img";
      bannerEl.insertBefore(bannerImg, bannerEl.firstChild);
    }
    bannerImg.src = item.posterUrl || `https://picsum.photos/seed/${slugify(item.title)}/700/280`;
    bannerImg.alt = item.title;

    lastFocused = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("modalClose").focus();
  }

  function closeModal() {
    const modal = document.getElementById("detailModal");
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function initModal() {
    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modalBackdrop").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("detailModal").classList.contains("open")) closeModal();
    });

    // Hero "More Info" button
    document.getElementById("heroInfoBtn").addEventListener("click", () => {
      openModal({
        title:      "Stranger Things",
        letter:     "S",
        posterClass:"poster-1",
        posterUrl:  "https://picsum.photos/seed/stranger-things/700/280",
        match:      98,
        year:       2022,
        rating:     "16+",
        duration:   "4 Seasons",
        desc:       "When a boy vanishes, his friends uncover government experiments, supernatural forces and a girl with extraordinary powers.",
        genres:     ["Sci-Fi", "Thriller"]
      });
    });
  }

  /* ---------------------------------------------------------------
     10. TOAST + PLAY BUTTONS
  --------------------------------------------------------------- */
  function showToast(text) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.style.cssText = [
        "position:fixed","left:50%","bottom:32px",
        "transform:translateX(-50%) translateY(20px)",
        "background:#fff","color:#000","padding:12px 20px",
        "border-radius:6px","font-weight:600","font-size:14px",
        "z-index:9999","opacity:0","transition:opacity .25s,transform .25s",
        "pointer-events:none","white-space:nowrap"
      ].join(";");
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    requestAnimationFrame(() => {
      toast.style.opacity    = "1";
      toast.style.transform  = "translateX(-50%) translateY(0)";
    });
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toast.style.opacity   = "0";
      toast.style.transform = "translateX(-50%) translateY(20px)";
    }, 2000);
  }

  function initPlayButtons() {
    document.getElementById("heroPlayBtn").addEventListener("click", () =>
      showToast("▶ Playing Stranger Things…")
    );
    document.addEventListener("click", (e) => {
      const playBtn = e.target.closest(".card__info-actions .play");
      if (playBtn) {
        e.stopPropagation();
        const title = playBtn.closest(".card").dataset.title;
        showToast(`▶ Playing ${title}…`);
      }
    });
  }

  /* ---------------------------------------------------------------
     INIT
  --------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderRows();
    initNavbarScroll();
    initMobileMenu();
    initSearch();
    initRowArrows();
    initRowReveal();
    initModal();
    initPlayButtons();
  });

})();