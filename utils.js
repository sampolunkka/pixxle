// javascript
export function parseHexToInt(hex) {
    if (!hex || hex[0] !== '#') return 0;
    return parseInt(hex.slice(1), 16) || 0;
}

export function intToCss(i) {
    return '#' + (i >>> 0).toString(16).padStart(6, '0');
}

export function clampInt(v, min, max) {
    return Math.max(min, Math.min(max, Math.floor(Number(v) || 0)));
}

/*
 Compute largest integer pixel size so a cols x rows grid fits within 80% of viewport.
 Ensures at least 1.
*/
export function computeAutoZoom(cols, rows) {
    const maxW = Math.floor((window.innerWidth * 0.8) / Math.max(1, cols)) || 1;
    const maxH = Math.floor((window.innerHeight * 0.8) / Math.max(1, rows)) || 1;
    return Math.max(1, Math.min(maxW, maxH));
}