# atumApps.github.io

The website for [atum Apps](https://www.atumapps.com) — a plain HTML, CSS and
JavaScript site with no build step, served by GitHub Pages from the `main`
branch.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Check before pushing

```sh
node scripts/check.mjs
```

This catches broken links, missing images and dock tiles without a panel. The
same check runs on GitHub after every push.

## Deploy

Push to `main`. GitHub Pages publishes it to <https://www.atumapps.com> within
a minute or two.

## Working on the site

See [CLAUDE.md](CLAUDE.md) for the file layout, conventions and step-by-step
recipes (such as adding a new app). It is written for coding agents but reads
fine for people too.
