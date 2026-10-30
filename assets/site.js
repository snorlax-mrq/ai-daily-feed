/* 深淺色切換：localStorage 記憶；無偏好時跟隨系統。head 內聯腳本已先行設定 data-theme。 */
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
/* 字級切換：標準 → 放大 → 特大 → 標準（100% / 113% / 126%）；localStorage 記憶，
   head 內聯腳本已先行設定 data-font；此處負責把檔位狀態同步到按鈕（aria-pressed／title 可見）。 */
(function () {
  var btn = document.getElementById("fontBtn");
  if (!btn) return;
  var NAME = { "": "標準", lg: "放大", xl: "特大" };
  var NEXT = { "": "lg", lg: "xl", xl: "" };
  var PCT = { "": "100%", lg: "113%", xl: "126%" };
  function sync() {
    var cur = document.documentElement.dataset.font || "";
    var name = NAME[cur] || "標準", nextName = NAME[NEXT[cur]];
    btn.setAttribute("aria-pressed", cur ? "true" : "false");
    btn.setAttribute("aria-label", "字級：" + name + "（" + (PCT[cur] || "100%") + "），點擊切換為" + nextName);
    btn.title = "字級：" + name + "（" + (PCT[cur] || "100%") + "）→ 點擊切換為" + nextName;
  }
  sync();
  btn.addEventListener("click", function () {
    document.documentElement.dataset.font = NEXT[document.documentElement.dataset.font || ""];
    try { localStorage.setItem("ai-news-font", document.documentElement.dataset.font || ""); } catch (e) {}
    sync();
  });
})();
/* 主題目錄 filter/query：主題/來源多選（同層 OR、跨層 AND）、關鍵字 AND、URL 狀態、命中章紅底線 */
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
    if (stamp) stamp.textContent = shown === total ? total + " 筆館藏" : shown + " / " + total + " 筆館藏";
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
