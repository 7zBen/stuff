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
    var realTitle = document.title;
    var cover = document.createElement("div");
    cover.className = "cover";
    cover.innerHTML = '<div class="calc"><p class="calc-brand">Calculator</p><div class="calc-top"><span class="calc-sub" id="calcSub"></span><span id="calcDisp">0</span></div><div class="calc-pad" id="calcPad"></div></div>';
    document.body.appendChild(cover);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "panic-btn";
    btn.setAttribute("aria-label", "Cover");
    btn.textContent = "!";
    document.body.appendChild(btn);

    var acc = null, cur = "0", op = null, fresh = true;
    var disp = cover.querySelector("#calcDisp");
    var sub = cover.querySelector("#calcSub");
    function fmt(x) {
      if (!isFinite(x)) return "Error";
      var s = String(parseFloat(Number(x).toPrecision(10)));
      return s;
    }
    function show() {
      disp.textContent = cur;
      sub.textContent = acc != null && op ? fmt(acc) + " " + op : "";
    }
    function val() { return parseFloat(cur) || 0; }
    function apply() {
      var x = val();
      if (op === "+") acc += x;
      else if (op === "−") acc -= x;
      else if (op === "×") acc *= x;
      else if (op === "÷") acc = x === 0 ? NaN : acc / x;
      else if (op === "^") acc = Math.pow(acc, x);
      else acc = x;
      cur = fmt(acc);
      op = null;
      fresh = true;
    }
    function deg() { return val() * Math.PI / 180; }
    var keys = [
      { k: "sin", cls: "fn", fn: function () { cur = fmt(Math.sin(deg())); fresh = true; } },
      { k: "cos", cls: "fn", fn: function () { cur = fmt(Math.cos(deg())); fresh = true; } },
      { k: "tan", cls: "fn", fn: function () { cur = fmt(Math.tan(deg())); fresh = true; } },
      { k: "ln", cls: "fn", fn: function () { cur = fmt(Math.log(val())); fresh = true; } },
      { k: "log", cls: "fn", fn: function () { cur = fmt(Math.log10(val())); fresh = true; } },
      { k: "π", cls: "fn", fn: function () { cur = fmt(Math.PI); fresh = true; } },
      { k: "e", cls: "fn", fn: function () { cur = fmt(Math.E); fresh = true; } },
      { k: "√", cls: "fn", fn: function () { cur = fmt(Math.sqrt(val())); fresh = true; } },
      { k: "x²", cls: "fn", fn: function () { cur = fmt(val() * val()); fresh = true; } },
      { k: "xʸ", cls: "fn", fn: function () { if (acc != null && op) apply(); acc = val(); op = "^"; fresh = true; } },
      { k: "AC", cls: "fn", fn: function () { acc = null; cur = "0"; op = null; fresh = true; } },
      { k: "±", cls: "fn", fn: function () { cur = fmt(-val()); } },
      { k: "%", cls: "fn", fn: function () { cur = fmt(val() / 100); fresh = true; } },
      { k: "1/x", cls: "fn", fn: function () { cur = fmt(val() === 0 ? NaN : 1 / val()); fresh = true; } },
      { k: "÷", cls: "op", fn: function () { if (acc != null && op && !fresh) apply(); acc = val(); op = "÷"; fresh = true; } },
      { k: "7" }, { k: "8" }, { k: "9" },
      { k: "×", cls: "op", fn: function () { if (acc != null && op && !fresh) apply(); acc = val(); op = "×"; fresh = true; } },
      { k: "−", cls: "op", fn: function () { if (acc != null && op && !fresh) apply(); acc = val(); op = "−"; fresh = true; } },
      { k: "4" }, { k: "5" }, { k: "6" },
      { k: "+", cls: "op", fn: function () { if (acc != null && op && !fresh) apply(); acc = val(); op = "+"; fresh = true; } },
      { k: "n!", cls: "fn", fn: function () {
        var n = Math.floor(val()), r = 1;
        if (n < 0 || n > 170) cur = "Error";
        else { for (var i = 2; i <= n; i++) r *= i; cur = fmt(r); }
        fresh = true;
      } },
      { k: "1" }, { k: "2" }, { k: "3" },
      { k: ".", fn: function () { if (fresh) { cur = "0."; fresh = false; } else if (cur.indexOf(".") < 0) cur += "."; } },
      { k: "=", cls: "eq", fn: function () { if (op) apply(); acc = null; } },
      { k: "0" },
      { k: "00", fn: function () {
        if (fresh || cur === "0" || cur === "Error") { cur = "0"; fresh = false; }
        else cur += "00";
      } },
      { k: "Rand", cls: "fn", fn: function () { cur = fmt(Math.random()); fresh = true; } },
      { k: "eˣ", cls: "fn", fn: function () { cur = fmt(Math.exp(val())); fresh = true; } },
      { k: "10ˣ", cls: "fn", fn: function () { cur = fmt(Math.pow(10, val())); fresh = true; } }
    ];
    var pad = cover.querySelector("#calcPad");
    keys.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.k;
      if (item.cls) b.className = item.cls;
      b.addEventListener("click", function () {
        if (item.fn) item.fn();
        else if (/^\d$/.test(item.k)) {
          if (fresh || cur === "0" || cur === "Error") { cur = item.k; fresh = false; }
          else cur += item.k;
        }
        show();
      });
      pad.appendChild(b);
    });
    show();

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
      var map = { "/": "÷", "*": "×", "-": "−", "+": "+", Enter: "=", Escape: "AC" };
      var label = map[e.key] || e.key;
      var hit = Array.prototype.find.call(pad.children, function (c) { return c.textContent === label; });
      if (hit) { e.preventDefault(); hit.click(); }
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
