import {Shape} from "../const.js";
import {Tool} from "./tool.js";
import {shapePixels, sixBitHexTo0xColor} from "../utils.js";

export class PencilTool extends Tool {
    constructor() {
        super('Pencil');
        this.shape = Shape.SQUARE;
        this.size = 1;
    }

    getShape() {
        return this.shape;
    }

    setShape(shape) {
        this.shape = shape;
    }

    use(workspace, x, y, colorPalette) {
        const layer = workspace.getActiveLayer();
        const color = colorPalette.getPrimaryColor();

        if (color === null) return;

        const pixels = shapePixels(x, y, color, this.shape, this.size)

        layer.draw(pixels);
    }

    drawOverlay(layer, x, y, colorPalette) {
        let color = colorPalette.getPrimaryColor();
        if (color === null) return;

        const pixels = shapePixels(x, y, color, this.shape, this.size)

        layer.stage(pixels);
    }
}