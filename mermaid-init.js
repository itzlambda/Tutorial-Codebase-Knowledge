(() => {
    const darkThemes = ['ayu', 'navy', 'coal'];
    const lightThemes = ['light', 'rust'];

    const classList = document.getElementsByTagName('html')[0].classList;

    let lastThemeWasLight = true;
    for (const cssClass of classList) {
        if (darkThemes.includes(cssClass)) {
            lastThemeWasLight = false;
            break;
        }
    }

    const theme = lastThemeWasLight ? 'default' : 'dark';
    mermaid.initialize({ startOnLoad: true, theme });
    mermaid.initialize({ startOnLoad: false, theme });

    // Load svg-pan-zoom for interactive zoom and pan
    const panZoomScript = document.createElement('script');
    panZoomScript.src = 'https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js';
    panZoomScript.onload = () => {
        mermaid.run({
            querySelector: '.mermaid',
            postRenderCallback: (id) => {
                const svg = document.getElementById(id);
                if (svg && typeof svgPanZoom === 'function') {
                    svg.removeAttribute('width');
                    svg.removeAttribute('height');
                    svgPanZoom(svg, {
                        zoomEnabled: true,
                        controlIconsEnabled: true,
                        fit: true,
                        center: true,
                        minZoom: 1,
                        maxZoom: 5,
                        zoomScaleSensitivity: 0.2
                    });
                }
            }
        });
    };
    document.head.appendChild(panZoomScript);

    // Simplest way to make mermaid re-render the diagrams in the new theme is via refreshing the page

    for (const darkTheme of darkThemes) {
        document.getElementById(darkTheme).addEventListener('click', () => {
            if (lastThemeWasLight) {
                window.location.reload();
            }
        });
    }

    for (const lightTheme of lightThemes) {
        document.getElementById(lightTheme).addEventListener('click', () => {
            if (!lastThemeWasLight) {
                window.location.reload();
            }
        });
    }
})();
