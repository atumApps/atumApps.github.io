// atum Apps — site behaviour. No dependencies.
// 1. The dock: clicking a tile opens that panel above the dock; clicking it
//    again, the panel's X, or Escape closes it. Nothing is open by default.
//    The home page never scrolls; a tall panel scrolls inside itself (css/site.css).
// 2. The hero video's pause/play button.
// Without JS every panel is simply shown, stacked, and tiles act as anchors.

(function () {
    document.documentElement.classList.add("js");

    /* ---------- Dock and panels ---------- */

    var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile[href^="#"]'));
    var openId = null;

    // Show the panel with this id and hide the rest. A null or unknown id closes everything.
    function show(id) {
        openId = null;
        panels.forEach(function (panel) {
            var active = panel.id === id;
            panel.classList.toggle("is-active", active);
            if (active) {
                openId = id;
            }
        });
        tiles.forEach(function (tile) {
            if (openId && tile.getAttribute("href") === "#" + openId) {
                tile.setAttribute("aria-current", "true");
            } else {
                tile.removeAttribute("aria-current");
            }
        });
    }

    function open(id) {
        show(id);
        history.replaceState(null, "", "#" + id);
    }

    function close() {
        show(null);
        history.replaceState(null, "", location.pathname + location.search);
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
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && openId) {
                close();
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

    /* ---------- Hero video ---------- */

    var video = document.querySelector(".hero video");
    var toggle = document.querySelector(".video-toggle");

    if (video && toggle) {
        var setPaused = function (paused) {
            toggle.setAttribute("aria-pressed", String(paused));
            toggle.setAttribute("aria-label", paused ? "Play video" : "Pause video");
        };

        // Respect "reduce motion": start paused on the poster frame.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
