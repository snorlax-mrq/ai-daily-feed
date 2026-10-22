/* \u6DF1\u6DFA\u8272\u5207\u63DB\uFF1AlocalStorage \u8A18\u61B6\uFF1B\u7121\u504F\u597D\u6642\u8DDF\u96A8\u7CFB\u7D71\u3002head \u5167\u806F\u8173\u672C\u5DF2\u5148\u884C\u8A2D\u5B9A data-theme\u3002 */
(function () {
  var btn = document.getElementById("themeBtn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var cur = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("ai-news-theme", next); } catch (e) {}
  });
})();
/* \u5B57\u7D1A\u5207\u63DB\uFF1A\u6A19\u6E96 \u2192 \u653E\u5927 \u2192 \u7279\u5927 \u2192 \u6A19\u6E96\uFF1BlocalStorage \u8A18\u61B6\uFF0Chead \u5167\u806F\u8173\u672C\u5DF2\u5148\u884C\u8A2D\u5B9A data-font\u3002 */
(function () {
  var btn = document.getElementById("fontBtn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var cur = document.documentElement.dataset.font || "";
    var next = cur === "" ? "lg" : cur === "lg" ? "xl" : "";
    document.documentElement.dataset.font = next;
    btn.setAttribute("aria-label", "\u5B57\u7D1A\uFF1A" + (next === "lg" ? "\u653E\u5927" : next === "xl" ? "\u7279\u5927" : "\u6A19\u6E96") + "\uFF0C\u9EDE\u64CA\u5207\u63DB");
    try { localStorage.setItem("ai-news-font", next); } catch (e) {}
  });
})();
/* \u4E3B\u984C\u76EE\u9304 filter/query\uFF1A\u4E3B\u984C/\u4F86\u6E90\u591A\u9078\uFF08\u540C\u5C64 OR\u3001\u8DE8\u5C64 AND\uFF09\u3001\u95DC\u9375\u5B57 AND\u3001URL \u72C0\u614B\u3001\u547D\u4E2D\u7AE0\u7D05\u5E95\u7DDA */
(function () {
  var q = document.getElementById("q");
  if (!q) return;
  var cards = [].slice.call(document.querySelectorAll(".idx-card"));
  var groups = [].slice.call(document.querySelectorAll(".res-group"));
  var stamp = document.getElementById("resStamp");
  var total = cards.length;
  var empty = document.getElementById("empty");
  var results = document.getElementById("results");
  var resetBtn = document.getElementById("resetBtn");
  var qClear = document.getElementById("qClear");
  var topicTabs = document.getElementById("topicTabs");
  var srcTabs = document.getElementById("srcTabs");
  var topics = new Set(), sources = new Set(), timer = null;

  function clearMarks(card) {
    [].slice.call(card.querySelectorAll("mark.hit")).forEach(function (m) {
      var p = m.parentNode; if (!p) return;
      p.replaceChild(document.createTextNode(m.textContent), m); p.normalize();
    });
  }
  function markCard(card, words) {
    clearMarks(card);
    if (!words.length) return;
    var walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      var p = n.parentElement; if (p && p.closest("mark")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    } });
    var nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var v = n.nodeValue, lv = v.toLowerCase(), ranges = [];
      words.forEach(function (w) { var i = 0; while ((i = lv.indexOf(w, i)) >= 0) { ranges.push([i, i + w.length]); i += w.length; } });
      if (!ranges.length) return;
      ranges.sort(function (a, b) { return a[0] - b[0]; });
      var mg = []; ranges.forEach(function (r) { var l = mg[mg.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else mg.push(r); });
      var frag = document.createDocumentFragment(), pos = 0;
      mg.forEach(function (r) {
        if (r[0] > pos) frag.appendChild(document.createTextNode(v.slice(pos, r[0])));
        var mk = document.createElement("mark"); mk.className = "hit"; mk.textContent = v.slice(r[0], r[1]); frag.appendChild(mk); pos = r[1];
      });
      if (pos < v.length) frag.appendChild(document.createTextNode(v.slice(pos)));
      n.parentNode.replaceChild(frag, n);
    });
  }
  function apply(push) {
    var words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    cards.forEach(function (c) {
      var ok = true, ct = (c.getAttribute("data-topics") || "").split("|").filter(Boolean);
      if (ok && topics.size) ok = ct.some(function (t) { return topics.has(t); }) || (topics.has("__pending__") && !ct.length);
      if (ok && sources.size) ok = sources.has(c.getAttribute("data-source") || "");
      if (ok && words.length) { var hay = (c.getAttribute("data-text") || "").toLowerCase(); ok = words.every(function (w) { return hay.indexOf(w) >= 0; }); }
      c.hidden = !ok;
      if (ok) { shown++; markCard(c, words); }
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector(".idx-card:not([hidden])"); });
    if (stamp) stamp.textContent = shown === total ? total + " \u7B46\u9928\u85CF" : shown + " / " + total + " \u7B46\u9928\u85CF";
    empty.hidden = shown !== 0; results.hidden = shown === 0;
    resetBtn.hidden = !(topics.size || sources.size || words.length);
    qClear.hidden = !q.value;
    if (push) {
      var usp = new URLSearchParams();
      if (words.length) usp.set("q", q.value.trim());
      if (topics.size) usp.set("t", Array.from(topics).join(","));
      if (sources.size) usp.set("s", Array.from(sources).join(","));
      history.replaceState(null, "", usp.toString() ? "?" + usp.toString() : location.pathname);
    }
  }
  function bindTabs(box, key, set) {
    if (!box) return;
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var v = b.getAttribute(key);
      if (set.has(v)) { set.delete(v); b.setAttribute("aria-pressed", "false"); }
      else { set.add(v); b.setAttribute("aria-pressed", "true"); }
      apply(true);
    });
  }
  bindTabs(topicTabs, "data-t", topics);
  bindTabs(srcTabs, "data-s", sources);
  q.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(function () { apply(true); }, 140); });
  qClear.addEventListener("click", function () { q.value = ""; apply(true); q.focus(); });
  function resetAll() {
    topics.clear(); sources.clear(); q.value = "";
    [].slice.call(document.querySelectorAll(".topic-tab,.src-chip")).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    apply(true);
  }
  resetBtn.addEventListener("click", resetAll);
  document.getElementById("emptyReset").addEventListener("click", resetAll);
  try {
    var usp = new URLSearchParams(location.search);
    if (usp.get("q")) q.value = usp.get("q");
    (usp.get("t") || "").split(",").filter(Boolean).forEach(function (t) { topics.add(t); });
    (usp.get("s") || "").split(",").filter(Boolean).forEach(function (s) { sources.add(s); });
    [].slice.call(document.querySelectorAll(".topic-tab,.src-chip")).forEach(function (b) {
      if (topics.has(b.getAttribute("data-t")) || sources.has(b.getAttribute("data-s"))) b.setAttribute("aria-pressed", "true");
    });
  } catch (e) {}
  apply(false);
})();
