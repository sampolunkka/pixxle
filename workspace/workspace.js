import {Layer} from "./layer.js";
import {TRANSPARENT_SENTINEL} from "../utils.js";

export class Workspace {
    constructor(width, height, backgroundCanvasEl, foregroundCanvasEl, overlayCanvasEl, bgColor = TRANSPARENT_SENTINEL) {
        this.layers = [
            new Layer(width, height, backgroundCanvasEl, bgColor),
            new Layer(width, height, foregroundCanvasEl),
            new Layer(width, height, overlayCanvasEl, TRANSPARENT_SENTINEL, true)
        ];
    }

    getActiveLayer() {
        return this.layers[1];
    }

    getOverlayLayer() {
        return this.layers[2];
    }

    update() {
        this.layers.forEach(layer => layer.render());
    }
}