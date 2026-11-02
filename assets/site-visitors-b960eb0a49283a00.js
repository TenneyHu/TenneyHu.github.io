/* Official SuperCounters widgets. Counters begin at zero when installed. */
(() => {
  'use strict';

  const MAP_ID = 1740170;
  const COUNT_ID = 1740171;

  function mountSiteVisitors() {
    const map = document.getElementById('site-visitor-map');
    const count = document.getElementById('site-visitor-count');
    if (!map || !count || map.dataset.started) return;
    // Keep local previews from contributing visits to the public counters.
    if (window.location.hostname !== 'tenneyhu.github.io') return;
    map.dataset.started = 'true';
    map.setAttribute('aria-busy', 'true');

    // Retain a normal, accessible HTTPS link around the legacy map widget.
    map.addEventListener('click', event => {
      event.stopPropagation();
    }, true);

    function renderVisitorLocations(id, serialized) {
      if (Number(id) !== MAP_ID) return;
      let points;
      try {
        points = JSON.parse(serialized.trim().replace(/^\(/, '').replace(/\)$/, ''));
      } catch (_) {
        map.removeAttribute('aria-busy');
        return;
      }
      if (!Array.isArray(points)) return;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 420 210');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      for (const point of points) {
        const lat = Number(point.la), lon = Number(point.lo);
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', ((lon + 180) * 420 / 360).toFixed(2));
        dot.setAttribute('cy', ((90 - lat) * 210 / 180).toFixed(2));
        dot.setAttribute('r', '4');
        dot.setAttribute('fill', '#b79a5d');
        dot.setAttribute('stroke', '#ffffff');
        dot.setAttribute('stroke-width', '1.2');
        svg.appendChild(dot);
      }
      const previous = map.querySelector('svg');
      if (previous) previous.remove();
      map.appendChild(svg);
      map.removeAttribute('aria-busy');
    }

    const countObserver = new MutationObserver(() => {
      const result = count.querySelector('p a');
      if (!result) return;
      const fallback = document.getElementById('site-visitor-fallback');
      if (fallback) fallback.hidden = true;
      result.href = result.href.replace(/^http:/, 'https:');
      result.target = '_blank';
      result.rel = 'noopener noreferrer';
      countObserver.disconnect();
    });
    countObserver.observe(count, { childList: true });

    window.sc_map_var = window.sc_map_var || [];
    const mapScript = document.createElement('script');
    mapScript.src = 'https://widget.supercounters.com/ssl/map.js';
    mapScript.async = true;
    mapScript.onload = () => {
      // Keep the official tracking call; render its real coordinates on a local SVG
      // because the provider's legacy bitmap generator currently fails server-side.
      window.sc_show_map = renderVisitorLocations;
      window.sc_map(MAP_ID, 'f8fafc', 'b79a5d', 50);
    };
    mapScript.onerror = () => {
      map.removeAttribute('aria-busy');
    };
    map.appendChild(mapScript);

    window.sc_texthit_var = window.sc_texthit_var || [];
    const countScript = document.createElement('script');
    countScript.src = 'https://widget.supercounters.com/ssl/texthit.js';
    countScript.async = true;
    countScript.onload = () => window.sc_text_hit(COUNT_ID, 'visits', '78716c');
    countScript.onerror = () => countObserver.disconnect();
    count.appendChild(countScript);
  }

  window.mountSiteVisitors = mountSiteVisitors;
  mountSiteVisitors();
})();
