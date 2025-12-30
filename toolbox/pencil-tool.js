import {Shape} from "../const.js";
import {Tool} from "./tool.js";

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

    use(layer, x, y, color) {
        layer.draw(x, y, color, this.shape, this.size);
    }

    drawOverlay(layer, x, y, color) {
        layer.clearPreviousStagingBox();
        layer.stage(x, y, color, this.shape, this.size);
    }
}