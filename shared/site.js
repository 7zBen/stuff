(function () {
  var KEY = "site-theme";
  function preferred() {
    try {
      var s = localStorage.getItem(KEY);
      if (s === "light" || s === "dark") return s;
    } catch (e) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function apply(t) { document.documentElement.setAttribute("data-theme", t); }
  apply(preferred());

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>';
  var VOL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M18.5 7a8 8 0 0 1 0 10"/></svg>';
  var MUTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';

  window.setMuteIcon = function (btn, muted) {
    if (!btn) return;
    btn.classList.add("icon-btn");
    btn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    btn.setAttribute("title", muted ? "Unmute" : "Mute");
    btn.innerHTML = muted ? MUTE : VOL;
  };

  function themeToggle() {
    var b = document.getElementById("themeToggle");
    if (!b) {
      b = document.createElement("button");
      b.id = "themeToggle";
      b.type = "button";
      b.className = "icon-btn";
      var bar = document.querySelector(".bar");
      var header = document.querySelector("header");
      if (bar) {
        var end = bar.querySelector(".bar-end");
        if (!end) {
          end = document.createElement("div");
          end.className = "bar-end";
          Array.from(bar.children).forEach(function (ch) {
            if (ch.tagName === "A") return;
            end.appendChild(ch);
          });
          bar.appendChild(end);
        }
        end.appendChild(b);
      } else if (header) header.appendChild(b);
      else document.body.appendChild(b);
      b.addEventListener("click", function () {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        try { localStorage.setItem(KEY, next); } catch (e) {}
        apply(next);
        paint();
      });
    }
    function paint() {
      var t = document.documentElement.getAttribute("data-theme");
      b.innerHTML = t === "dark" ? SUN : MOON;
      b.setAttribute("aria-label", t === "dark" ? "Light mode" : "Dark mode");
      b.setAttribute("title", t === "dark" ? "Light mode" : "Dark mode");
    }
    paint();
  }

  function panic() {
    if (!/\/games\//.test(location.pathname) || /\/games\/slope(\/|$)/.test(location.pathname)) return;
    document.body.classList.add("game-page");
    var cover = document.createElement("div");
    cover.className = "cover";
    cover.innerHTML = '<div class="calc-top" id="calcDisp">0</div><div class="calc-pad" id="calcPad"></div>';
    document.body.appendChild(cover);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "panic-btn";
    btn.setAttribute("aria-label", "Cover");
    btn.textContent = "!";
    document.body.appendChild(btn);

    var acc = 0, cur = "0", op = null, fresh = true;
    var disp = cover.querySelector("#calcDisp");
    function show(v) { disp.textContent = String(v); }
    function n() { return parseFloat(cur); }
    function applyOp() {
      var x = n();
      if (op === "+") acc += x;
      else if (op === "-") acc -= x;
      else if (op === "×") acc *= x;
      else if (op === "÷") acc = x === 0 ? 0 : acc / x;
      else acc = x;
      cur = String(acc);
      show(cur);
      fresh = true;
    }
    var keys = ["AC","±","%","÷","7","8","9","×","4","5","6","-","1","2","3","+","0",".","="];
    keys.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = k;
      if (k === "0") b.className = "zero";
      if ("÷×-+=".indexOf(k) >= 0) b.className = (k === "0" ? "zero " : "") + "op";
      if (k === "=") b.className = "op";
      if (k === "AC" || k === "±" || k === "%") b.className = "fn";
      b.addEventListener("click", function () {
        if (k === "AC") { acc = 0; cur = "0"; op = null; fresh = true; show(cur); return; }
        if (k === "±") { cur = String(-n()); show(cur); return; }
        if (k === "%") { cur = String(n() / 100); show(cur); return; }
        if (k === "=") { applyOp(); op = null; return; }
        if ("÷×-+".indexOf(k) >= 0) { if (!fresh) applyOp(); else acc = n(); op = k; fresh = true; return; }
        if (k === ".") { if (cur.indexOf(".") < 0) { cur += fresh ? "0." : "."; fresh = false; show(cur); } return; }
        if (fresh) { cur = k; fresh = false; } else cur = (cur === "0" ? k : cur + k);
        show(cur);
      });
      cover.querySelector("#calcPad").appendChild(b);
    });

    function setOn(on) {
      cover.classList.toggle("show", on);
      document.documentElement.classList.toggle("panic", on);
      document.title = on ? "Calculator" : realTitle;
    }
    btn.addEventListener("click", function () { setOn(!cover.classList.contains("show")); });
    window.addEventListener("keydown", function (e) {
      if (!cover.classList.contains("show")) return;
      e.stopPropagation();
      if (e.key === "Escape") { setOn(false); e.preventDefault(); }
    }, true);
  }

  function boot() {
    themeToggle();
    panic();
    var m = document.getElementById("mute");
    if (m && !m.querySelector("svg")) {
      window.setMuteIcon(m, /muted/i.test(m.textContent || ""));
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
