// javascript
import { parseHexToInt, computeAutoZoom } from './utils.js';

export function createModel() {
    let cols = 0;
    let rows = 0;
    let pixelSize = 16;
    let pixels = null;
    let bgColor = '#ffffff';

    return {
        get cols() { return cols; },
        get rows() { return rows; },
        get pixelSize() { return pixelSize; },
        get pixels() { return pixels; },
        get bgColor() { return bgColor; },

        init(newCols, newRows, providedZoom = 0) {
            cols = Math.max(1, Math.min(256, Math.floor(newCols) || 32));
            rows = Math.max(1, Math.min(256, Math.floor(newRows) || 32));
            pixelSize = providedZoom > 0 ? Math.max(1, Math.floor(providedZoom)) : computeAutoZoom(cols, rows);
            pixels = new Uint32Array(cols * rows);
            const bgInt = parseHexToInt(bgColor);
            pixels.fill(bgInt);
            return { cols, rows, pixelSize };
        },

        setPixelSize(size) {
            pixelSize = Math.max(1, Math.floor(Number(size) || 1));
        },

        clear(bg = '#ffffff') {
            bgColor = bg;
            const bgInt = parseHexToInt(bg);
            if (pixels) pixels.fill(bgInt);
        },

        drawPixel(x, y, cssColor) {
            if (!pixels) return;
            if (x < 0 || x >= cols || y < 0 || y >= rows) return;
            pixels[y * cols + x] = parseHexToInt(cssColor);
        },

        exportPNG() {
            if (!pixels) return null;
            const out = document.createElement('canvas');
            out.width = cols;
            out.height = rows;
            const outCtx = out.getContext('2d');
            outCtx.imageSmoothingEnabled = false;
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const c = pixels[y * cols + x] || 0;
                    outCtx.fillStyle = '#' + c.toString(16).padStart(6, '0');
                    outCtx.fillRect(x, y, 1, 1);
                }
            }
            return out.toDataURL('image/png');
        }
    };
}
