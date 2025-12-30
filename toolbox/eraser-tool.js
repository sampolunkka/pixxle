import {Shape} from "../const.js";
import {Tool} from "./tool.js";
import {TRANSPARENT_SENTINEL} from "../utils.js";

export class EraserTool extends Tool {
    constructor() {
        super('Eraser');
        this.shape = Shape.CIRCLE;
        this.size = 5;
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
        let overlayLayer = workspace.getOverlayLayer();
        overlayLayer.clear();
        overlayLayer.draw(x, y, 0xFF000000, this.shape, this.size);
    }
}