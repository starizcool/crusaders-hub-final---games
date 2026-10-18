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
    motion: store.get("motion", true),
    aiKey: store.get("aiKey", ""),
    aiUrl: store.get("aiUrl", "https://api.groq.com/openai/v1/chat/completions"),
    aiModel: store.get("aiModel", "llama-3.3-70b-versatile")
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





  /* -------- Fully local AI (pattern library) -------- */
  function trySolveMath(text) {
    let expr = text.trim();
    expr = expr.replace(/^(solve|calculate|what is|what's|compute|eval)\s+/i, "");
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
    } catch (e) {
      return null;
    }
  }

  function writeEssay(topic) {
    let tpc = topic.trim();
    tpc = tpc.replace(/^(write\s+)?(an?\s+)?(short\s+)?essay\s+(about|on|regarding)\s+/i, "");
    tpc = tpc.replace(/^essay\s*:\s*/i, "").trim() || "this topic";
    const title = tpc.charAt(0).toUpperCase() + tpc.slice(1);
    return (
      "Title: " + title + "\n\n" +
      "Introduction\n" + title +
      " shows up in daily life, school, and media. Understanding it helps you explain ideas clearly and make better choices. This essay covers what it is, why it matters, and practical next steps.\n\n" +
      "What it is\nAt a basic level, " + tpc +
      " is a set of related ideas and facts. Breaking it into smaller pieces — definition, examples, and common misunderstandings — makes it easier to learn and teach.\n\n" +
      "Why it matters\n" + title +
      " matters because it affects how people think, act, or solve problems. Ignoring it can lead to confusion; learning it can improve school work, conversations, and decisions.\n\n" +
      "Examples and details\nReal examples help. Connect " + tpc +
      " to something you already know: a class topic, a game mechanic, a news story, or a personal habit. Concrete details stick better than vague claims.\n\n" +
      "What to do next\nSummarize the idea in two sentences in your own words. Then find one reliable source and one counterpoint. That habit builds stronger understanding than memorizing a single definition.\n\n" +
      "Conclusion\n" + title +
      " is worth learning carefully. With a clear definition, solid reasons, and simple next steps, you can write and talk about it with more confidence.\n\n" +
      "(Add your own facts and sources if this is for a grade.)"
    );
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function localAiReply(text) {
    const raw = (text || "").trim();
    if (!raw) return "Say something and I’ll reply.";
    const t = raw.toLowerCase();

    // Math first
    const math = trySolveMath(raw);
    if (math) return math;
    if (/\b(square root|sqrt)\b/.test(t)) {
      const m = t.match(/(?:square root|sqrt)\s*(?:of\s*)?(\d+(?:\.\d+)?)/);
      if (m) {
        const n = parseFloat(m[1]);
        return "√" + n + " ≈ " + Math.sqrt(n);
      }
    }
    if (/\bpercent\b|\b% of\b/.test(t)) {
      const m = t.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/);
      if (m) {
        const a = parseFloat(m[1]);
        const b = parseFloat(m[2]);
        return a + "% of " + b + " = " + (a / 100) * b;
      }
    }

    // Essays / writing
    if (/\b(essay|paragraph|write about|write me a|draft)\b/.test(t))
      return writeEssay(raw);
    if (/\b(summary|summarize|tldr|tl;dr)\b/.test(t)) {
      const topic = raw.replace(/.*\b(?:summary|summarize|tldr|tl;dr)\b(?:\s+of)?\s*/i, "").trim() || "that topic";
      return (
        "Quick summary of " + topic + ":\n" +
        "• Core idea: the main point in one sentence.\n" +
        "• Why it matters: who is affected and how.\n" +
        "• Key detail: one concrete fact or example.\n" +
        "• Takeaway: what someone should remember.\n\n" +
        "Fill each bullet with your own notes for a stronger summary."
      );
    }
    if (/\b(email|cover letter)\b/.test(t)) {
      return (
        "Simple email template:\n\n" +
        "Subject: [clear purpose]\n\n" +
        "Hi [Name],\n\n" +
        "I’m writing because [reason in one sentence].\n" +
        "[1–2 sentences of detail].\n" +
        "Could you [specific ask]?\n\n" +
        "Thanks,\n[Your name]"
      );
    }

    // Greetings / small talk
    if (/^(hi|hello|hey|yo|sup|hiya)\b/.test(t))
      return pick([
        "Hey! Ask me almost anything — school, games, code basics, writing, or random facts.",
        "Hi. What do you need — homework help, a game idea, or just a chat?",
        "Hello. I’m fully local on this site. Try a question or say “help”."
      ]);
    if (/how are you|how's it going|how are u/.test(t))
      return pick([
        "All good — running in your browser. What are you working on?",
        "Solid. Point me at a problem and I’ll try to help."
      ]);
    if (/who are you|what are you|your name/.test(t))
      return "I’m Arcade AI — a local helper built into this site. No account, no cloud. I pattern-match lots of common questions (math, writing, school, games, coding basics, life advice).";
    if (/thank|thanks|thx|ty\b/.test(t))
      return pick(["You’re welcome.", "Anytime.", "Glad it helped."]);
    if (/bye|goodbye|see ya|cya|later\b/.test(t))
      return pick(["Later.", "See you.", "Bye — good luck."]);
    if (/good morning/.test(t)) return "Good morning. What’s on the plan today?";
    if (/good afternoon/.test(t)) return "Good afternoon. What do you need?";
    if (/good night|goodnight/.test(t)) return "Good night. Rest up.";
    if (/i'?m bored|im bored|bored/.test(t)) {
      const list = games();
      const g = list.length ? list[Math.floor(Math.random() * list.length)].name : "a game from the Games tab";
      return pick([
        "Try " + g + ", or ask me for a riddle / writing prompt.",
        "Challenge: beat one game, then tell me your score. Or ask for a random project idea.",
        "Bored fix: 10-minute focus timer mindset — one task only — or open " + g + "."
      ]);
    }
    if (/i'?m sad|im sad|depressed|feeling down/.test(t))
      return "Sorry you’re feeling low. I’m just a local script, not a counselor — if things are heavy, talk to someone you trust or a helpline. For a lighter reset: short walk, water, one song, or a chill game.";
    if (/i'?m stressed|im stressed|anxious|anxiety/.test(t))
      return "Stress is real. Try: 4-second inhale, 4 hold, 6 exhale × 5. Then pick the single next tiny step (one message, one problem, one save point). You don’t have to finish everything at once.";

    // Help
    if (/^(help|commands|what can you do|how do you work)\b/.test(t) || t === "help")
      return (
        "Local skills:\n" +
        "• Math — “solve 12*(5+3)” or “20% of 50”\n" +
        "• Essays / paragraphs — “essay about climate change”\n" +
        "• Summaries — “summarize photosynthesis”\n" +
        "• Study tips, coding basics, definitions\n" +
        "• Game suggestions from your library\n" +
        "• Jokes, facts, riddles, writing prompts\n" +
        "• Simple life / school advice\n\n" +
        "I’m not a full cloud model — short, useful answers work best."
      );

    // Games
    if (/\b(game|games|play something|recommend a game|what should i play)\b/.test(t)) {
      const list = games();
      if (!list.length) return "Upload games into the games/ folder, then ask again.";
      const picks = [];
      for (let i = 0; i < 3 && i < list.length; i++) {
        picks.push(list[Math.floor(Math.random() * list.length)].name);
      }
      return "From your library, try:\n• " + picks.join("\n• ") + "\n\nOpen the Games tab and search the name.";
    }

    // Facts / jokes / riddles
    if (/\b(fun fact|random fact|tell me a fact)\b/.test(t))
      return pick(facts.concat([
        "Octopuses have three hearts and blue blood.",
        "Bananas are berries; strawberries are not.",
        "A day on Venus is longer than a year on Venus.",
        "Sharks existed before trees.",
        "Your stomach gets a new lining about every few days.",
        "There are more possible chess games than atoms in the observable universe.",
        "Honey found in ancient tombs was still edible.",
        "Wombat poop is cube-shaped.",
        "The Eiffel Tower can grow ~6 inches in summer heat.",
        "A group of flamingos is called a flamboyance."
      ]));
    if (/\b(joke|make me laugh|funny)\b/.test(t))
      return pick(jokes.concat([
        "Why did the computer show up at lunch? It had a hard drive.",
        "I told my Wi‑Fi we needed space. It said “no signal.”",
        "Why don’t scientists trust atoms? They make up everything.",
        "Parallel lines have so much in common. It’s a shame they’ll never meet.",
        "I would tell you a UDP joke, but you might not get it."
      ]));
    if (/\b(riddle)\b/.test(t))
      return pick([
        "What has keys but can’t open locks? → A piano.",
        "What gets wetter the more it dries? → A towel.",
        "I speak without a mouth and hear without ears. What am I? → An echo.",
        "What has to be broken before you can use it? → An egg.",
        "What goes up but never comes down? → Your age."
      ]);

    // Study / school
    if (/\b(study|homework|test|exam|quiz)\b/.test(t))
      return (
        "Study plan that works:\n" +
        "1. 25 min focus, 5 min break (repeat).\n" +
        "2. Active recall — close notes, write what you remember.\n" +
        "3. Do practice problems, not just reread.\n" +
        "4. Sleep beats an all-nighter for memory.\n" +
        "Tell me the subject if you want more specific tips."
      );
    if (/\b(photosynthesis)\b/.test(t))
      return "Photosynthesis: plants use sunlight, water, and CO₂ to make glucose and oxygen. Roughly: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Happens mainly in chloroplasts.";
    if (/\b(mitochondria)\b/.test(t))
      return "Mitochondria are cell structures that produce ATP (energy) through cellular respiration. Famous line: “powerhouse of the cell.”";
    if (/\b(pythagorean|pythagoras)\b/.test(t))
      return "Pythagorean theorem: in a right triangle, a² + b² = c² (c is the hypotenuse). Example: 3-4-5 triangle.";
    if (/\b(quadratic)\b/.test(t))
      return "Quadratic formula: for ax² + bx + c = 0, x = (−b ± √(b² − 4ac)) / (2a). Discriminant b²−4ac tells you how many real solutions.";
    if (/\b(slope)\b/.test(t) && /\b(math|line|graph|equation)\b/.test(t))
      return "Slope m = (y₂ − y₁) / (x₂ − x₁). In y = mx + b, m is slope and b is the y-intercept.";
    if (/\b(water cycle)\b/.test(t))
      return "Water cycle: evaporation → condensation → precipitation → collection, plus transpiration from plants. Energy source: the sun.";
    if (/\b(cell membrane|diffusion|osmosis)\b/.test(t))
      return "Diffusion: particles move from high to low concentration. Osmosis: water moves across a membrane toward higher solute concentration. Membranes are selectively permeable.";
    if (/\b(thesis statement)\b/.test(t))
      return "A thesis is one clear sentence: your claim + a hint of your reasons. Example: “School start times should be later because sleep improves grades and mental health.”";
    if (/\b(citation|cite sources|mla|apa)\b/.test(t))
      return "Basic MLA book: Author. Title. Publisher, Year.\nBasic website: Author. “Page.” Site, Date, URL.\nWhen in doubt, use your teacher’s guide or a citation generator carefully.";

    // Coding
    if (/\b(javascript|js\b|python|html|css|coding|programming)\b/.test(t)) {
      if (/\b(loop|for loop|while)\b/.test(t))
        return "JS: for (let i = 0; i < n; i++) { ... }\nPython: for i in range(n): ...\nWhile loops need a condition that eventually becomes false to avoid infinite loops.";
      if (/\b(function|def )\b/.test(t))
        return "JS: function add(a, b) { return a + b; }\nPython: def add(a, b): return a + b\nKeep functions small and named after what they do.";
      if (/\b(array|list)\b/.test(t))
        return "JS arrays: const a = [1,2,3]; a.push(4); a.map(x => x*2)\nPython lists: a = [1,2,3]; a.append(4); [x*2 for x in a]";
      if (/\b(if statement|condition)\b/.test(t))
        return "JS: if (x > 0) { ... } else if (x === 0) { ... } else { ... }\nPython: if x > 0:\n    ...\nelif x == 0:\n    ...\nelse:\n    ...";
      if (/\b(html)\b/.test(t))
        return "Minimal page:\n<!DOCTYPE html>\n<html>\n<head><title>Hi</title></head>\n<body><h1>Hello</h1></body>\n</html>\nTags come in pairs; nest them cleanly.";
      if (/\b(css)\b/.test(t))
        return "CSS idea: selector { property: value; }\nExample: body { font-family: sans-serif; background: #111; color: #fff; }\nUse classes for reusable styles.";
      return (
        "Coding tip: (1) state the goal, (2) write steps in plain English, (3) code one step, (4) test.\n" +
        "Ask about loops, functions, arrays, if/else, HTML, or CSS for a focused snippet."
      );
    }

    // Definitions / explain
    if (/\b(what is|what's|whats|define|explain|how does|how do)\b/.test(t)) {
      if (/\b(gravity)\b/.test(t))
        return "Gravity is the attraction between masses. On Earth it pulls us downward at about 9.8 m/s². Bigger mass → stronger pull; farther apart → weaker pull.";
      if (/\b(black hole)\b/.test(t))
        return "A black hole is a region where gravity is so strong that not even light can escape past the event horizon. They form from collapsed massive stars (and supermassive ones sit in galaxy centers).";
      if (/\b(internet)\b/.test(t))
        return "The internet is a global network of computers using shared protocols (mainly TCP/IP). The web (sites/pages) is one service that runs on top of it.";
      if (/\b(ai|artificial intelligence)\b/.test(t))
        return "AI means software that performs tasks that usually need human-like judgment — recognizing patterns, generating text, playing games. This local bot is rule-based; big AIs are trained neural nets.";
      if (/\b(inflation)\b/.test(t))
        return "Inflation is the rise in general prices over time, which lowers what one unit of money can buy. Central banks watch it closely when setting interest rates.";
      if (/\b(democracy)\b/.test(t))
        return "Democracy is a system where power comes from the people, usually through voting, rights, and rules that limit leaders. Variants include direct and representative democracy.";
      if (/\b(photosynthesis)\b/.test(t))
        return "Plants convert light energy into chemical energy (sugar), releasing oxygen. Inputs: light, water, carbon dioxide.";
      if (/\b(dna)\b/.test(t))
        return "DNA is the molecule that stores genetic instructions. It’s a double helix made of base pairs (A-T, C-G). Genes are segments of DNA that help build proteins.";
      if (/\b(vpn)\b/.test(t))
        return "A VPN encrypts your traffic and routes it through another server, hiding it from the local network. It helps privacy on public Wi‑Fi but doesn’t make you invisible to the VPN provider.";
      if (/\b(proxy)\b/.test(t))
        return "A proxy is a middle server between you and a site. Your request goes to the proxy; the proxy fetches the site. Used for filtering, caching, or access control.";
      // generic explain scaffold
      const topic = raw.replace(/^(what is|what's|whats|define|explain|how does|how do)\s+/i, "").replace(/\?+$/, "").trim();
      if (topic.length > 2) {
        return (
          "Here’s a simple frame for \"" + topic + "\":\n" +
          "1. One-sentence definition — what it is in plain words.\n" +
          "2. Why people care — effect or use.\n" +
          "3. One example — concrete case.\n" +
          "4. Common mix-up — what it is not.\n\n" +
          "Fill those four lines from class notes and you’ll have a solid answer."
        );
      }
    }

    // Advice
    if (/\b(motivation|procrastinat)\b/.test(t))
      return "Procrastination fix: shrink the task to 2 minutes (open the doc, write one sentence). Momentum beats motivation. Also remove the easiest distraction for 25 minutes.";
    if (/\b(sleep)\b/.test(t))
      return "Sleep tips: same bedtime most days, dim screens late, caffeine cutoff mid-afternoon, cool dark room. Teens often need 8–10 hours — it really does help grades.";
    if (/\b(friend|friendship)\b/.test(t))
      return "Good friendships need consistency more than drama: show up, listen more than you fix, and be honest kindly. If someone’s draining you constantly, distance is allowed.";
    if (/\b(advice)\b/.test(t))
      return "General advice: protect sleep, do the hard thing first hour, be kind offline and online, and ask for help earlier than you think you should.";

    // Time / date (local)
    if (/\b(what time|current time|time is it)\b/.test(t)) {
      const now = new Date();
      return "Your device time: " + now.toLocaleTimeString();
    }
    if (/\b(what day|what date|today'?s date)\b/.test(t)) {
      const now = new Date();
      return "Your device date: " + now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }

    // Writing prompts
    if (/\b(writing prompt|story idea|prompt)\b/.test(t))
      return pick([
        "Prompt: You find a door at school that only appears when you’re late. What’s behind it?",
        "Prompt: Everyone gets one random superpower for 24 hours — yours is the worst possible one for your schedule.",
        "Prompt: A game NPC starts messaging you outside the game.",
        "Prompt: The last song you heard becomes the weather for a week."
      ]);

    // Site-specific
    if (/\b(proxy|ultraviolet|scramjet)\b/.test(t))
      return "In Settings you can paste a proxy base URL if you host one. Without it, external sites open in a new tab because they block iframes.";
    if (/\b(how (do|to) add games|add a game)\b/.test(t))
      return "Put the HTML file in games/ and add a line in games.js: { name: \"Title\", file: \"filename.html\" }. Refresh the site.";

    // Sentiment-ish
    if (/\b(love you|i like you)\b/.test(t))
      return "That’s kind. I’m still just code on a games site — but I can help with tasks anytime.";
    if (/\b(hate you|you suck|stupid)\b/.test(t))
      return "Fair enough — I’m limited offline. Try a clearer question (math, essay, study tip) and I’ll do my best.";
    if (/\b(lol|lmao|haha|funny)\b/.test(t))
      return pick(["Ha.", "Nice.", "Glad someone laughed."]);

    // Yes / no style
    if (/^(yes|yeah|yep|no|nope|ok|okay|k|sure)\b/.test(t))
      return "Got it. What’s next?";

    // Fallback: keyword-aware scaffold so almost anything gets a useful shape
    const words = t.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    if (words.length <= 2) {
      return "Tell me a bit more about \"" + raw + "\" — what do you want (explain, solve, write, or ideas)?";
    }
    return (
      "On \"" + raw.slice(0, 140) + (raw.length > 140 ? "…" : "") + "\":\n\n" +
      "• If you want an explanation: ask “what is …” or “explain …”.\n" +
      "• If it’s math: paste the expression (e.g. 15/3+2).\n" +
      "• If it’s writing: say “essay about …” or “summarize …”.\n" +
      "• If you’re bored: say “suggest a game” or “riddle”.\n\n" +
      "I’m local, so specific asks work best."
    );
  }

  function setAiStatus(msg) {
    const el = $("#ai-status");
    if (el) el.textContent = msg;
  }

  function smartAiReply(userText) {
    setAiStatus("Local AI");
    return Promise.resolve(localAiReply(userText));
  }

  async function enableSmartAi() {
    setAiStatus("Local AI only");
    pushAi("bot", "Running fully local — no sign-in. Ask about school, math, writing, games, coding basics, or random facts.");
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
    state.aiLog.push({ role: role, text: String(text || "") });
    state.aiLog = state.aiLog.slice(-40);
    store.set("aiLog", state.aiLog);
    renderAi();
  }

  var aiBusy = false;

  async function sendAi() {
    try {
      const input = $("#ai-input");
      if (!input) return;
      if (aiBusy) return;
      const text = (input.value || "").trim();
      if (!text) return;
      input.value = "";
      pushAi("me", text);
      aiBusy = true;
      const sendBtn = $("#ai-send");
      if (sendBtn) sendBtn.disabled = true;
      pushAi("bot", "…");
      const reply = await smartAiReply(text);
      if (state.aiLog.length && state.aiLog[state.aiLog.length - 1].text === "…") {
        state.aiLog.pop();
      }
      pushAi("bot", reply || "No response.");
      aiBusy = false;
      if (sendBtn) sendBtn.disabled = false;
    } catch (err) {
      aiBusy = false;
      const sendBtn = $("#ai-send");
      if (sendBtn) sendBtn.disabled = false;
      if (state.aiLog.length && state.aiLog[state.aiLog.length - 1].text === "…") {
        state.aiLog.pop();
      }
      pushAi("bot", "Error: " + (err && err.message ? err.message : String(err)));
    }
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
    const aiKeyEl = $("#set-ai-key");
    const aiUrlEl = $("#set-ai-url");
    const aiModelEl = $("#set-ai-model");
    if (aiKeyEl) aiKeyEl.value = state.aiKey || "";
    if (aiUrlEl) aiUrlEl.value = state.aiUrl || "https://api.groq.com/openai/v1/chat/completions";
    if (aiModelEl) aiModelEl.value = state.aiModel || "llama-3.3-70b-versatile";
    on(aiKeyEl, "change", function (e) {
      state.aiKey = e.target.value.trim();
      store.set("aiKey", state.aiKey);
      setAiStatus(state.aiKey ? "API key saved" : "No API key · offline mode");
    });
    on(aiUrlEl, "change", function (e) {
      state.aiUrl = e.target.value.trim() || "https://api.groq.com/openai/v1/chat/completions";
      store.set("aiUrl", state.aiUrl);
    });
    on(aiModelEl, "change", function (e) {
      state.aiModel = e.target.value.trim() || "llama-3.3-70b-versatile";
      store.set("aiModel", state.aiModel);
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
      if (e.target.closest("#ai-signin")) {
        e.preventDefault();
        enableSmartAi();
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
          "Hey! Fully local AI — no sign-in. Try: solve 12*(5+3) · essay about space · suggest a game · what is gravity · help"
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
