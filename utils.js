// File: `utils.js`
export const TRANSPARENT_SENTINEL = 0xFFFFFFFF;

export function parseHexToInt(hex) {
    if (!hex || hex[0] !== '#') return 0;
    const s = hex.slice(1).toLowerCase();

    // #rrggbbaa (8) -> treat alpha '00' as transparent sentinel,
    // otherwise ignore alpha and return rgb only (opaque)
    if (s.length === 8) {
        const rgb = s.slice(0, 6);
        const a = s.slice(6, 8);
        if (a === '00') return TRANSPARENT_SENTINEL;
        return parseInt(rgb, 16) || 0;
    }

    // #rrggbb (6)
    if (s.length === 6) return parseInt(s, 16) || 0;

    // short form #rgb -> expand to rrggbb
    if (s.length === 3) {
        const r = s[0] + s[0];
        const g = s[1] + s[1];
        const b = s[2] + s[2];
        return parseInt(r + g + b, 16) || 0;
    }

    return 0;
}

export function intToCss(i) {
    if (i === TRANSPARENT_SENTINEL) return 'rgba(0,0,0,0)';
    return '#' + (i >>> 0).toString(16).padStart(6, '0');
}

export function clampInt(v, min, max) {
    return Math.max(min, Math.min(max, Math.floor(Number(v) || 0)));
}

/*
 Compute largest integer pixel size so a width x height grid fits within 80% of viewport.
 Ensures at least 1.
*/
export function computeAutoZoom(width, height) {
    const maxW = Math.floor((window.innerWidth * 0.8) / Math.max(1, width)) || 1;
    const maxH = Math.floor((window.innerHeight * 0.8) / Math.max(1, height)) || 1;
    return Math.max(1, Math.min(maxW, maxH));
}
