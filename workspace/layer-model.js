import {TRANSPARENT_SENTINEL} from "../const.js";

export class LayerModel {
    constructor(width, height, fill = TRANSPARENT_SENTINEL) {
        this.width = width;
        this.height = height;
        this.pixels = new Uint32Array(width * height);
        this.dirtyPixels = new Set();

        if (fill !== TRANSPARENT_SENTINEL) {
            this.pixels.fill(fill);
        }

        console.log('LayerModel created:', width, height);
    }

    markDirty(idx) {
        this.dirtyPixels.add(idx);
    }

    setPixels(pixels) {
        for (let i = 0; i < pixels.length; i++) {
            this.setPixel(pixels[i].x, pixels[i].y, pixels[i].color);
        }
    }

    setPixel(x, y, color) {
        // Check bounds
        if ((x || y) < 0 || x >= this.width || y >= this.height) return;

        const idx = y * this.width + x;

        if (this.pixels[idx] !== color) {
            this.pixels[idx] = color;
            this.markDirty(idx);
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
