import {ERASED_SENTINEL, Shape} from "../const.js";
import {Tool} from "./tool.js";
import {TRANSPARENT_SENTINEL} from "../const.js";
import {shapePixels} from "../utils.js";

export class EraserTool extends Tool {
    constructor() {
        super('Eraser');
        this.shape = Shape.SQUARE;
        this.size = 1;
    }

    getShape() {
        return this.shape;
    }

    setShape(shape) {
        this.shape = shape;
    }

    onPointerDown(workspace, x, y, colorPalette) {
        const layer = workspace.getActiveLayer();
        const pixels = shapePixels(x, y, TRANSPARENT_SENTINEL, this.shape, this.size)
        layer.draw(pixels);
    }

    drawOverlay(workspace, x, y, colorPalette) {
        const layer = workspace.getActiveLayer();
        const pixels = shapePixels(x, y, ERASED_SENTINEL, this.shape, this.size)
        layer.stage(pixels);
    }
}