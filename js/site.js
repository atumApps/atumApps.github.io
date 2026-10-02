// atum Apps — site behaviour. No dependencies.
// 1. The dock: clicking an app tile shows that app's panel and hides the rest.
// 2. The hero video's pause/play button.
// Without JS every panel is simply shown, stacked, and tiles act as anchors.

(function () {
    document.documentElement.classList.add("js");

    /* ---------- Dock and panels ---------- */

    var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile[href^="#"]'));

    function show(id) {
        var found = false;
        panels.forEach(function (panel) {
            var active = panel.id === id;
            panel.classList.toggle("is-active", active);
            found = found || active;
        });
        tiles.forEach(function (tile) {
            if (tile.getAttribute("href") === "#" + id) {
                tile.setAttribute("aria-current", "true");
            } else {
                tile.removeAttribute("aria-current");
            }
        });
        return found;
    }

    function showFromHash() {
        var id = decodeURIComponent(location.hash.slice(1));
        // Fall back to the first app when the hash is empty or unknown.
        if (!id || !show(id)) {
            show(panels[0].id);
        }
    }

    if (panels.length) {
        tiles.forEach(function (tile) {
            tile.addEventListener("click", function (event) {
                var id = tile.getAttribute("href").slice(1);
                event.preventDefault();
                show(id);
                history.replaceState(null, "", "#" + id);

                // On a phone the panel is below the fold, so bring it into view.
                var panel = document.getElementById(id);
                if (panel.getBoundingClientRect().top > window.innerHeight * 0.75) {
                    panel.scrollIntoView({ block: "start" });
                }
            });
        });

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
