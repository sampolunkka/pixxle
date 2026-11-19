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
        this.drawing = true;
        this.resetInterpolation();
        this.drawInterpolated(workspace, x, y, colorPalette);
    }

    onPointerMove(workspace, x, y, colorPalette) {
        const color = colorPalette.getPrimaryColor();
        if (color === null) return;

        if (this.drawing) {
            this.drawInterpolated(workspace, x, y, colorPalette);
        } else {
            const layer = workspace.getActiveLayer();
            layer.stage(shapePixels(x, y, color, this.shape, this.size));
        }
    }

    onPointerUp() {
        this.drawing = false;
        this.resetInterpolation();
    }

    drawInterpolated(workspace, x, y, colorPalette) {
        const color = colorPalette.getPrimaryColor();
        if (color === null) return;

        const layer = workspace.getActiveLayer();

        this.interpolateTo(x, y, (px, py) => {
            layer.draw(shapePixels(px, py, color, this.shape, this.size));
        });
    }
}