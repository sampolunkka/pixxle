import {Shape} from "../const.js";
import {Tool} from "./tool.js";
import {shapePixels, sixBitHexTo0xColor} from "../utils.js";

export class PencilTool extends Tool {
    constructor() {
        super('Pencil');
        this.shape = Shape.SQUARE;
        this.size = 1;

        this.drawing = false;
    }

    getShape() {
        return this.shape;
    }

    setShape(shape) {
        this.shape = shape;
    }

    onPointerDown(workspace, x, y, colorPalette) {
        this.drawing = true
        const color = colorPalette.getPrimaryColor();
        if (color === null) return;

        const layer = workspace.getActiveLayer();

        const pixels = shapePixels(x, y, color, this.shape, this.size)
        layer.draw(pixels);
    }

    onPointerMove(workspace, x, y, colorPalette) {
        let color = colorPalette.getPrimaryColor();
        if (color === null) return;

        const layer = workspace.getActiveLayer();
        const pixels = shapePixels(x, y, color, this.shape, this.size)

        if (this.drawing) {
            layer.draw(pixels);
        } else {
            layer.stage(pixels);
        }
    }

    onPointerUp(workspace, x, y, colorPalette) {
        this.drawing = false;
    }
}