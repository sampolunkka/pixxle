import {LayerRenderer} from "./layer-renderer.js";
import {LayerModel} from "./layer-model.js";
import {TRANSPARENT_SENTINEL} from "./utils.js";

export class Layer {
    constructor(width, height, canvasElement, fillColor = TRANSPARENT_SENTINEL) {
        this.model = new LayerModel(width, height, fillColor);
        this.canvas = canvasElement;
        this.canvas.width = width;
        this.canvas.height = height;
        this.renderer = new LayerRenderer(this.model, this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    render() {
        this.renderer.render();
    }
}
