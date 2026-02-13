import {Layer} from "./layer.js";
import {TRANSPARENT_SENTINEL} from "../const.js";

export class Workspace {
    constructor(width, height, backgroundCanvasEl, foregroundCanvasEl, bgColor = TRANSPARENT_SENTINEL, renderOnCreation = true) {

        this.width = width;
        this.height = height;
        this.activeLayerIdx = 1;

        this.layers = [
            new Layer(width, height, backgroundCanvasEl, bgColor, true),
            new Layer(width, height, foregroundCanvasEl)
        ];

        if (renderOnCreation) {
            this.layers.forEach((layer, index) => {
                layer.setZIndex(index + 1);
                layer.renderInitial();
            });
        }
    }

    addLayer(canvasElement) {
        const newLayer = new Layer(
            this.width,
            this.height,
            canvasElement
        );
        this.layers.push(newLayer);
        return newLayer;
    }

    setActiveLayer(idx) {
        this.activeLayerIdx = idx;
    }

    getActiveLayer() {
        return this.layers[this.activeLayerIdx];
    }

    update() {
        this.layers.forEach((layer, index) => {
            layer.setZIndex(index + 1);
            layer.render();
        });
    }

    clearOverlays() {
        this.layers.forEach((layer, index) => {
            layer.clearPreviousOverlayBox();
            layer.render();
        })
    }
}