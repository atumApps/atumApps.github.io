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
index.html            Home: hero video, dock of app tiles, one panel per app
privacy.html          Privacy policy for all apps
inkhornprivacy.html   Privacy policy for Inkhorn
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
- `privacy.html`, `inkhornprivacy.html` — the app stores link to
  `/privacy` and `/inkhornprivacy`. The URLs must keep working.
- `.nojekyll` — tells GitHub Pages to serve files as they are.
- Favicons and `site.webmanifest` in the repo root.

## How the home page works

- The **dock** (`<nav class="dock">`) holds one `<a class="tile" href="#id">`
  per app, grouped under "Apps" and "Studio".
- The **stage** holds one `<section class="panel" id="id">` per tile.
- `js/site.js` shows the panel matching the URL hash (or the first panel) and
  marks its tile with `aria-current="true"`. Without JavaScript all panels are
  shown stacked, so content must make sense in document order.
- App ids are kebab-case: `grid-words`, `keijo`, `pixel-princess`,
  `tiny-evolution`, `the-spire`, `poo-pal`, `inkhorn`, `about`. The same slug
  names the icon and screenshot files.

## Recipe: add an app

1. Add `img/icons/<slug>.png` (256x256, same blue line style as the others).
2. Add `img/screens/<slug>.webp` — portrait phone screenshot, about 554x1200.
   For a landscape screenshot use the `panel--wide` class on the section.
3. In `index.html`, copy an existing `<li>` tile in the dock and an existing
   `<section class="panel">`; change the slug, text, `mailto:` subject and the
   App Store link (keep `&mt=8` on the end of App Store links).
4. If the app collects any data, update `privacy.html`.
5. Run `node scripts/check.mjs` and preview at desktop and phone widths.

## Unfinished: Inkhorn

The Inkhorn panel is a placeholder. Still needed from the owner: description,
screenshot, real icon (currently `img/icons/inkhorn.svg`) and the App Store /
Google Play links (search `index.html` for `TODO`).

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
  one, change all four pages.
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
