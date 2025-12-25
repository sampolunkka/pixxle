// javascript
// File: `model.js`
import { parseHexToInt } from './utils.js';
import { TRANSPARENT_SENTINEL } from './utils.js';

export function createModel() {
    let width = 0;
    let height = 0;
    let pixelSize = 16;
    let pixels = null;
    let bgColor = '#ffffff';

    return {
        get width() { return width; },
        get height() { return height; },
        get pixelSize() { return pixelSize; },
        get pixels() { return pixels; },
        get bgColor() { return bgColor; },

        init(newWidth, newHeight, providedZoom = 0, bg = '#ffffff') {
            width = Math.max(1, Math.min(256, Math.floor(newWidth) || 32));
            height = Math.max(1, Math.min(256, Math.floor(newHeight) || 32));
            pixelSize = providedZoom > 0 ? Math.max(1, Math.floor(providedZoom)) : (function(w,h){
                return Math.max(1, Math.min(
                    Math.floor((window.innerWidth * 0.8) / Math.max(1, w)) || 1,
                    Math.floor((window.innerHeight * 0.8) / Math.max(1, h)) || 1
                ));
            })(width, height);
            pixels = new Uint32Array(width * height);
            bgColor = bg;
            const bgInt = parseHexToInt(bgColor);
            pixels.fill(bgInt);
            return { width, height, pixelSize };
        },

        setPixelSize(size) {
            pixelSize = Math.max(1, Math.floor(Number(size) || 1));
        },

        clear(bg = '#ffffff') {
            bgColor = bg;
            const bgInt = parseHexToInt(bg);
            if (pixels) pixels.fill(bgInt);
        },

        // NEW: change background color/transparent state without clearing user pixels.
        // Replaces only pixels equal to the previous background value.
        setBackground(bg = '#ffffff') {
            const newBg = bg || '#ffffff';
            const newBgInt = parseHexToInt(newBg);
            const oldBgInt = parseHexToInt(bgColor);
            // update stored bgColor first so other code sees the new value
            bgColor = newBg;
            if (!pixels) return;
            if (oldBgInt === newBgInt) return;
            for (let i = 0; i < pixels.length; i++) {
                if (pixels[i] === oldBgInt) pixels[i] = newBgInt;
            }
        },

        drawPixel(x, y, cssColor) {
            if (!pixels) return;
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            // Always store opaque RGB for drawing; parseHexToInt ignores alpha for colors
            pixels[y * width + x] = parseHexToInt(cssColor);
        },

        exportPNG() {
            if (!pixels) return null;
            const out = document.createElement('canvas');
            out.width = width;
            out.height = height;
            const outCtx = out.getContext('2d');
            const img = outCtx.createImageData(width, height);
            const data = img.data;
            for (let i = 0; i < width * height; i++) {
                const v = pixels[i];
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
