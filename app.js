(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
  }

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
      try {
        localStorage.setItem("arcade_" + k, JSON.stringify(v));
      } catch {}
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
    drive: {
      title: "My Drive - Google Drive",
      icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png"
    },
    docs: {
      title: "Document",
      icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico"
    }
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

  function games() {
    return window.CAMPUS_GAMES || [];
  }
  function apps() {
    return window.CAMPUS_APPS || [];
  }

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
    link.href =
      c.icon ||
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>";
    $$("#cloak-options .opt").forEach((b) =>
      b.classList.toggle("active", b.dataset.cloak === key)
    );
  }

  function setBg(name) {
    state.bg = name;
    store.set("bg", name);
    document.body.dataset.bg = name;
    $$("#bg-options .opt").forEach((b) =>
      b.classList.toggle("active", b.dataset.bg === name)
    );
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
    const clock = $("#clock");
    const greeting = $("#greeting");
    if (!clock || !greeting) return;
    const now = new Date();
    clock.textContent =
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");
    const hour = now.getHours();
    let greet = "good evening";
    if (hour < 12) greet = "good morning";
    else if (hour < 18) greet = "good afternoon";
    const days = [
      "sunday","monday","tuesday","wednesday","thursday","friday","saturday"
    ];
    const months = [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december"
    ];
    greeting.textContent =
      greet +
      " · " +
      days[now.getDay()] +
      " " +
      now.getDate() +
      " " +
      months[now.getMonth()];
  }

  function showPage(id) {
    if (!id) return;
    $$(".page").forEach((p) => p.classList.toggle("active", p.id === id));
    $$(".nav-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.page === id)
    );
  }

  function gameUrl(file) {
    const base = state.gamesPath.endsWith("/")
      ? state.gamesPath
      : state.gamesPath + "/";
    return base + file;
  }

  function proxied(url) {
    if (!url) return url;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    if (state.proxyBase) {
      const base = state.proxyBase.endsWith("/")
        ? state.proxyBase
        : state.proxyBase + "/";
      return base + encodeURIComponent(url);
    }
    return url;
  }

  function showFallback(title, msg, path) {
    const frame = $("#frame");
    const fb = $("#player-fallback");
    if (frame) frame.classList.add("hidden");
    if (fb) {
      fb.classList.remove("hidden");
      const t = $("#fallback-title");
      const m = $("#fallback-msg");
      const p = $("#fallback-path");
      if (t) t.textContent = title;
      if (m) m.textContent = msg;
      if (p) p.textContent = path || state.currentUrl || "";
    }
  }

  function hideFallback() {
    const frame = $("#frame");
    const fb = $("#player-fallback");
    if (fb) fb.classList.add("hidden");
    if (frame) frame.classList.remove("hidden");
  }

  async function urlLooksAvailable(url) {
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

  async function openPlayer(url, title, favKey, opts) {
    opts = opts || {};
    const local = !!opts.local;
    state.currentUrl = url;
    state.currentName = title || url;
    state.isLocalGame = local;

    const ply = $("#player");
    const titleEl = $("#player-title");
    const favBtn = $("#player-fav");
    if (titleEl) titleEl.textContent = state.currentName;
    if (ply) {
      ply.classList.remove("hidden");
      ply.style.display = "flex";
      ply.setAttribute("aria-hidden", "false");
    }
    const key = favKey || title;
    if (favBtn) {
      favBtn.textContent = state.favs.includes(key) ? "★" : "☆";
      favBtn.dataset.key = key;
    }

    if (title) {
      state.recent = [title, ...state.recent.filter((x) => x !== title)].slice(
        0,
        24
      );
      store.set("recent", state.recent);
    }

    if (!local && !state.proxyBase && /^https?:\/\//i.test(url)) {
      const frame = $("#frame");
      if (frame) frame.src = "about:blank";
      showFallback(
        "Opens in a new tab",
        "Most sites block being shown inside a page. Use the button below.",
        url
      );
      return;
    }

    if (local) {
      const ok = await urlLooksAvailable(url);
      if (!ok) {
        const frame = $("#frame");
        if (frame) frame.src = "about:blank";
        showFallback(
          "Game file not found",
          "Upload this file into your games/ folder, then refresh.",
          url
        );
        return;
      }
    }

    hideFallback();
    const frame = $("#frame");
    if (frame) frame.src = url;
  }

  function closePlayer() {
    const ply = $("#player");
    if (ply) {
      ply.classList.add("hidden");
      ply.style.display = "none";
      ply.setAttribute("aria-hidden", "true");
    }
    const frame = $("#frame");
    if (frame) frame.src = "about:blank";
    hideFallback();
  }

  function toggleFav(key) {
    if (!key) return;
    if (state.favs.includes(key))
      state.favs = state.favs.filter((x) => x !== key);
    else state.favs = [key, ...state.favs];
    store.set("favs", state.favs);
    const favBtn = $("#player-fav");
    if (favBtn) favBtn.textContent = state.favs.includes(key) ? "★" : "☆";
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
    if (state.sort === "az")
      list.sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === "za")
      list.sort((a, b) => b.name.localeCompare(a.name));
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
    const host = $("#letter-chips");
    if (!host) return;
    const letters = ["all"].concat(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    );
    host.innerHTML = letters
      .map(
        (l) =>
          '<button type="button" class="chip' +
          (state.letter === l ? " active" : "") +
          '" data-letter="' +
          l +
          '">' +
          (l === "all" ? "All" : l) +
          "</button>"
      )
      .join("");
  }

  function renderGames() {
    const grid = $("#games-grid");
    const count = $("#game-count");
    const empty = $("#games-empty");
    if (!grid) return;
    const list = filteredGames();
    if (count) count.textContent = String(list.length);
    if (empty) empty.classList.toggle("hidden", list.length > 0);
    grid.innerHTML = list
      .map((g) => {
        const fav = state.favs.includes(g.name);
        return (
          '<button type="button" class="game-card" data-file="' +
          g.file.replace(/"/g, "") +
          '" data-name="' +
          g.name.replace(/"/g, "&quot;") +
          '"><div class="thumb">▶<span class="fav-dot" data-fav="' +
          g.name.replace(/"/g, "&quot;") +
          '">' +
          (fav ? "★" : "☆") +
          '</span></div><div class="name">' +
          g.name.replace(/</g, "&lt;") +
          "</div></button>"
        );
      })
      .join("");
  }

  function renderApps() {
    const grid = $("#apps-grid");
    const quick = $("#quick-apps");
    const list = apps();
    if (grid) {
      grid.innerHTML = list
        .map(
          (a) =>
            '<button type="button" class="app-card" data-url="' +
            a.url +
            '" data-name="' +
            a.name.replace(/"/g, "&quot;") +
            '"><div class="thumb">' +
            (a.icon || "◎") +
            '</div><div class="name">' +
            a.name +
            '</div><div class="desc">' +
            (a.tag || "") +
            "</div></button>"
        )
        .join("");
    }
    if (quick) {
      quick.innerHTML = list
        .slice(0, 6)
        .map(
          (a) =>
            '<button type="button" class="quick" data-url="' +
            a.url +
            '" data-name="' +
            a.name.replace(/"/g, "&quot;") +
            '" title="' +
            a.name.replace(/"/g, "&quot;") +
            '">' +
            a.icon +
            "</button>"
        )
        .join("");
    }
  }

  function refreshStats() {
    const g = $("#stat-games");
    const f = $("#stat-favs");
    const m = $("#stat-msgs");
    if (g) g.textContent = String(games().length);
    if (f) f.textContent = String(state.favs.length);
    if (m) m.textContent = String(state.chat.length);
  }

  function doWebSearch(q) {
    const query = (q || "").trim();
    if (!query) return;
    state.searches = [query, ...state.searches.filter((x) => x !== query)].slice(
      0,
      12
    );
    store.set("searches", state.searches);
    renderRecentSearches();
    const url = engines[state.engine](query);
    openPlayer(proxied(url), query + " · " + state.engine);
  }

  function renderRecentSearches() {
    const el = $("#recent-searches");
    if (!el) return;
    if (!state.searches.length) {
      el.innerHTML = '<span class="muted small">Nothing yet</span>';
      return;
    }
    el.innerHTML = state.searches
      .map(
        (s) =>
          '<button type="button" class="chip" data-q="' +
          s.replace(/"/g, "&quot;") +
          '">' +
          s.replace(/</g, "&lt;") +
          "</button>"
      )
      .join("");
  }

  function handleOmni(raw) {
    const val = (raw || "").trim();
    if (!val) return;
    if (
      /^https?:\/\//i.test(val) ||
      (/^[^\s]+\.[^\s]+/.test(val) && val.indexOf(" ") === -1)
    ) {
      openPlayer(proxied(val), val);
      return;
    }
    const hit = games().find(
      (g) => g.name.toLowerCase() === val.toLowerCase()
    );
    if (hit) {
      openPlayer(gameUrl(hit.file), hit.name, hit.name, { local: true });
      return;
    }
    doWebSearch(val);
  }


  /* -------- Smart AI (Puter) + local fallback -------- */
  function trySolveMath(text) {
    let expr = text.trim();
    expr = expr.replace(/^(solve|calculate|what is|what's|compute)\s+/i, "");
    expr = expr.replace(/\?+$/, "").trim();
    expr = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**");
    if (!/^[\d\s+\-*/().,%*]+$/.test(expr)) {
      const m = text.match(
        /(-?\d+(?:\.\d+)?(?:\s*[\+\-\*\/xX×÷\^]\s*-?\d+(?:\.\d+)?)+)/
      );
      if (!m) return null;
      expr = m[1]
        .replace(/x/gi, "*")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**");
    }
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
    try {
      const result = Function('"use strict"; return (' + expr + ");")();
      if (typeof result !== "number" || !isFinite(result)) return null;
      return expr.replace(/\*\*/g, "^") + " = " + result;
    } catch {
      return null;
    }
  }

  function writeEssay(topic) {
    let tpc = topic.trim();
    tpc = tpc.replace(/^(write\s+)?(an?\s+)?essay\s+(about|on|regarding)\s+/i, "");
    tpc = tpc.replace(/^essay\s*:\s*/i, "").trim() || "this topic";
    const title = tpc.charAt(0).toUpperCase() + tpc.slice(1);
    return (
      "Title: " + title +
      "\n\nIntroduction\n" + title +
      " is worth understanding clearly. This short essay explains what it is, why it matters, and what someone can do next.\n\n" +
      "Body paragraph 1 — What it is\nAt its core, " + tpc +
      " involves the main ideas connected to the topic. Breaking it into smaller parts makes it easier to study.\n\n" +
      "Body paragraph 2 — Why it matters\n" + title +
      " matters because it can affect real decisions. Learning about it helps you form stronger opinions.\n\n" +
      "Body paragraph 3 — What to do\nA good next step is to learn a little more and explain it in your own words.\n\n" +
      "Conclusion\nIn short, " + tpc + " is worth paying attention to."
    );
  }

  function localAiReply(text) {
    const t = text.toLowerCase();
    if (/solve|calculate|what is|what's|\d\s*[\+\-\*\/x×÷^%()]/.test(t)) {
      const solved = trySolveMath(text);
      if (solved) return solved;
    }
    if (/essay|write about|paragraph about/.test(t)) return writeEssay(text);
    if (/fun fact|fact/.test(t))
      return facts[Math.floor(Math.random() * facts.length)];
    if (/joke|laugh|funny/.test(t))
      return jokes[Math.floor(Math.random() * jokes.length)];
    if (/game|play|bored/.test(t)) {
      const list = games();
      if (!list.length) return "Open the Games tab and pick anything.";
      const g = list[Math.floor(Math.random() * list.length)];
      return "Try " + g.name + " — open it from the Games tab.";
    }
    if (/hello|hi\b|hey/.test(t))
      return "Hey. Smart AI needs Puter (a free sign-in popup). If that is blocked, I can still do math, essays, jokes, and game ideas.";
    return "Smart mode needs Puter. If the popup was blocked, allow popups for this site, or try math / essay / joke requests offline.";
  }

  function setAiStatus(msg) {
    const el = $("#ai-status");
    if (el) el.textContent = msg;
  }

  function hasPuter() {
    return typeof window.puter !== "undefined" &&
      window.puter &&
      window.puter.ai &&
      typeof window.puter.ai.chat === "function";
  }

  function buildAiMessages(userText) {
    const system =
      "You are Arcade AI, a helpful, sharp assistant on a student games/hub website called Arcade. " +
      "Be clear, friendly, and practical. Use short paragraphs. Reason step by step when solving problems. " +
      "You can help with school questions, coding, creative writing, planning, explanations, and casual chat. " +
      "Do not claim to browse the live web unless you actually can. Keep answers useful and not overly long.";

    const msgs = [{ role: "system", content: system }];
    // include recent history for memory
    const history = state.aiLog.slice(-12);
    history.forEach(function (m) {
      if (m.role === "me") msgs.push({ role: "user", content: m.text });
      else if (m.role === "bot") msgs.push({ role: "assistant", content: m.text });
    });
    msgs.push({ role: "user", content: userText });
    return msgs;
  }

  async function smartAiReply(userText) {
    // Prefer real model via Puter
    if (hasPuter()) {
      try {
        setAiStatus("Thinking…");
        const messages = buildAiMessages(userText);
        // Puter accepts string or messages depending on version; try messages first
        let result;
        try {
          result = await window.puter.ai.chat(messages);
        } catch (e1) {
          // fallback: plain string prompt with context
          const prompt =
            "You are Arcade AI, a helpful assistant. Answer clearly and reason step by step when needed.\n\nUser: " +
            userText;
          result = await window.puter.ai.chat(prompt);
        }
        setAiStatus("Smart AI · Puter");
        if (result == null) return localAiReply(userText);
        if (typeof result === "string") return result;
        if (result.message && result.message.content) return String(result.message.content);
        if (result.content) return String(result.content);
        if (result.text) return String(result.text);
        return String(result);
      } catch (err) {
        console.warn("Puter AI error:", err);
        setAiStatus("Puter error · offline mode");
        return (
          localAiReply(userText) +
          "\n\n(Smart AI hit an error: " +
          (err && err.message ? err.message : "unknown") +
          ". Allow popups or try again.)"
        );
      }
    }
    setAiStatus("Offline mode · Puter not loaded");
    return localAiReply(userText);
  }

  function renderAi() {
    const log = $("#ai-log");
    if (!log) return;
    log.innerHTML = state.aiLog
      .map(function (m) {
        return (
          '<div class="bubble ' +
          (m.role === "me" ? "me" : "bot") +
          '"><span class="who">' +
          (m.role === "me" ? "You" : "AI") +
          "</span>" +
          escapeHtml(m.text) +
          "</div>"
        );
      })
      .join("");
    log.scrollTop = log.scrollHeight;
  }

  function pushAi(role, text) {
    state.aiLog.push({ role: role, text: text });
    state.aiLog = state.aiLog.slice(-40);
    store.set("aiLog", state.aiLog);
    renderAi();
  }

  var aiBusy = false;

  async function sendAi() {
    const input = $("#ai-input");
    if (!input || aiBusy) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    pushAi("me", text);
    aiBusy = true;
    const sendBtn = $("#ai-send");
    if (sendBtn) sendBtn.disabled = true;
    pushAi("bot", "…");
    try {
      const reply = await smartAiReply(text);
      // replace the temporary "…" bubble
      if (state.aiLog.length && state.aiLog[state.aiLog.length - 1].text === "…") {
        state.aiLog.pop();
      }
      pushAi("bot", reply || "No response.");
    } catch (err) {
      if (state.aiLog.length && state.aiLog[state.aiLog.length - 1].text === "…") {
        state.aiLog.pop();
      }
      pushAi("bot", "Something went wrong. " + (err && err.message ? err.message : ""));
    }
    aiBusy = false;
    if (sendBtn) sendBtn.disabled = false;
  }

  function renderChat() {
    const log = $("#chat-log");
    if (!log) return;
    log.innerHTML = state.chat
      .map(
        (m) =>
          '<div class="bubble ' +
          (m.nick === state.nick ? "me" : "them") +
          '"><span class="who">' +
          escapeHtml(m.nick) +
          " · " +
          m.time +
          "</span>" +
          escapeHtml(m.text) +
          "</div>"
      )
      .join("");
    log.scrollTop = log.scrollHeight;
    const c = $("#chat-count");
    if (c) c.textContent = state.chat.length + " messages";
    refreshStats();
  }

  function sendChat() {
    const input = $("#chat-input");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    const nick = (state.nick || "guest").slice(0, 16);
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    state.chat.push({ nick: nick, text: text, time: time });
    state.chat = state.chat.slice(-100);
    store.set("chat", state.chat);
    renderChat();
  }

  function bindSettings() {
    const nameEl = $("#set-name");
    const panicEl = $("#set-panic");
    const proxyEl = $("#set-proxy");
    const pathEl = $("#set-games-path");
    const motionEl = $("#set-motion");
    const nickEl = $("#chat-nick");
    const userEl = $("#username");
    const avEl = $("#avatar");

    if (nameEl) nameEl.value = state.name;
    if (panicEl) panicEl.value = state.panic;
    if (proxyEl) proxyEl.value = state.proxyBase;
    if (pathEl) pathEl.value = state.gamesPath;
    if (motionEl) motionEl.checked = state.motion;
    if (nickEl) nickEl.value = state.nick;
    if (userEl) userEl.textContent = state.name;
    if (avEl) avEl.textContent = (state.name[0] || "A").toUpperCase();

    on(nameEl, "change", function (e) {
      state.name = e.target.value.trim() || "arcade";
      store.set("name", state.name);
      if (userEl) userEl.textContent = state.name;
      if (avEl) avEl.textContent = state.name[0].toUpperCase();
    });
    on(panicEl, "change", function (e) {
      state.panic = e.target.value.trim() || "https://classroom.google.com";
      store.set("panic", state.panic);
    });
    on(proxyEl, "change", function (e) {
      state.proxyBase = e.target.value.trim();
      store.set("proxyBase", state.proxyBase);
    });
    on(pathEl, "change", function (e) {
      state.gamesPath = e.target.value.trim() || "games/";
      store.set("gamesPath", state.gamesPath);
    });
    on(motionEl, "change", function (e) {
      setMotion(e.target.checked);
    });
    on(nickEl, "change", function (e) {
      state.nick = e.target.value.trim() || "guest";
      store.set("nick", state.nick);
    });
    on($("#reset-data"), "click", function () {
      if (!confirm("Clear favorites, chat, AI history, and settings?")) return;
      Object.keys(localStorage)
        .filter(function (k) {
          return k.indexOf("arcade_") === 0;
        })
        .forEach(function (k) {
          localStorage.removeItem(k);
        });
      location.reload();
    });
  }

  function bindCore() {
    // Event delegation — survives re-renders, never dies mid-bind
    document.addEventListener("click", function (e) {
      const nav = e.target.closest(".nav-btn");
      if (nav && nav.dataset.page) {
        e.preventDefault();
        showPage(nav.dataset.page);
        return;
      }

      const bg = e.target.closest("[data-bg]");
      if (bg && bg.closest("#bg-options")) {
        setBg(bg.dataset.bg);
        return;
      }
      const cloak = e.target.closest("[data-cloak]");
      if (cloak && cloak.closest("#cloak-options")) {
        setCloak(cloak.dataset.cloak);
        return;
      }
      const eng = e.target.closest("[data-engine]");
      if (
        eng &&
        (eng.closest("#engine-options") || eng.closest("#set-engine-options"))
      ) {
        setEngine(eng.dataset.engine);
        return;
      }

      const letter = e.target.closest("[data-letter]");
      if (letter && letter.closest("#letter-chips")) {
        state.letter = letter.dataset.letter;
        renderLetterChips();
        renderGames();
        return;
      }

      const fav = e.target.closest("[data-fav]");
      if (fav) {
        e.preventDefault();
        e.stopPropagation();
        toggleFav(fav.dataset.fav);
        return;
      }

      const game = e.target.closest(".game-card");
      if (game && game.dataset.file) {
        openPlayer(gameUrl(game.dataset.file), game.dataset.name, game.dataset.name, {
          local: true
        });
        return;
      }

      const app = e.target.closest(".app-card, .quick");
      if (app && app.dataset.url) {
        openPlayer(proxied(app.dataset.url), app.dataset.name || app.dataset.url);
        return;
      }

      const rq = e.target.closest("#recent-searches [data-q]");
      if (rq) {
        doWebSearch(rq.dataset.q);
        return;
      }

      const prompt = e.target.closest("#ai-prompts [data-prompt]");
      if (prompt) {
        const input = $("#ai-input");
        if (input) input.value = prompt.dataset.prompt;
        sendAi();
        return;
      }

      if (e.target.closest("#player-back") || e.target.closest("#fallback-back")) {
        closePlayer();
        return;
      }
      if (e.target.closest("#player-reload")) {
        if (state.isLocalGame)
          openPlayer(state.currentUrl, state.currentName, state.currentName, {
            local: true
          });
        else openPlayer(state.currentUrl, state.currentName);
        return;
      }
      if (
        e.target.closest("#player-newtab") ||
        e.target.closest("#fallback-newtab")
      ) {
        if (state.currentUrl) window.open(state.currentUrl, "_blank");
        return;
      }
      if (e.target.closest("#player-fav")) {
        toggleFav(($("#player-fav") || {}).dataset.key);
        return;
      }
      if (e.target.closest("#ai-clear")) {
        state.aiLog = [];
        store.set("aiLog", []);
        renderAi();
        return;
      }
      if (e.target.closest("#chat-clear")) {
        state.chat = [];
        store.set("chat", []);
        renderChat();
        return;
      }
      if (e.target.closest("#ai-send") || e.target.closest("#ai-form button")) {
        e.preventDefault();
        sendAi();
        return;
      }
      if (e.target.closest("#chat-send") || e.target.closest("#chat-form button")) {
        e.preventDefault();
        sendChat();
        return;
      }
    });

    // Forms: always prevent full page reload
    on($("#home-search-form"), "submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      handleOmni(($("#home-search") || {}).value || "");
    });
    on($("#web-search-form"), "submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      doWebSearch(($("#web-search") || {}).value || "");
    });
    on($("#ai-form"), "submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      sendAi();
    });
    on($("#chat-form"), "submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      sendChat();
    });

    on($("#game-search"), "input", function (e) {
      state.query = e.target.value;
      renderGames();
    });
    on($("#game-sort"), "change", function (e) {
      state.sort = e.target.value;
      renderGames();
    });

    on($("#ai-input"), "keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendAi();
      }
    });
    on($("#chat-input"), "keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendChat();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "]") {
        window.location.href = state.panic || "https://classroom.google.com";
      }
      if (e.key === "Escape") closePlayer();
    });
  }

  function init() {
    try {
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
        pushAi(
          "bot",
          "Hey — I can chat, reason, help with homework, code, stories, and more. Ask anything. (First message may open a free Puter sign-in popup.)"
        );
      }
    } catch (err) {
      console.error("Arcade init error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
