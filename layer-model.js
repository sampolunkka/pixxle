import {TRANSPARENT_SENTINEL} from "./utils.js";

export class LayerModel {
    constructor(width, height, fill = TRANSPARENT_SENTINEL) {
        this.width = width;
        this.height = height;
        this.pixels = new Uint32Array(width * height);
        this.dirty = new Set();

        if (fill !== TRANSPARENT_SENTINEL) {
            this.pixels.fill(fill);
            for (let i = 0; i < this.pixels.length; i++) {
                this.dirty.add(i);
            }
        }

        console.log('LayerModel created:', width, height);
    }

    setPixel(x, y, color) {
        const idx = y * this.width + x;
        if (this.pixels[idx] !== color) {
            this.pixels[idx] = color;
            this.dirty.add(idx);
        }
    }

    getDirtyPixels() {
        return Array.from(this.dirty);
    }

    clearDirty() {
        this.dirty.clear();
    }

    getPixel(x, y) {
        return this.pixels[y * this.width + x];
    }
}
