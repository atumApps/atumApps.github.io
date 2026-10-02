# atum Apps website

Marketing site for atum Apps (indie iOS/Android games). Plain HTML, CSS and
JavaScript. **No build step, no framework, no dependencies** — keep it that way
unless the owner asks otherwise.

## Commands

| Task | Command |
| --- | --- |
| Preview | `python3 -m http.server 8000`, then open http://localhost:8000 |
| Check (run before every commit) | `node scripts/check.mjs` |
| Deploy | `git push` to `main` — GitHub Pages serves the repo root |

There is no staging site. A push to `main` is live at https://www.atumapps.com
within a couple of minutes, so preview locally first.

## Layout

```
index.html            Home: hero video, one panel per app, dock of tiles at the bottom
privacy.html          The one privacy policy, covering every app
404.html              Not-found page (uses root-relative URLs only)
css/site.css          The only stylesheet. Design tokens are at the top
js/site.js            The only script: panel switching + video pause button
img/lotus.png         Logo
img/icons/<app>.png   Dock icons, 256x256, blue on transparent
img/screens/<app>.webp  Screenshots shown in panels
video/hero.mp4        Hero banner (re-encoded, ~0.5 MB) + hero-poster.jpg
scripts/check.mjs     Link/asset/structure check, also run in CI
.github/workflows/    CI that runs the check
```

## Do not delete or rename

- `CNAME` — binds the site to www.atumapps.com.
- `app-ads.txt` — required by Google AdMob for Tiny Evolution.
- `privacy.html` — the app stores link to `/privacy`. The URL must keep
  working. (`/inkhornprivacy` was deliberately deleted on 2 October 2026.)
- `.nojekyll` — tells GitHub Pages to serve files as they are.
- Favicons and `site.webmanifest` in the repo root.

## How the home page works

- With JS the home page is a fixed window that **never scrolls**: video at the
  top, dock at the bottom, and an open panel grows upward from the dock over
  the video. Do not reintroduce page scrolling or visible scroll bars.
- The **stage** holds one `<section class="panel" id="id">` per tile. Each
  panel must contain a single `<div class="panel-body">` wrapping its content;
  that body scrolls inside the panel (scroll bar hidden) when it is too tall.
- The **dock** (`<nav class="dock">`) is last in the HTML and holds one
  `<a class="tile" href="#id">` per panel, grouped under "Apps" and "Studio".
  On phones the two groups sit side by side — Apps in two rows (shorter row
  on top), Studio one tile per row — and it must never scroll; `js/site.js`
  sets `--apps-columns` from the tile count so tiles shrink to fit.
- `js/site.js` opens the panel matching the tile or URL hash and marks its
  tile with `aria-current="true"`. Clicking the tile again, the panel's X
  (added by the script) or Escape closes it. Nothing is open by default.
  Without JavaScript all panels are shown stacked in a normal scrolling page.
- App panels hold only the description and store badge. Bug reports and
  feature requests go through the "Contact us" button in About us; do not add
  per-app "Noticed a bug?" lines back.
- On phones, portrait screenshots show at half size (110px wide) and landscape
  ones span the panel; the hero video is 440px tall and crops at the sides.
- The `#privacy` panel repeats the text of `privacy.html` (the stores link to
  that page, so it must stay). Edit both together; the check fails if they
  differ.
- App ids are kebab-case: `grid-words`, `keijo`, `pixel-princess`,
  `tiny-evolution`, `the-spire`, `poo-pal`, `inkhorn`, `about`, `privacy`. The same slug
  names the icon and screenshot files.

## Recipe: add an app

1. Add `img/icons/<slug>.png` (256x256, same blue line style as the others).
2. Add `img/screens/<slug>.webp` — portrait phone screenshot, about 554x1200.
   For a landscape screenshot use the `panel--wide` class on the section.
3. In `index.html`, copy an existing `<li>` tile in the dock and an existing
   `<section class="panel">`; change the slug, text and the
   App Store link (keep `&mt=8` on the end of App Store links).
4. `privacy.html` is one generic policy for every app and names no app. If
   the new app handles data differently, tell the owner; do not reword the
   policy yourself.
5. Run `node scripts/check.mjs` and preview at desktop and phone widths.

## Unfinished: Inkhorn

The Inkhorn panel is a placeholder. Still needed from the owner: description,
screenshot and the App Store / Google Play links (search `index.html` for `TODO`).

## Style conventions

- **Look:** dark navy page, glass sheets (`.glass`), raised "neumorphic" tiles
  and buttons. The lotus logo and brand blue `#309afd` are fixed.
- Colours, shadows, radii and fonts are CSS custom properties at the top of
  `css/site.css`. Use them; do not hard-code new colours in rules.
- No inline `style=""` attributes and no per-page `<style>` blocks.
- Fonts: Bricolage Grotesque for headings, Source Sans 3 for text (Google
  Fonts, loaded in each page's `<head>`).
- Sentence case for headings and labels. No all-caps labels, no emoji.
- 4-space indentation in HTML, CSS and JS. Plain ES5-style JavaScript, no
  modules, no libraries.
- Every `<img>` needs `alt`, `width` and `height`. Use `alt=""` for decoration.
- Respect `prefers-reduced-motion` for anything that moves.
- The header and footer are repeated by hand in each HTML page. If you change
  one, change all three pages.
- Do not rewrite the app descriptions or privacy text unless asked; that copy
  is the owner's.

## Media

`video/appVideoFinal.mp4` (20 MB) is the original hero video, kept as the
source for re-encoding. It is not referenced by any page. To re-encode:

```sh
ffmpeg -i video/appVideoFinal.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 26 \
  -preset slow -pix_fmt yuv420p -movflags +faststart video/hero.mp4
```

## Hosting

GitHub Pages (branch `main`, root). DNS and email are at IONOS: `www` is a
CNAME to `atumapps.github.io`. Do not touch MX records — `contact@atumapps.com`
is hosted there.
