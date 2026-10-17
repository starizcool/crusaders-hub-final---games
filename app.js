(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const store = {
    get(k, fb) {
      try {
        const v = localStorage.getItem("arcade_" + k);
        return v === null ? fb : JSON.parse(v);
      } catch {
        return fb;
      }
    },
    set(k, v) {
      localStorage.setItem("arcade_" + k, JSON.stringify(v));
    }
  };

  const engines = {
    google: (q) => "https://www.google.com/search?q=" + encodeURIComponent(q),
    bing: (q) => "https://www.bing.com/search?q=" + encodeURIComponent(q),
    duckduckgo: (q) => "https://duckduckgo.com/?q=" + encodeURIComponent(q),
    startpage: (q) => "https://www.startpage.com/sp/search?query=" + encodeURIComponent(q),
    brave: (q) => "https://search.brave.com/search?q=" + encodeURIComponent(q),
    youtube: (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q)
  };

  const state = {
    letter: "all",
    sort: "az",
    query: "",
    currentUrl: "",
    currentName: "",
    isLocalGame: false,
    favs: store.get("favs", []),
    recent: store.get("recent", []),
    searches: store.get("searches", []),
    chat: store.get("chat", []),
    aiLog: store.get("aiLog", []),
    name: store.get("name", "arcade"),
    nick: store.get("nick", "guest"),
    bg: store.get("bg", "mountain"),
    cloak: store.get("cloak", "none"),
    panic: store.get("panic", "https://classroom.google.com"),
    proxyBase: store.get("proxyBase", ""),
    gamesPath: store.get("gamesPath", "games/"),
    engine: store.get("engine", "google"),
    motion: store.get("motion", true)
  };

  const cloaks = {
    none: { title: "Arcade", icon: null },
    google: { title: "Google", icon: "https://www.google.com/favicon.ico" },
    classroom: { title: "Classes", icon: "https://ssl.gstatic.com/classroom/favicon.ico" },
    drive: { title: "My Drive - Google Drive", icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" },
    docs: { title: "Document", icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico" }
  };

  const facts = [
    "Octopuses have three hearts.",
    "A group of flamingos is called a flamboyance.",
    "Honey never spoils.",
    "Bananas are berries; strawberries aren't.",
    "Wombat poop is cube-shaped."
  ];
  const jokes = [
    "Why did the scarecrow get promoted? He was outstanding in his field.",
    "I told my computer I needed a break… it froze.",
    "Why don't skeletons fight each other? They don't have the guts."
  ];

  function games() { return window.CAMPUS_GAMES || []; }
  function apps() { return window.CAMPUS_APPS || []; }

  function setCloak(key) {
    state.cloak = key;
    store.set("cloak", key);
    const c = cloaks[key] || cloaks.none;
    document.title = c.title;
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = c.icon || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>";
    $$("#cloak-options .opt").forEach((b) => b.classList.toggle("active", b.dataset.cloak === key));
  }

  function setBg(name) {
    state.bg = name;
    store.set("bg", name);
    document.body.dataset.bg = name;
    $$("#bg-options .opt").forEach((b) => b.classList.toggle("active", b.dataset.bg === name));
  }

  function setMotion(on) {
    state.motion = on;
    store.set("motion", on);
    document.body.classList.toggle("no-motion", !on);
    const el = $("#set-motion");
    if (el) el.checked = on;
  }

  function setEngine(name) {
    if (!engines[name]) return;
    state.engine = name;
    store.set("engine", name);
    $$("#engine-options .opt, #set-engine-options .opt").forEach((b) =>
      b.classList.toggle("active", b.dataset.engine === name)
    );
  }

  function updateClock() {
    const now = new Date();
    $("#clock").textContent =
      String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const hour = now.getHours();
    let greet = "good evening";
    if (hour < 12) greet = "good morning";
    else if (hour < 18) greet = "good afternoon";
    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    $("#greeting").textContent = `${greet} · ${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
  }

  function showPage(id) {
    $$(".page").forEach((p) => p.classList.toggle("active", p.id === id));
    $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.page === id));
  }

  function gameUrl(file) {
    const base = state.gamesPath.endsWith("/") ? state.gamesPath : state.gamesPath + "/";
    return base + file;
  }

  function proxied(url) {
    if (!url) return url;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    if (state.proxyBase) {
      const base = state.proxyBase.endsWith("/") ? state.proxyBase : state.proxyBase + "/";
      return base + encodeURIComponent(url);
    }
    return url;
  }

  function showFallback(title, msg, path) {
    $("#frame").classList.add("hidden");
    $("#player-fallback").classList.remove("hidden");
    $("#fallback-title").textContent = title;
    $("#fallback-msg").textContent = msg;
    $("#fallback-path").textContent = path || state.currentUrl || "";
  }

  function hideFallback() {
    $("#player-fallback").classList.add("hidden");
    $("#frame").classList.remove("hidden");
  }

  async function urlLooksAvailable(url) {
    // Only useful for same-origin game files
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      return res.ok;
    } catch {
      try {
        const res = await fetch(url, { method: "GET", cache: "no-store" });
        return res.ok;
      } catch {
        return false;
      }
    }
  }

  async function openPlayer(url, title, favKey, opts = {}) {
    const local = !!opts.local;
    state.currentUrl = url;
    state.currentName = title || url;
    state.isLocalGame = local;
    $("#player-title").textContent = state.currentName;
    const ply = $("#player");
    ply.classList.remove("hidden");
    ply.style.display = "flex";
    ply.setAttribute("aria-hidden", "false");
    const key = favKey || title;
    $("#player-fav").textContent = state.favs.includes(key) ? "★" : "☆";
    $("#player-fav").dataset.key = key;

    if (title) {
      state.recent = [title, ...state.recent.filter((x) => x !== title)].slice(0, 24);
      store.set("recent", state.recent);
    }

    // External sites almost always block iframes → open in new tab instead
    if (!local && !state.proxyBase && /^https?:\/\//i.test(url)) {
      hideFallback();
      $("#frame").src = "about:blank";
      showFallback(
        "Opens in a new tab",
        "Most sites (YouTube, Google, Discord…) block being shown inside a page. Use the button below.",
        url
      );
      return;
    }

    if (local) {
      const ok = await urlLooksAvailable(url);
      if (!ok) {
        $("#frame").src = "about:blank";
        showFallback(
          "Game file not found",
          "Upload this file into your games folder on GitHub, then refresh.",
          url
        );
        return;
      }
    }

    hideFallback();
    $("#frame").src = url;

    // If iframe still fails to load after a moment, show help
    const frame = $("#frame");
    const token = String(Date.now());
    frame.dataset.token = token;
    setTimeout(() => {
      if (frame.dataset.token !== token) return;
      try {
        // cross-origin access throws; local missing often stays blank
        const doc = frame.contentDocument;
        if (local && doc && doc.location && doc.location.href === "about:blank") {
          showFallback("Game failed to load", "Check the filename matches games.js exactly.", url);
        }
      } catch {
        // cross-origin = probably loaded external content; fine if proxied
      }
    }, 1200);
  }

  function closePlayer() {
    const ply = $("#player");
    ply.classList.add("hidden");
    ply.style.display = "none";
    ply.setAttribute("aria-hidden", "true");
    $("#frame").src = "about:blank";
    hideFallback();
  }

  function toggleFav(key) {
    if (!key) return;
    if (state.favs.includes(key)) state.favs = state.favs.filter((x) => x !== key);
    else state.favs = [key, ...state.favs];
    store.set("favs", state.favs);
    $("#player-fav").textContent = state.favs.includes(key) ? "★" : "☆";
    refreshStats();
    renderGames();
  }

  function filteredGames() {
    let list = games().slice();
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }
    if (state.letter !== "all") {
      list = list.filter((g) => g.name[0].toUpperCase() === state.letter);
    }
    if (state.sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === "za") list.sort((a, b) => b.name.localeCompare(a.name));
    if (state.sort === "recent") {
      list.sort((a, b) => {
        const ia = state.recent.indexOf(a.name);
        const ib = state.recent.indexOf(b.name);
        if (ia === -1 && ib === -1) return a.name.localeCompare(b.name);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }
    if (state.sort === "fav") {
      list.sort((a, b) => {
        const fa = state.favs.includes(a.name) ? 0 : 1;
        const fb = state.favs.includes(b.name) ? 0 : 1;
        return fa - fb || a.name.localeCompare(b.name);
      });
    }
    return list;
  }

  function renderLetterChips() {
    const letters = ["all", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];
    $("#letter-chips").innerHTML = letters
      .map((l) => `<button type="button" class="chip ${state.letter === l ? "active" : ""}" data-letter="${l}">${l === "all" ? "All" : l}</button>`)
      .join("");
    $$("#letter-chips .chip").forEach((btn) => {
      btn.onclick = () => {
        state.letter = btn.dataset.letter;
        renderLetterChips();
        renderGames();
      };
    });
  }

  function renderGames() {
    const list = filteredGames();
    $("#game-count").textContent = String(list.length);
    $("#games-empty").classList.toggle("hidden", list.length > 0);
    $("#games-grid").innerHTML = list
      .map((g) => {
        const fav = state.favs.includes(g.name);
        return `<button type="button" class="game-card" data-file="${g.file}" data-name="${g.name}">
          <div class="thumb">▶<span class="fav-dot" data-fav="${g.name}">${fav ? "★" : "☆"}</span></div>
          <div class="name">${g.name}</div>
        </button>`;
      })
      .join("");
    $$("#games-grid .game-card").forEach((card) => {
      card.onclick = (e) => {
        if (e.target.closest("[data-fav]")) {
          e.stopPropagation();
          toggleFav(e.target.closest("[data-fav]").dataset.fav);
          return;
        }
        openPlayer(gameUrl(card.dataset.file), card.dataset.name, card.dataset.name, { local: true });
      };
    });
  }

  function renderApps() {
    $("#apps-grid").innerHTML = apps()
      .map(
        (a) => `<button type="button" class="app-card" data-url="${a.url}" data-name="${a.name}">
        <div class="thumb">${a.icon || "◎"}</div>
        <div class="name">${a.name}</div>
        <div class="desc">${a.tag || ""}</div>
      </button>`
      )
      .join("");
    $$("#apps-grid .app-card").forEach((card) => {
      card.onclick = () => openPlayer(proxied(card.dataset.url), card.dataset.name);
    });
    $("#quick-apps").innerHTML = apps()
      .slice(0, 6)
      .map((a) => `<button type="button" class="quick" data-url="${a.url}" data-name="${a.name}" title="${a.name}">${a.icon}</button>`)
      .join("");
    $$("#quick-apps .quick").forEach((b) => {
      b.onclick = () => openPlayer(proxied(b.dataset.url), b.dataset.name);
    });
  }

  function refreshStats() {
    $("#stat-games").textContent = String(games().length);
    $("#stat-favs").textContent = String(state.favs.length);
    $("#stat-msgs").textContent = String(state.chat.length);
  }

  function doWebSearch(q) {
    const query = (q || "").trim();
    if (!query) return;
    state.searches = [query, ...state.searches.filter((x) => x !== query)].slice(0, 12);
    store.set("searches", state.searches);
    renderRecentSearches();
    const url = engines[state.engine](query);
    openPlayer(proxied(url), query + " · " + state.engine);
  }

  function renderRecentSearches() {
    const el = $("#recent-searches");
    if (!el) return;
    if (!state.searches.length) {
      el.innerHTML = `<span class="muted small">Nothing yet</span>`;
      return;
    }
    el.innerHTML = state.searches
      .map((s) => `<button type="button" class="chip" data-q="${s.replace(/"/g, "&quot;")}">${s}</button>`)
      .join("");
    $$("#recent-searches .chip").forEach((b) => {
      b.onclick = () => doWebSearch(b.dataset.q);
    });
  }

  function handleOmni(raw) {
    const val = (raw || "").trim();
    if (!val) return;
    if (/^https?:\/\//i.test(val) || (/^[^\s]+\.[^\s]+/.test(val) && !val.includes(" "))) {
      openPlayer(proxied(val), val);
      return;
    }
    const hit = games().find((g) => g.name.toLowerCase() === val.toLowerCase());
    if (hit) {
      openPlayer(gameUrl(hit.file), hit.name, hit.name, { local: true });
      return;
    }
    doWebSearch(val);
  }

  /* -------- Math solver -------- */
  function trySolveMath(text) {
    let expr = text.trim();
    expr = expr.replace(/^(solve|calculate|what is|what's|compute)\s+/i, "");
    expr = expr.replace(/\?+$/, "").trim();
    expr = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**");
    // only allow safe math chars
    if (!/^[\d\s+\-*/().,%**]+$/.test(expr) && !/^[\d\s+\-*/().,%]+$/.test(expr)) {
      // try extracting a math-looking chunk
      const m = text.match(/(-?\d+(?:\.\d+)?(?:\s*[\+\-\*\/xX×÷\^]\s*-?\d+(?:\.\d+)?)+)/);
      if (!m) return null;
      expr = m[1].replace(/x/gi, "*").replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**");
    }
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr});`)();
      if (typeof result !== "number" || !isFinite(result)) return null;
      return `${expr.replace(/\*\*/g, "^")} = ${result}`;
    } catch {
      return null;
    }
  }

  /* -------- Essay writer -------- */
  function writeEssay(topic) {
    let t = topic.trim();
    t = t.replace(/^(write\s+)?(an?\s+)?essay\s+(about|on|regarding)\s+/i, "");
    t = t.replace(/^essay\s*:\s*/i, "").trim() || "this topic";
    const title = t.charAt(0).toUpperCase() + t.slice(1);
    return (
`Title: ${title}

Introduction
${title} is an important subject that shows up in everyday life and school work. Understanding it helps people make better choices and explain their ideas clearly. This essay gives a simple overview of what ${t} is, why it matters, and what people can do next.

Body paragraph 1 — What it is
At its core, ${t} is about the main ideas and facts connected to the topic. Breaking it into smaller parts makes it easier to study. Clear definitions and examples help readers stay interested and remember the key points.

Body paragraph 2 — Why it matters
${title} matters because it affects people, communities, or the world in real ways. When people ignore it, problems can grow. When people learn about it, they can solve issues, support others, or improve their own skills.

Body paragraph 3 — What to do
A good next step is to learn a little more, ask questions, and practice explaining the topic in your own words. Small actions — reading, discussing, or trying a related activity — build real understanding over time.

Conclusion
In short, ${t} is worth paying attention to. With a clear definition, strong reasons, and simple next steps, anyone can write and talk about it with more confidence.

(Tip: replace examples with your own facts and sources for a graded assignment.)`
    );
  }

  function aiReply(text) {
    const t = text.toLowerCase();

    // Math first
    if (/solve|calculate|what is|what's|\d\s*[\+\-\*\/x×÷^%()]/.test(t)) {
      const solved = trySolveMath(text);
      if (solved) return solved;
    }

    // Essay
    if (/essay|write about|paragraph about/.test(t)) {
      return writeEssay(text);
    }

    if (/fun fact|fact/.test(t)) return facts[Math.floor(Math.random() * facts.length)];
    if (/joke|laugh|funny/.test(t)) return jokes[Math.floor(Math.random() * jokes.length)];
    if (/game|play|bored/.test(t)) {
      const g = games()[Math.floor(Math.random() * Math.max(games().length, 1))];
      return g ? `Try ${g.name} — open it from the Games tab.` : "Open the Games tab and pick anything.";
    }
    if (/hello|hi\b|hey/.test(t)) {
      return "Hey. I can solve math (try 12*(5+3)), write a short essay, tell a joke, or suggest a game.";
    }
    if (/help|what can/.test(t)) {
      return "Try:\n• Math: solve 25*4+10\n• Essay: write an essay about space\n• Joke / fun fact / game idea\nFor full AI chat, open ChatGPT from Apps.";
    }
    return "Try a math problem (like 15/3+2), “write an essay about …”, a joke, or a game idea.";
  }

  function renderAi() {
    const log = $("#ai-log");
    log.innerHTML = state.aiLog
      .map((m) => `<div class="bubble ${m.role === "me" ? "me" : "bot"}"><span class="who">${m.role === "me" ? "You" : "AI"}</span>${escapeHtml(m.text)}</div>`)
      .join("");
    log.scrollTop = log.scrollHeight;
  }

  function pushAi(role, text) {
    state.aiLog.push({ role, text });
    state.aiLog = state.aiLog.slice(-40);
    store.set("aiLog", state.aiLog);
    renderAi();
  }

  function renderChat() {
    const log = $("#chat-log");
    log.innerHTML = state.chat
      .map((m) => `<div class="bubble ${m.nick === state.nick ? "me" : "them"}"><span class="who">${escapeHtml(m.nick)} · ${m.time}</span>${escapeHtml(m.text)}</div>`)
      .join("");
    log.scrollTop = log.scrollHeight;
    $("#chat-count").textContent = state.chat.length + " messages";
    refreshStats();
  }

  function pushChat(text) {
    const nick = (state.nick || "guest").slice(0, 16);
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    state.chat.push({ nick, text, time });
    state.chat = state.chat.slice(-100);
    store.set("chat", state.chat);
    renderChat();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bindSettings() {
    $("#set-name").value = state.name;
    $("#set-panic").value = state.panic;
    $("#set-proxy").value = state.proxyBase;
    $("#set-games-path").value = state.gamesPath;
    $("#set-motion").checked = state.motion;
    $("#chat-nick").value = state.nick;
    $("#username").textContent = state.name;
    $("#avatar").textContent = (state.name[0] || "A").toUpperCase();

    $("#set-name").onchange = (e) => {
      state.name = e.target.value.trim() || "arcade";
      store.set("name", state.name);
      $("#username").textContent = state.name;
      $("#avatar").textContent = state.name[0].toUpperCase();
    };
    $("#set-panic").onchange = (e) => {
      state.panic = e.target.value.trim() || "https://classroom.google.com";
      store.set("panic", state.panic);
    };
    $("#set-proxy").onchange = (e) => {
      state.proxyBase = e.target.value.trim();
      store.set("proxyBase", state.proxyBase);
    };
    $("#set-games-path").onchange = (e) => {
      state.gamesPath = e.target.value.trim() || "games/";
      store.set("gamesPath", state.gamesPath);
    };
    $("#set-motion").onchange = (e) => setMotion(e.target.checked);
    $("#chat-nick").onchange = (e) => {
      state.nick = e.target.value.trim() || "guest";
      store.set("nick", state.nick);
    };

    $$("#bg-options .opt").forEach((b) => (b.onclick = () => setBg(b.dataset.bg)));
    $$("#cloak-options .opt").forEach((b) => (b.onclick = () => setCloak(b.dataset.cloak)));
    $$("#engine-options .opt, #set-engine-options .opt").forEach((b) => (b.onclick = () => setEngine(b.dataset.engine)));

    $("#reset-data").onclick = () => {
      if (!confirm("Clear favorites, chat, AI history, and settings?")) return;
      Object.keys(localStorage).filter((k) => k.startsWith("arcade_")).forEach((k) => localStorage.removeItem(k));
      location.reload();
    };
  }

  function bindCore() {
    $$(".nav-btn").forEach((b) => (b.onclick = () => showPage(b.dataset.page)));

    $("#home-search-form").onsubmit = (e) => {
      e.preventDefault();
      handleOmni($("#home-search").value);
    };
    $("#web-search-form").onsubmit = (e) => {
      e.preventDefault();
      doWebSearch($("#web-search").value);
    };
    $("#game-search").oninput = (e) => {
      state.query = e.target.value;
      renderGames();
    };
    $("#game-sort").onchange = (e) => {
      state.sort = e.target.value;
      renderGames();
    };

    $("#player-back").onclick = closePlayer;
    $("#player-reload").onclick = () => {
      if (state.isLocalGame) openPlayer(state.currentUrl, state.currentName, state.currentName, { local: true });
      else openPlayer(state.currentUrl, state.currentName);
    };
    $("#player-newtab").onclick = () => window.open(state.currentUrl, "_blank");
    $("#player-fav").onclick = () => toggleFav($("#player-fav").dataset.key);
    $("#fallback-newtab").onclick = () => window.open(state.currentUrl, "_blank");
    $("#fallback-back").onclick = closePlayer;

    $("#ai-form").onsubmit = (e) => {
      e.preventDefault();
      const text = $("#ai-input").value.trim();
      if (!text) return;
      $("#ai-input").value = "";
      pushAi("me", text);
      setTimeout(() => pushAi("bot", aiReply(text)), 220);
    };
    $("#ai-clear").onclick = () => {
      state.aiLog = [];
      store.set("aiLog", []);
      renderAi();
    };
    $$("#ai-prompts .chip").forEach((b) => {
      b.onclick = () => {
        pushAi("me", b.dataset.prompt);
        setTimeout(() => pushAi("bot", aiReply(b.dataset.prompt)), 220);
      };
    });

    $("#chat-form").onsubmit = (e) => {
      e.preventDefault();
      const text = $("#chat-input").value.trim();
      if (!text) return;
      $("#chat-input").value = "";
      pushChat(text);
    };
    $("#chat-clear").onclick = () => {
      state.chat = [];
      store.set("chat", []);
      renderChat();
    };

    document.addEventListener("keydown", (e) => {
      if (e.key === "]") window.location.href = state.panic || "https://classroom.google.com";
      if (e.key === "Escape" && !$("#player").classList.contains("hidden")) closePlayer();
    });
  }

  function init() {
    // Always start with player closed so nothing blocks clicks
    closePlayer();
    setBg(state.bg);
    setCloak(state.cloak);
    setMotion(state.motion);
    setEngine(state.engine);
    updateClock();
    setInterval(updateClock, 1000);
    bindCore();
    bindSettings();
    renderLetterChips();
    renderGames();
    renderApps();
    renderRecentSearches();
    renderAi();
    renderChat();
    refreshStats();
    if (!state.aiLog.length) {
      pushAi("bot", "Hey. Try math (12*(5+3)), write an essay about a topic, a joke, or a game idea.");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
