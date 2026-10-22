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
