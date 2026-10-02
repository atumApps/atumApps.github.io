#!/usr/bin/env node
// Site check. No dependencies: `node scripts/check.mjs`.
// Fails if any page points at a local file or #anchor that does not exist,
// or if a dock tile and its panel are out of step. Run before every push.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = readdirSync(root).filter((f) => f.endsWith(".html"));
const errors = [];

const idsIn = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const strip = (html) => html.replace(/<!--[\s\S]*?-->/g, "");

for (const page of pages) {
    const html = strip(readFileSync(join(root, page), "utf8"));
    const ids = idsIn(html);

    for (const [, attr, value] of html.matchAll(/\s(href|src|poster)="([^"]*)"/g)) {
        if (/^(https?:|mailto:|data:)/.test(value)) continue;

        const [path, hash] = value.split("#");
        let target = page;
        if (path && path !== "/") {
            target = path.startsWith("/") ? path.slice(1) : path;
            // GitHub Pages serves /privacy from privacy.html.
            if (!existsSync(join(root, target)) && existsSync(join(root, target + ".html"))) target += ".html";
            if (!existsSync(join(root, target))) {
                errors.push(`${page}: ${attr}="${value}" points at a missing file`);
                continue;
            }
        } else if (path === "/") {
            target = "index.html";
        }
        if (hash && target.endsWith(".html")) {
            const targetIds = target === page ? ids : idsIn(strip(readFileSync(join(root, target), "utf8")));
            if (!targetIds.has(hash)) errors.push(`${page}: ${attr}="${value}" has no matching id`);
        }
    }

    if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${page}: missing <title>`);
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
        if (!/\salt="/.test(tag)) errors.push(`${page}: <img> without alt: ${tag.slice(0, 80)}`);
    }
}

// Every panel on the home page needs a dock tile.
const home = strip(readFileSync(join(root, "index.html"), "utf8"));
const tiles = new Set([...home.matchAll(/class="tile" href="#([^"]+)"/g)].map((m) => m[1]));
for (const [, id] of home.matchAll(/<section class="panel[^"]*" id="([^"]+)"/g)) {
    if (!tiles.has(id)) errors.push(`index.html: panel #${id} has no dock tile`);
}
// Every panel needs a .panel-body directly inside it (that is the part that scrolls).
const panelCount = [...home.matchAll(/<section class="panel[^"]*" id=/g)].length;
const bodyCount = [...home.matchAll(/<section class="panel[^"]*" id="[^"]+">\s*<div class="panel-body">/g)].length;
if (panelCount !== bodyCount) errors.push("index.html: every panel must start with <div class=\"panel-body\">");


// The privacy panel on the home page must say the same as privacy.html.
const paragraphs = (html) =>
    [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
const panelText = paragraphs(home.slice(home.indexOf('id="privacy"'), home.indexOf("<nav")));
const pageText = paragraphs(strip(readFileSync(join(root, "privacy.html"), "utf8")));
if (JSON.stringify(panelText) !== JSON.stringify(pageText)) {
    errors.push("index.html: the #privacy panel text differs from privacy.html");
}

// Files GitHub Pages and the app stores rely on.
for (const file of ["CNAME", "app-ads.txt", "privacy.html", ".nojekyll"]) {
    if (!existsSync(join(root, file))) errors.push(`${file} is missing and must not be deleted`);
}

if (errors.length) {
    console.error(errors.join("\n"));
    console.error(`\n${errors.length} problem(s) found.`);
    process.exit(1);
}
console.log(`OK: ${pages.length} pages checked.`);
