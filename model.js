// File: `model.js`
import { parseHexToInt } from './utils.js';
import { TRANSPARENT_SENTINEL } from './utils.js';

export function createModel() {
    let width = 0;
    let height = 0;
    let pixelSize = 16;
    let bgColor = '#ffffff';
    let bgPixels = null; // background layer
    let fgPixels = null; // foreground layer
    let previewPixels = null; // preview layer

    // Composite cache
    let _compositeCache = null;
    let _dirty = true;

    function compositePixels(includePreview = false) {
        if (!bgPixels || !fgPixels) return null;
        if (!_dirty && _compositeCache && !includePreview) return _compositeCache;
        const out = new Uint32Array(width * height);
        for (let i = 0; i < out.length; i++) {
            if (includePreview && previewPixels && previewPixels[i] !== TRANSPARENT_SENTINEL) {
                out[i] = previewPixels[i];
            } else if (fgPixels[i] !== TRANSPARENT_SENTINEL) {
                out[i] = fgPixels[i];
            } else {
                out[i] = bgPixels[i];
            }
        }
        if (!includePreview) {
            _compositeCache = out;
            _dirty = false;
        }
        return out;
    }

    return {
        get width() { return width; },
        get height() { return height; },
        get pixelSize() { return pixelSize; },
        get bgColor() { return bgColor; },
        // Expose only the composited pixels (without preview)
        get pixels() { return compositePixels(false); },
        // Expose composited pixels with preview (for renderer)
        get previewComposite() { return compositePixels(true); },

        init(newWidth, newHeight, providedZoom = 0, bg = '#ffffff') {
            width = Math.max(1, Math.min(256, Math.floor(newWidth) || 32));
            height = Math.max(1, Math.min(256, Math.floor(newHeight) || 32));
            pixelSize = providedZoom > 0 ? Math.max(1, Math.floor(providedZoom)) : (function(w, h) {
                // Compute auto zoom (see utils.js)
                const maxW = Math.floor((window.innerWidth * 0.8) / Math.max(1, w)) || 1;
                const maxH = Math.floor((window.innerHeight * 0.8) / Math.max(1, h)) || 1;
                return Math.max(1, Math.min(maxW, maxH));
            })(width, height);
            bgColor = bg;
            const bgInt = parseHexToInt(bgColor);
            bgPixels = new Uint32Array(width * height);
            fgPixels = new Uint32Array(width * height);
            previewPixels = new Uint32Array(width * height);
            bgPixels.fill(bgInt);
            fgPixels.fill(TRANSPARENT_SENTINEL);
            previewPixels.fill(TRANSPARENT_SENTINEL);
            _dirty = true;
            _compositeCache = null;
            return { width, height, pixelSize };
        },

        setPixelSize(size) {
            pixelSize = Math.max(1, Math.floor(Number(size) || 1));
        },

        clear(bg = '#ffffff') {
            bgColor = bg;
            const bgInt = parseHexToInt(bg);
            if (bgPixels) bgPixels.fill(bgInt);
            if (fgPixels) fgPixels.fill(TRANSPARENT_SENTINEL);
            if (previewPixels) previewPixels.fill(TRANSPARENT_SENTINEL);
            _dirty = true;
            _compositeCache = null;
        },

        setBackground(bg = '#ffffff') {
            const newBg = bg || '#ffffff';
            const newBgInt = parseHexToInt(newBg);
            const oldBgInt = parseHexToInt(bgColor);
            bgColor = newBg;
            if (!bgPixels) return;
            if (oldBgInt === newBgInt) return;
            for (let i = 0; i < bgPixels.length; i++) {
                if (bgPixels[i] === oldBgInt) bgPixels[i] = newBgInt;
            }
            _dirty = true;
            _compositeCache = null;
        },

        drawPixel(x, y, cssColor) {
            if (!fgPixels) return;
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            fgPixels[y * width + x] = parseHexToInt(cssColor);
            _dirty = true;
            _compositeCache = null;
        },

        erasePixel(x, y) {
            if (!fgPixels) return;
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            fgPixels[y * width + x] = TRANSPARENT_SENTINEL;
            _dirty = true;
            _compositeCache = null;
        },

        // --- Preview Layer API ---
        setPreviewPixel(x, y, cssColor) {
            if (!previewPixels) return;
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            previewPixels[y * width + x] = parseHexToInt(cssColor);
            console.log("setPreviewPixel", x, y, cssColor);
        },

        clearPreview() {
            if (!previewPixels) return;
            previewPixels.fill(TRANSPARENT_SENTINEL);
        },

        getPreviewPixels() {
            return previewPixels;
        },

        exportPNG() {
            const composite = compositePixels();
            if (!composite) return null;
            const out = document.createElement('canvas');
            out.width = width;
            out.height = height;
            const outCtx = out.getContext('2d');
            const img = outCtx.createImageData(width, height);
            const data = img.data;
            for (let i = 0; i < width * height; i++) {
                const v = composite[i];
                const base = i * 4;
                if (v === TRANSPARENT_SENTINEL) {
                    data[base + 0] = 0;
                    data[base + 1] = 0;
                    data[base + 2] = 0;
                    data[base + 3] = 0;
                } else {
                    data[base + 0] = (v >> 16) & 0xFF;
                    data[base + 1] = (v >> 8) & 0xFF;
                    data[base + 2] = v & 0xFF;
                    data[base + 3] = 255;
                }
            }
            outCtx.putImageData(img, 0, 0);
            return out.toDataURL('image/png');
        }
    };
}
