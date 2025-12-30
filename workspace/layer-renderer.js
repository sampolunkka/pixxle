import {intToSixBitHex, TRANSPARENT_SENTINEL} from "../utils.js";

export class LayerRenderer {
    constructor(model, canvasElement, clearOnRender = false) {
        this.clearOnRender = clearOnRender;
        this.model = model;
        this.canvas = canvasElement;

        console.log('LayerRenderer created for canvas:', canvasElement);
    }

    render() {
        const ctx = this.canvas.getContext('2d');

        if (this.clearOnRender) {
            ctx.clearRect(0, 0, this.model.width, this.model.height);
        }

        for (const idx of this.model.getDirtyPixels()) {
            const x = idx % this.model.width;
            const y = Math.floor(idx / this.model.width);
            const color = this.model.getPixel(x, y);
            if (color === TRANSPARENT_SENTINEL) continue;
            ctx.fillStyle = intToSixBitHex(color);
            ctx.fillRect(x, y, 1, 1);
        }
        this.model.clearDirty();
    }
}