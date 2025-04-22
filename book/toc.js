// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="AutoGen Core/index.html"><strong aria-hidden="true">1.</strong> AutoGen Core</a></li><li class="chapter-item expanded "><a href="Browser Use/index.html"><strong aria-hidden="true">2.</strong> Browser Use</a></li><li class="chapter-item expanded "><a href="Celery/index.html"><strong aria-hidden="true">3.</strong> Celery</a></li><li class="chapter-item expanded "><a href="Click/index.html"><strong aria-hidden="true">4.</strong> Click</a></li><li class="chapter-item expanded "><a href="Codex/index.html"><strong aria-hidden="true">5.</strong> Codex</a></li><li class="chapter-item expanded "><a href="Crawl4AI/index.html"><strong aria-hidden="true">6.</strong> Crawl4AI</a></li><li class="chapter-item expanded "><a href="CrewAI/index.html"><strong aria-hidden="true">7.</strong> CrewAI</a></li><li class="chapter-item expanded "><a href="DSPy/index.html"><strong aria-hidden="true">8.</strong> DSPy</a></li><li class="chapter-item expanded "><a href="FastAPI/index.html"><strong aria-hidden="true">9.</strong> FastAPI</a></li><li class="chapter-item expanded "><a href="Flask/index.html"><strong aria-hidden="true">10.</strong> Flask</a></li><li class="chapter-item expanded "><a href="Google A2A/index.html"><strong aria-hidden="true">11.</strong> Google A2A</a></li><li class="chapter-item expanded "><a href="LangGraph/index.html"><strong aria-hidden="true">12.</strong> LangGraph</a></li><li class="chapter-item expanded "><a href="LevelDB/index.html"><strong aria-hidden="true">13.</strong> LevelDB</a></li><li class="chapter-item expanded "><a href="MCP Python SDK/index.html"><strong aria-hidden="true">14.</strong> MCP Python SDK</a></li><li class="chapter-item expanded "><a href="NumPy Core/index.html"><strong aria-hidden="true">15.</strong> NumPy Core</a></li><li class="chapter-item expanded "><a href="OpenManus/index.html"><strong aria-hidden="true">16.</strong> OpenManus</a></li><li class="chapter-item expanded "><a href="Pydantic Core/index.html"><strong aria-hidden="true">17.</strong> Pydantic Core</a></li><li class="chapter-item expanded "><a href="Requests/index.html"><strong aria-hidden="true">18.</strong> Requests</a></li><li class="chapter-item expanded "><a href="SmolaAgents/index.html"><strong aria-hidden="true">19.</strong> SmolaAgents</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString();
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
