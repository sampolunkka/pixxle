import {Layer} from "./layer.js";
import {TRANSPARENT_SENTINEL} from "../const.js";

class Workspace {
    constructor() {
        this.width = null;
        this.height = null;
        this.layers = [];
    }

    init(width, height, canvasElements) {
        this.width = width;
        this.height = height;

        canvasElements.forEach((canvasElement, index) => {
            const layer = this.addLayer(canvasElement);
            layer.setZIndex(index + 1);
            layer.renderInitial();
        });

        this.activeLayerIdx = this.layers.length - 1;
        console.log('workspace initialized');
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

    removeLayer(idx) {
        if (idx < 0 || idx >= this.layers.length) return;

        // If removing last layer, clear instead
        if (this.layers.length === 1) {
            this.layers[0].clear();
            return;
        }

        this.layers[idx].canvas.remove();
        this.layers.splice(idx, 1);

        // Keep index in place when removing layers
        if (this.activeLayerIdx === idx) {
            this.activeLayerIdx = Math.min(this.layers.length - 1, this.activeLayerIdx);
        } else if (idx < this.activeLayerIdx) {
            this.activeLayerIdx = Math.max(0, this.activeLayerIdx - 1);
        } else {
            this.activeLayerIdx = Math.min(this.layers.length - 1, this.activeLayerIdx);
        }
    }

    setActiveLayer(idx) {
        this.activeLayerIdx = idx;
    }

    getActiveLayer() {
        return this.layers[this.activeLayerIdx];
    }

    getCanvasBoundingClientRect() {
        return this.layers[0].canvas.getBoundingClientRect();
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

export const workspace = new Workspace();