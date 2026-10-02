// atum Apps — site behaviour. No dependencies.
// 1. The dock: clicking a tile opens that panel above the dock; clicking it
//    again, the panel's X, or Escape closes it. Nothing is open by default.
//    The home page never scrolls; a tall panel scrolls inside itself (css/site.css).
//    Left/right arrow keys and sideways swipes step through the panels.
// 2. A soft highlight on the glass that follows the mouse pointer.
// 3. The hero video's pause/play button.
// Without JS every panel is simply shown, stacked, and tiles act as anchors.

(function () {
    document.documentElement.classList.add("js");

    /* ---------- Dock and panels ---------- */

    var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile[href^="#"]'));
    // Panel ids in dock order: the order arrow keys and swipes step through.
    var order = tiles.map(function (tile) { return tile.getAttribute("href").slice(1); });
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var openId = null;

    function markTile(id) {
        tiles.forEach(function (tile) {
            if (id && tile.getAttribute("href") === "#" + id) {
                tile.setAttribute("aria-current", "true");
            } else {
                tile.removeAttribute("aria-current");
            }
        });
    }

    // Show the panel with this id and hide the rest. A null or unknown id closes everything.
    // When switching between panels the new one slides in: from the side its tile is on,
    // or from the given direction (+1 = from the right) when stepping with arrows or a swipe.
    function show(id, direction) {
        var from = order.indexOf(openId);
        var to = order.indexOf(id);
        var slide = "";
        if (from !== -1 && to !== -1 && from !== to) {
            slide = (direction || to - from) > 0 ? "from-right" : "from-left";
        }

        openId = null;
        panels.forEach(function (panel) {
            var active = panel.id === id;
            panel.classList.remove("is-closing", "from-right", "from-left");
            panel.classList.toggle("is-active", active);
            if (active) {
                openId = id;
                if (slide) {
                    panel.classList.add(slide);
                }
            }
        });
        markTile(openId);
    }

    function open(id, direction) {
        show(id, direction);
        history.replaceState(null, "", "#" + id);
    }

    // Closing plays the sink animation (css/site.css) before the panel is hidden.
    function close() {
        var panel = openId && document.getElementById(openId);
        history.replaceState(null, "", location.pathname + location.search);
        if (!panel || reduceMotion.matches) {
            show(null);
            return;
        }
        openId = null;
        markTile(null);
        panel.classList.remove("from-right", "from-left");
        panel.classList.add("is-closing");
        var done = function () {
            // Skip if the panel was reopened while it was animating out.
            if (panel.classList.contains("is-closing")) {
                panel.classList.remove("is-closing", "is-active");
            }
        };
        panel.addEventListener("animationend", done, { once: true });
        setTimeout(done, 400);
    }

    // Move to the next (+1) or previous (-1) panel in dock order, wrapping round.
    function step(delta) {
        var index = order.indexOf(openId);
        if (index !== -1) {
            open(order[(index + delta + order.length) % order.length], delta);
        }
    }

    function showFromHash() {
        show(decodeURIComponent(location.hash.slice(1)));
    }

    if (panels.length) {
        tiles.forEach(function (tile) {
            tile.addEventListener("click", function (event) {
                var id = tile.getAttribute("href").slice(1);
                event.preventDefault();
                if (id === openId) {
                    close();
                } else {
                    open(id);
                }
            });
        });

        panels.forEach(function (panel) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "panel-close";
            button.setAttribute("aria-label", "Close");
            button.innerHTML =
                '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 3l12 12M15 3L3 15"/></svg>';
            button.addEventListener("click", close);
            panel.insertBefore(button, panel.firstChild);

            // Swipe left/right on an open panel to step through the apps.
            // Mostly-vertical drags are left alone so the panel can scroll.
            var startX = 0;
            var startY = 0;
            panel.addEventListener("touchstart", function (event) {
                startX = event.touches[0].clientX;
                startY = event.touches[0].clientY;
            }, { passive: true });
            panel.addEventListener("touchend", function (event) {
                var dx = event.changedTouches[0].clientX - startX;
                var dy = event.changedTouches[0].clientY - startY;
                if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
                    step(dx < 0 ? 1 : -1);
                }
            }, { passive: true });
        });

        // Escape closes; left/right arrows step through the apps while a panel is open.
        document.addEventListener("keydown", function (event) {
            if (!openId || event.altKey || event.ctrlKey || event.metaKey) {
                return;
            }
            if (event.key === "Escape") {
                close();
            } else if (event.key === "ArrowRight") {
                step(1);
            } else if (event.key === "ArrowLeft") {
                step(-1);
            }
        });

        // Phones show the app tiles in exactly two rows, the shorter row on top.
        // Tell the CSS how many columns that needs and where the second row starts.
        var appItems = document.querySelectorAll(".dock-group--apps .dock-tiles > li");
        var dock = document.querySelector(".dock");
        dock.style.setProperty("--apps-columns", Math.ceil(appItems.length / 2));
        if (appItems.length > 1) {
            appItems[Math.floor(appItems.length / 2)].classList.add("tile-row-start");
        }

        window.addEventListener("hashchange", showFromHash);
        showFromHash();
    }

    /* ---------- Light on glass ---------- */

    // A soft highlight on every .glass surface that follows the mouse pointer.
    // The CSS draws it from --light-x / --light-y (css/site.css, ".glass").
    var glass = Array.prototype.slice.call(document.querySelectorAll(".glass"));
    var pointer = null;

    function paintLight() {
        glass.forEach(function (surface) {
            var rect = surface.getBoundingClientRect();
            if (pointer && rect.width) {
                surface.style.setProperty("--light-x", (pointer.x - rect.left) + "px");
                surface.style.setProperty("--light-y", (pointer.y - rect.top) + "px");
            } else {
                surface.style.removeProperty("--light-x");
                surface.style.removeProperty("--light-y");
            }
        });
    }

    if (glass.length && window.matchMedia("(hover: hover)").matches) {
        var queued = false;
        var schedule = function () {
            if (!queued) {
                queued = true;
                requestAnimationFrame(function () {
                    queued = false;
                    paintLight();
                });
            }
        };
        document.addEventListener("pointermove", function (event) {
            if (event.pointerType === "mouse") {
                pointer = { x: event.clientX, y: event.clientY };
                schedule();
            }
        });
        document.documentElement.addEventListener("pointerleave", function () {
            pointer = null;
            schedule();
        });
    }

    /* ---------- Hero video ---------- */

    var video = document.querySelector(".hero video");
    var toggle = document.querySelector(".video-toggle");

    if (video && toggle) {
        var setPaused = function (paused) {
            toggle.setAttribute("aria-pressed", String(paused));
            toggle.setAttribute("aria-label", paused ? "Play video" : "Pause video");
        };

        // Respect "reduce motion": start paused on the poster frame.
        if (reduceMotion.matches) {
            video.removeAttribute("autoplay");
            video.pause();
        }
        setPaused(video.paused);

        video.addEventListener("play", function () { setPaused(false); });
        video.addEventListener("pause", function () { setPaused(true); });

        toggle.addEventListener("click", function () {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
    }
})();
