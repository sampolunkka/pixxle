import {TRANSPARENT_SENTINEL} from "../const.js";

export class LayerModel {
    constructor(width, height, fill = TRANSPARENT_SENTINEL) {
        this.width = width;
        this.height = height;
        this.pixels = new Uint32Array(width * height);
        this.dirtyPixels = this.dirtyPixels = new Set(Array.from({length: this.width * this.height}, (_, i) => i));

        if (fill !== TRANSPARENT_SENTINEL) {
            this.pixels.fill(fill);
        }

        console.log('LayerModel created:', width, height);
    }

    markDirty(idx) {
        this.dirtyPixels.add(idx);
    }

    setPixel(x, y, color) {
        const idx = y * this.width + x;
        if (this.pixels[idx] !== color) {
            this.pixels[idx] = color;
            this.markDirty(idx);
        }
    }

    setCircle(x, y, size, color) {
        const radius = Math.floor(size / 2);
        const r2 = radius * radius;
        for (let dy = -radius; dy <= radius; dy++) {
            const py = y + dy;
            if (py < 0 || py >= this.height) continue;
            const dxLimit = Math.floor(Math.sqrt(r2 - dy * dy));
            const startX = Math.max(0, x - dxLimit);
            const endX = Math.min(this.width - 1, x + dxLimit);
            for (let px = startX; px <= endX; px++) {
                const idx = py * this.width + px;
                if (this.pixels[idx] !== color) {
                    this.pixels[idx] = color;
                    this.markDirty(idx);
                }
            }
        }
    }

    setSquare(x, y, size, color) {
        const half = Math.floor(size / 2);
        const startY = Math.max(0, y - half);
        const endY = Math.min(this.height - 1, y + half);
        const startX = Math.max(0, x - half);
        const endX = Math.min(this.width - 1, x + half);

        for (let py = startY; py <= endY; py++) {
            for (let px = startX; px <= endX; px++) {
                const idx = py * this.width + px;
                if (this.pixels[idx] !== color) {
                    this.pixels[idx] = color;
                    this.markDirty(idx);
                }
            }
        }
    }

    getPixel(x, y) {
        return this.pixels[y * this.width + x];
    }

    clear() {
        this.pixels.fill(TRANSPARENT_SENTINEL);
        this.dirtyPixels = new Set(Array.from({length: this.width * this.height}, (_, i) => i));
    }

    clearDirty() {
        this.dirtyPixels.clear();
    }
}
