import {intToSixBitHex} from '../utils.js';
import {ERASED_SENTINEL, TRANSPARENT_SENTINEL} from '../const.js';

export class LayerRenderer {
    constructor(layer, canvasElement) {
        this.layer = layer;
        this.canvas = canvasElement;
    }

    render() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.layer.committed.width, this.layer.committed.height);

        const width = this.layer.committed.width;
        const height = this.layer.committed.height;
        const committed = this.layer.committed.pixels;
        const staged = this.layer.staged.pixels;

        for (let i = 0; i < committed.length; i++) {
            const x = i % width;
            const y = Math.floor(i / width);
            const color = staged[i] !== TRANSPARENT_SENTINEL ? staged[i] : committed[i];
            if (color === TRANSPARENT_SENTINEL) continue;
            if (color === ERASED_SENTINEL) {
                ctx.clearRect(x, y, 1, 1);
                continue;
            }
            ctx.fillStyle = intToSixBitHex(color);
            ctx.fillRect(x, y, 1, 1);
        }
    }
}
