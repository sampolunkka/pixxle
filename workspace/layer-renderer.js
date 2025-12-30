// workspace/layer-renderer.js
import {intToSixBitHex} from '../utils.js';
import {ERASED_SENTINEL, TRANSPARENT_SENTINEL} from '../const.js';

export class LayerRenderer {
    constructor(layer, canvasElement) {
        this.layer = layer;
        this.canvas = canvasElement;
    }

    render() {
        const ctx = this.canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const width = this.layer.committed.width;
        const committed = this.layer.committed.pixels;
        const staged = this.layer.staged.pixels;

        // Render only dirty pixels
        const dirty = new Set([
            ...this.layer.committed.dirtyPixels,
            ...this.layer.staged.dirtyPixels
        ]);
        for (const i of dirty) {
            const x = i % width;
            const y = Math.floor(i / width);
            const color = staged[i] !== TRANSPARENT_SENTINEL ? staged[i] : committed[i];
            if (color === TRANSPARENT_SENTINEL || color === ERASED_SENTINEL) {
                ctx.clearRect(x, y, 1, 1);
            } else {
                ctx.fillStyle = intToSixBitHex(color);
                ctx.fillRect(x, y, 1, 1);
            }
        }

        this.layer.committed.clearDirty();
        this.layer.staged.clearDirty();
    }
}
