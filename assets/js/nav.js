(function () {
    var NAV_ITEMS = [
        { href: "index.html", label: "Home", id: "home" },
        { href: "about-me/index.html", label: "About Me", id: "about" },
        { href: "cybersecurity/index.html", label: "Cybersecurity", id: "cyber" },
        { href: "software/index.html", label: "Software Projects", id: "software" },
        { href: "resume/index.html", label: "Resume", id: "resume" },
        { href: "achievements/index.html", label: "Achievements", id: "achievements" },
        { href: "contact/index.html", label: "Contact", id: "contact" },
    ];

    function buildNav() {
        var el = document.getElementById("site-nav");
        if (!el) return;

        var root = el.getAttribute("data-root") || "";
        var page = el.getAttribute("data-page") || "";

        var links = NAV_ITEMS.map(function (item) {
            var cls = item.id === page ? "active" : "";
            return (
                '<li><a href="' +
                root +
                item.href +
                '" class="' +
                cls +
                '">' +
                item.label +
                "</a></li>"
            );
        }).join("");

        el.innerHTML =
            '<a href="' +
            root +
            'index.html" class="nav-brand">Cristian Diaz</a>' +
            '<ul class="nav-links">' +
            links +
            "</ul>";
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", buildNav);
    } else {
        buildNav();
    }
})();
