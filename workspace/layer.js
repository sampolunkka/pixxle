import {LayerRenderer} from './layer-renderer.js';
import {LayerModel} from './layer-model.js';
import {TRANSPARENT_SENTINEL} from '../const.js';
import {Shape} from '../const.js';

export class Layer {
    constructor(width, height, canvasElement, fillColor = TRANSPARENT_SENTINEL) {
        this.committed = new LayerModel(width, height, fillColor);
        this.staged = new LayerModel(width, height, TRANSPARENT_SENTINEL);
        this.canvas = canvasElement;
        this.canvas.width = width;
        this.canvas.height = height;
        this.renderer = new LayerRenderer(this, this.canvas);
        this.previousStaging = null;
    }

    draw(x, y, color, shape, size) {
        if (size === 1) {
            this.committed.setPixel(x, y, color);
        } else {
            switch (shape) {
                case Shape.CIRCLE:
                    this.committed.setCircle(x, y, size, color);
                    break;
                case Shape.SQUARE:
                    this.committed.setSquare(x, y, size, color);
                    break;
            }
        }
    }

    stage(x, y, color, shape, size) {
        if (size === 1) {
            this.staged.setPixel(x, y, color);
        } else {
            switch (shape) {
                case Shape.CIRCLE:
                    this.staged.setCircle(x, y, size, color);
                    break;
                case Shape.SQUARE:
                    this.staged.setSquare(x, y, size, color);
                    break;
            }
        }

        this.previousStaging = {x, y, size};
    }

    clearPreviousStagingBox() {
        if (!this.previousStaging) return;
        const {x, y, size} = this.previousStaging;
        this.staged.setSquare(x, y, size, TRANSPARENT_SENTINEL);
        this.previousStaging = null;
    }

    clearStaging() {
        this.staged.clear();
    }

    commitStaging() {
        for (let i = 0; i < this.staged.pixels.length; i++) {
            if (this.staged.pixels[i] !== TRANSPARENT_SENTINEL) {
                this.committed.pixels[i] = this.staged.pixels[i];
            }
        }
        this.clearStaging();
    }

    render() {
        this.renderer.render();
    }

    clear() {
        this.committed.clear();
        this.clearStaging();
    }
}
