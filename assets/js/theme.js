(function () {
  var root = document.documentElement;
  var button = document.getElementById('theme-toggle');
  var icon = document.getElementById('toggle-icon');

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (icon) icon.textContent = theme === 'dark' ? '◐' : '◑';
    document.dispatchEvent(new CustomEvent('sitethemechange', { detail: theme }));
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

/* Footer banner: the cellular-automaton intro dissolves, pixel by pixel,
   into dithered footage that then keeps looping at quarter speed (the slow
   rate is baked into banner-loop.mp4). Skipped under prefers-reduced-motion
   (and without JS), where only the still is shown. The pause control stays
   available the whole time, since the loop moves indefinitely (WCAG 2.2.2). */
(function () {
  var banner = document.querySelector('.hero-banner');
  var video = document.getElementById('banner-video');
  var still = document.getElementById('banner-still');
  var reload = document.getElementById('banner-reload');
  if (!banner || !video || !reload) return;

  /* Assets are theme-native: separate dark/light renders, chosen here so only
     the active theme's files are downloaded. Once JS owns theming, drop the
     <picture> source (it follows the system scheme, not the toggle). */
  var pictureSource = banner.querySelector('picture source');
  if (pictureSource) pictureSource.remove();

  function theme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncStill(t) {
    if (still) still.src = still.getAttribute('data-src-' + t);
  }

  syncStill(theme());

  /* The sequence only runs on the home page; elsewhere (and under
     prefers-reduced-motion) the banner is just the resting still. */
  if (!banner.hasAttribute('data-animate') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('sitethemechange', function (e) { syncStill(e.detail); });
    return;
  }

  function syncVideo(t) {
    video.src = video.getAttribute('data-src-' + t);
  }

  function start() {
    banner.classList.add('banner-playing');
    var p = video.play();
    if (p && p.catch) p.catch(rest); /* autoplay blocked: rest on the still */
  }

  function rest() { /* sequence over (or not playable): show still + reload */
    banner.classList.remove('banner-playing');
    reload.hidden = false;
  }

  video.addEventListener('play', function () { reload.hidden = true; });
  video.addEventListener('ended', rest);
  video.addEventListener('pause', function () {
    /* stopped before the end (blocked autoplay, background tab, ...):
       always offer the reload control, whatever the event ordering was */
    if (!video.ended) reload.hidden = false;
  });

  reload.addEventListener('click', function () {
    video.currentTime = 0;
    start();
  });

  document.addEventListener('sitethemechange', function (e) {
    var wasPlaying = banner.classList.contains('banner-playing') && !video.paused;
    syncStill(e.detail);
    syncVideo(e.detail); /* resets playback */
    if (wasPlaying) {
      start(); /* replay the sequence in the new theme */
    } else {
      banner.classList.remove('banner-playing');
    }
  });

  syncVideo(theme());
  start();
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
