/* Portfolio FX: typing effect, count-up, scroll reveal */
(function () {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── Typing effect ──
       <span data-typed='["text 1","text 2"]'></span>
       Appends a blinking cursor automatically. */
    function initTyped() {
        var nodes = document.querySelectorAll("[data-typed]");
        nodes.forEach(function (node) {
            var phrases;
            try {
                phrases = JSON.parse(node.getAttribute("data-typed"));
            } catch (e) {
                phrases = [node.getAttribute("data-typed")];
            }
            if (!phrases || !phrases.length) return;

            node.textContent = "";
            var caret = document.createElement("span");
            caret.className = "typed-cursor";
            node.appendChild(caret);

            if (reduced) {
                node.insertBefore(document.createTextNode(phrases[0]), caret);
                return;
            }

            var idx = 0;
            var ch = 0;
            var deleting = false;

            function tick() {
                var word = phrases[idx];
                if (!deleting) {
                    ch++;
                    if (ch > word.length) {
                        deleting = true;
                        setTimeout(tick, 1500);
                        return;
                    }
                } else {
                    ch--;
                    if (ch === 0) {
                        deleting = false;
                        idx = (idx + 1) % phrases.length;
                    }
                }
                if (node.firstChild && node.firstChild.nodeType === 3) {
                    node.firstChild.nodeValue = word.substring(0, ch);
                } else {
                    node.insertBefore(document.createTextNode(word.substring(0, ch)), caret);
                }
                setTimeout(tick, deleting ? 40 : 75);
            }
            tick();
        });
    }

    /* ── Count-up ──
       <span data-count="100" data-suffix="+">0</span> */
    function animateCount(el) {
        var target = parseFloat(el.getAttribute("data-count")) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        var prefix = el.getAttribute("data-prefix") || "";
        var duration = parseInt(el.getAttribute("data-duration"), 10) || 1400;

        if (reduced) {
            el.textContent = prefix + target + suffix;
            return;
        }

        var start = performance.now();
        function step(now) {
            var p = Math.min(1, (now - start) / duration);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = Math.round(eased * target);
            el.textContent = prefix + val + suffix;
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function initCounters() {
        var els = document.querySelectorAll("[data-count]");
        if (!("IntersectionObserver" in window)) {
            els.forEach(animateCount);
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        els.forEach(function (el) { io.observe(el); });
    }

    /* ── Scroll reveal ── */
    function initReveal() {
        var els = document.querySelectorAll(".reveal");
        if (!("IntersectionObserver" in window) || reduced) {
            els.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var delay = parseInt(entry.target.getAttribute("data-delay"), 10) || 0;
                    setTimeout(function () {
                        entry.target.classList.add("is-visible");
                    }, delay);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        els.forEach(function (el) { io.observe(el); });
    }

    /* ── Live clock + date ──
       <span data-clock></span>  -> HH:MM:SS
       <span data-date></span>   -> YYYY-MM-DD */
    function pad(n) { return n < 10 ? "0" + n : "" + n; }

    function initClock() {
        var clocks = document.querySelectorAll("[data-clock]");
        var dates = document.querySelectorAll("[data-date]");
        if (!clocks.length && !dates.length) return;

        function tick() {
            var now = new Date();
            var t = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
            var d = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
            clocks.forEach(function (el) { el.textContent = t; });
            dates.forEach(function (el) { el.textContent = d; });
        }
        tick();
        setInterval(tick, 1000);
    }

    /* ── Uptime ticker ──
       <span data-uptime="142d 09:43:12"></span>
       Parses initial value, then increments every second. */
    function parseUptime(str) {
        // Accept formats like "142d 09:43:12" or "09:43:12"
        var m = /^(?:(\d+)d\s+)?(\d{2}):(\d{2}):(\d{2})$/.exec((str || "").trim());
        if (!m) return null;
        return {
            d: parseInt(m[1] || "0", 10),
            h: parseInt(m[2], 10),
            m: parseInt(m[3], 10),
            s: parseInt(m[4], 10),
        };
    }

    function fmtUptime(u) {
        return u.d + "d " + pad(u.h) + ":" + pad(u.m) + ":" + pad(u.s);
    }

    function initUptime() {
        var nodes = document.querySelectorAll("[data-uptime]");
        if (!nodes.length) return;

        var states = [];
        nodes.forEach(function (n) {
            var u = parseUptime(n.getAttribute("data-uptime")) || { d: 0, h: 0, m: 0, s: 0 };
            states.push({ el: n, u: u });
            n.textContent = fmtUptime(u);
        });

        setInterval(function () {
            states.forEach(function (st) {
                st.u.s++;
                if (st.u.s >= 60) { st.u.s = 0; st.u.m++; }
                if (st.u.m >= 60) { st.u.m = 0; st.u.h++; }
                if (st.u.h >= 24) { st.u.h = 0; st.u.d++; }
                st.el.textContent = fmtUptime(st.u);
            });
        }, 1000);
    }

    /* ── Progress fill ──
       <div class="progress-fill" data-fill="70"></div>
       Animates width: 0% → N% when scrolled into view. */
    function initProgress() {
        var els = document.querySelectorAll(".progress-fill[data-fill]");
        if (!els.length) return;

        function fill(el) {
            var pct = parseFloat(el.getAttribute("data-fill")) || 0;
            // Defer one frame so the transition triggers after layout.
            requestAnimationFrame(function () { el.style.width = pct + "%"; });
        }

        if (!("IntersectionObserver" in window) || reduced) {
            els.forEach(fill);
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    fill(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.35 });
        els.forEach(function (el) { io.observe(el); });
    }

    function init() {
        initTyped();
        initCounters();
        initReveal();
        initClock();
        initUptime();
        initProgress();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
