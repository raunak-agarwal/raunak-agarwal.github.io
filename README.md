# raunak-agarwal.github.io

Personal site. Three tabs: **Home** (bio), **Posts** (blog) and **Publications**.
Jekyll, hosted on
GitHub Pages. Design: pixel display font ([Departure Mono](https://departuremono.com),
OFL-licensed, bundled in `assets/fonts/`), dithered background, scanlines,
dark/light theme toggle, animated dither banner above the footer.

## What's where

| Path | What it is |
| --- | --- |
| `_config.yml` | Site title, description, URL, plugins, permalink scheme, build excludes |
| `index.html` | Home page — the subtitle and bio paragraphs live here |
| `posts.html` | The `/posts/` listing |
| `publications.html` | The `/publications/` list, newest first |
| `_posts/` | One Markdown file per post |
| `_layouts/default.html` | Page shell: head, header/nav, banner, footer links |
| `_layouts/post.html` | Individual post page |
| `assets/css/main.css` | The entire stylesheet — design tokens at the top |
| `assets/js/theme.js` | Theme toggle, banner playback, code copy buttons |
| `assets/img/banner-*` | The four banner assets (dark/light × video/still) |
| `404.html`, `favicon.png` | Self-explanatory |

## Publishing

**GitHub Pages is the build.** It runs Jekyll on every push to `main` — there is
no build step you have to run, and `_site/` is not committed.

First time:

1. Create a public repo named exactly `raunak-agarwal.github.io`.
2. Push this folder to its `main` branch.
3. Repo → Settings → Pages → "Deploy from a branch" → `main` / root.

Every time after that:

```bash
git push
```

The live site updates a minute or two later at <https://raunak-agarwal.github.io>.
If a push doesn't show up, check the repo's Actions tab — a Jekyll build failure
is reported there, and the site keeps serving the last good build.

## Previewing locally

Optional, but the way to catch a mistake before it's public.

One-time setup (macOS ships Ruby 2.6, too old):

```bash
brew install ruby
```

```bash
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
```

Open a new terminal so that takes effect, then from the repo:

```bash
bundle install
```

Day to day:

```bash
bundle exec jekyll serve --livereload
```

First boot takes about a minute; then the site is at <http://localhost:4000> and
rebuilds on save. `bundle exec jekyll build` writes `_site/` instead of serving.
Editing `_config.yml` needs a restart — everything else the watcher picks up.

⚠️ The local gems are **not** the ones GitHub Pages uses. The `github-pages` gem
pins Jekyll 3.9 / Liquid 4.0, and Liquid 4.0 calls `String#tainted?`, which Ruby
3.2 removed — that set cannot run on a current Ruby at all. So the `Gemfile` uses
Jekyll 4: same kramdown, rouge and jekyll-feed, and these templates use plain
Liquid, so output matches. Production is still the source of truth.

## Updating the site

### Writing a post

Add a Markdown file to `_posts/` named `YYYY-MM-DD-some-title.md`:

```markdown
---
title: Some title
subtitle: Optional one-liner shown in the list and under the title.
---

Body in Markdown.
```

The URL comes from the filename (`/some-title/`), the date from the filename
prefix. It appears on `/posts/` and in `/feed.xml` automatically — no index to
update. A post dated in the future won't build until that date.

### Adding a publication

Entries live in `publications.html` as plain HTML, ordered newest first (there
is no automatic sort). Copy an existing `<li class="pub-item">` block and fill in
the year, title, authors, venue, links, and BibTeX.

Wrap every BibTeX block in `{% raw %}` / `{% endraw %}`. Entries commonly contain
`{{Braced Titles}}`, and Liquid would otherwise try to evaluate them as a
template expression and swallow the text. The blocks pick up a copy button from
`theme.js` automatically.

### Bio, subtitle, links

- Bio paragraphs and the role subtitle: `index.html`.
- Footer links (LinkedIn · GitHub · Google Scholar) and the nav: `_layouts/default.html`.
- Name shown in the header, and the description used for `<title>`/RSS: `_config.yml`.

**After editing the bio, re-check the one-screen fit.** The landing page is
tuned to fit a laptop viewport with no scrolling, and the banner is sized to
claim exactly the height the bio leaves over:

```css
.hero-wrap { width: min(100%, max(360px, calc(209.6vh - 1178px))); }
```

That `1178px` encodes the height of header + bio + footer. Add or remove a line
of bio and the figure needs re-tuning: every 1px of height freed up is worth
2.096px of figure width (the 480/229 aspect). Check by loading the home page and
confirming `document.documentElement.scrollHeight === window.innerHeight`.

### Colours and type

Design tokens are the `:root` / `[data-theme]` blocks at the top of
`assets/css/main.css` — font stacks, the type scale, the column width, and both
palettes. Light-mode link colour is set for WCAG AA contrast; if you change it,
keep the ratio ≥ 4.5:1.

## The footer banner

On the home page a play-once sequence (`assets/img/banner-seq-{dark,light}.mp4`,
~8s): a cellular automaton dissolves pixel-by-pixel into the footage, which plays
through once at quarter speed and rests on its final frame; a small "reload"
button (bottom right) replays it. Everywhere else — and for
`prefers-reduced-motion` or no-JS visitors — the banner is just the resting still
(`banner-still-{dark,light}.webp`). Frames are Bayer-dithered (ordered dithering
is position-stable, so motion reads as motion rather than shimmer). Dark = white
dither on black; light = re-dithered with inverted luminance (dark scene → dense
ink on paper), because a plain CSS inversion of the dark asset looks empty.
`theme.js` picks the active theme's files, so only those download, and re-syncs
on toggle; without JavaScript a `<picture>` media query picks the still.

The assets are 960×458. They hold up displayed at up to ~960 CSS px (a ~1.9×
upscale on a 2× display still reads as clean dither); past that the sequence
would need re-rendering at a higher resolution.

The repo carries only the four rendered files; the source footage is kept
outside it (`../personal-site-2026-banner-sources/`) since it is large and not
ours to redistribute. To swap the banner, replace the four files in
`assets/img/` — nothing in the markup or JS refers to a specific variant.
