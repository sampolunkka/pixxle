import {ERASED_SENTINEL, Shape} from "../const.js";
import {Tool} from "./tool.js";
import {TRANSPARENT_SENTINEL} from "../const.js";

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

    use(workspace, x, y, color) {
        let layer = workspace.getActiveLayer();
        layer.draw(x, y, TRANSPARENT_SENTINEL, this.shape, this.size);
    }

    drawOverlay(workspace, x, y, color) {
        let layer = workspace.getActiveLayer();
        layer.clearStaging();
        layer.stage(x, y, ERASED_SENTINEL, this.shape, this.size);
    }
}