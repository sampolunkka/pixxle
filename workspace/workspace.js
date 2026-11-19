import {Layer} from "./layer.js";
import {TRANSPARENT_SENTINEL} from "../const.js";

class Workspace {
    constructor() {
        this.width = null;
        this.height = null;
        this.zoom = 1;
        this.layers = [];
    }

    init(width, height, canvasElements, zoom) {
        this.width = width;
        this.height = height;
        this.zoom = zoom;

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

    getTopLayer() {
        return this.layers[this.layers.length - 1];
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

    setZoom(zoom) {
        this.zoom = zoom;
    }

    getZoom() {
        return this.zoom;
    }

    clientCoordsToWorkspaceCoords(clientX, clientY) {
        const rect = this.getCanvasBoundingClientRect();
        const zoom = this.zoom;
        const x = Math.floor((clientX - rect.left) / zoom);
        const y = Math.floor((clientY - rect.top) / zoom);
        return { x, y };
    }
}

export const workspace = new Workspace();