(function () {
  var root = document.documentElement;
  var button = document.getElementById('theme-toggle');
  var icon = document.getElementById('toggle-icon');

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (icon) icon.textContent = theme === 'dark' ? '◐' : '◑';
  }

  apply(root.getAttribute('data-theme') || 'dark');

  if (button) {
    button.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch (e) { /* private browsing */ }
      apply(next);
    });
  }
})();

/* Copy buttons on post code blocks */
(function () {
  if (!navigator.clipboard) return;
  document.querySelectorAll('.post-body pre, .pub-bib pre').forEach(function (pre) {
    var wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'copy';
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(pre.innerText).then(function () {
        btn.textContent = 'copied';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'copy';
          btn.classList.remove('copied');
        }, 1500);
      });
    });
    wrapper.appendChild(btn);
  });
})();
