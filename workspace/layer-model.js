import {TRANSPARENT_SENTINEL} from "../const.js";

export class LayerModel {
    constructor(width, height, fill = TRANSPARENT_SENTINEL) {
        this.width = width;
        this.height = height;
        this.pixels = new Uint32Array(width * height);

        if (fill !== TRANSPARENT_SENTINEL) {
            this.pixels.fill(fill);
        }

        console.log('LayerModel created:', width, height);
    }

    setPixel(x, y, color) {
        const idx = y * this.width + x;
        if (this.pixels[idx] !== color) {
            this.pixels[idx] = color;
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
            const rowStart = py * this.width + startX;
            const rowEnd = py * this.width + endX + 1;
            this.pixels.fill(color, rowStart, rowEnd);
        }
    }

    setSquare(x, y, size, color) {
        const half = Math.floor(size / 2);
        const startY = Math.max(0, y - half);
        const endY = Math.min(this.height - 1, y + half);
        const startX = Math.max(0, x - half);
        const endX = Math.min(this.width - 1, x + half);

        for (let py = startY; py <= endY; py++) {
            const rowStart = py * this.width + startX;
            const rowEnd = py * this.width + endX + 1;
            this.pixels.fill(color, rowStart, rowEnd);
        }
    }

    getPixel(x, y) {
        return this.pixels[y * this.width + x];
    }

    clear() {
        this.pixels.fill(TRANSPARENT_SENTINEL);
    }
}
