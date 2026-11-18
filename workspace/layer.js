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
        this.bgColor = fillColor;
        this.name = '';
        this.stagedIdx = [];

        // Layer model
        this.model = new LayerModel(width, height, fillColor);

        // Overlay (staged) model
        this.overlay = new LayerModel(width, height, TRANSPARENT_SENTINEL);
        this.previousOverlay = null;

        // Canvas setup
        this.canvas = canvasElement;
        this.canvas.style.zIndex = zIndex;
        this.canvas.width = width;
        this.canvas.height = height;
        this.renderer = new LayerRenderer(this, this.canvas);
        console.log(`Layer created with canvasElement: ${canvasElement}, width: ${width}, height: ${height}, fillColor: ${fillColor}, locked: ${locked}, zIndex: ${zIndex}`);
    }

    draw(pixels) {
        this.model.setPixels(pixels);
    }

    stage(pixels) {
        this.clearStaged();
        for (const { x, y, color } of pixels) {
            if (x < 0 || y < 0 || x >= this.width || y >= this.height) continue;
            const idx = y * this.width + x;
            this.overlay.pixels[idx] = color;
            this.overlay.markDirty(idx);
            this.stagedIdx.push(idx);
        }
    }

    clearStaged() {
        for (const idx of this.stagedIdx) {
            this.overlay.pixels[idx] = TRANSPARENT_SENTINEL;
            this.overlay.markDirty(idx);           // renderer repaints it from the model
        }
        this.stagedIdx.length = 0;
    }

    renderInitial() {
        this.renderer.renderInitial(this.bgColor);
    }

    render() {
        this.renderer.render();
    }

    clear() {
        this.model = new LayerModel(this.width, this.height, this.bgColor);
        this.renderInitial();
    }

    setZIndex(zIndex) {
        this.zIndex = zIndex;
        this.canvas.style.zIndex = zIndex;
    }
}
