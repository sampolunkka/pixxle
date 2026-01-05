import {LayerRenderer} from './layer-renderer.js';
import {LayerModel} from './layer-model.js';
import {TRANSPARENT_SENTINEL} from '../const.js';
import {Shape} from '../const.js';

export class Layer {
    constructor(width, height, canvasElement, fillColor = TRANSPARENT_SENTINEL, locked = false, zIndex = 0) {
        // Layer properties
        this.width = width;
        this.height = height;
        this.locked = locked;
        this.visible = true;
        this.zIndex = 0;

        // Layer model
        this.model = new LayerModel(width, height, fillColor);

        // Overlay (staged) model
        this.overlay = new LayerModel(width, height, TRANSPARENT_SENTINEL);
        this.modifiedIndices = new Set();
        this.previousOverlay = null;

        // Canvas setup
        this.canvas = canvasElement;
        this.canvas.style.zIndex = zIndex;
        this.canvas.width = width;
        this.canvas.height = height;
        this.renderer = new LayerRenderer(this, this.canvas);
    }

    draw(x, y, color, shape, size) {
        if (size === 1) {
            this.model.setPixel(x, y, color);
        } else {
            switch (shape) {
                case Shape.CIRCLE:
                    this.model.setCircle(x, y, size, color);
                    break;
                case Shape.SQUARE:
                    this.model.setSquare(x, y, size, color);
                    break;
            }
        }
    }

    drawOverlay(x, y, color, shape, size) {
        if (size === 1) {
            this.overlay.setPixel(x, y, color);
        } else {
            switch (shape) {
                case Shape.CIRCLE:
                    this.overlay.setCircle(x, y, size, color);
                    break;
                case Shape.SQUARE:
                    this.overlay.setSquare(x, y, size, color);
                    break;
            }
        }

        this.previousOverlay = {x, y, size};
    }

    clearPreviousOverlayBox() {
        if (!this.previousOverlay) return;
        const {x, y, size} = this.previousOverlay;
        this.overlay.setSquare(x, y, size, TRANSPARENT_SENTINEL);
        this.previousOverlay = null;
    }

    clearOverlay() {
        this.overlay.clear();
    }

    render() {
        this.renderer.render();
    }

    clear() {
        this.model.clear();
        this.clearOverlay();
    }

    setZIndex(zIndex) {
        this.zIndex = zIndex;
        this.canvas.style.zIndex = zIndex;
    }
}
