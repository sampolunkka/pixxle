import {LayerRenderer} from "./layer-renderer.js";
import {LayerModel} from "./layer-model.js";
import {TRANSPARENT_SENTINEL} from "../utils.js";
import {Shape} from "../const.js";

export class Layer {
    constructor(width, height, canvasElement, fillColor = TRANSPARENT_SENTINEL, isOverlay = false) {
        this.model = new LayerModel(width, height, fillColor , isOverlay);
        this.canvas = canvasElement;
        this.canvas.width = width;
        this.canvas.height = height;
        this.renderer = new LayerRenderer(this.model, this.canvas, isOverlay);
    }

    draw(x, y, color, shape, size) {
        if (size === 1) {
            this.model.setPixel(x, y, color);
            return;
        }

        switch (shape) {
            case Shape.CIRCLE:
                this.model.setCircle(x, y, size, color);
                break;
            case Shape.SQUARE:
                this.model.setSquare(x, y, size, color);
                break;
            default:
                console.warn('Unknown shape:', shape);
        }
    }

    render() {
        this.renderer.render();
    }

    clear() {
        this.model.clear();
    }
}
