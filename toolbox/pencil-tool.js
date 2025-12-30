import {Shape} from "../const.js";
import {Tool} from "./tool.js";

export class PencilTool extends Tool {
    constructor() {
        super('Pencil');
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
        layer.draw(x, y, color, this.shape, this.size);
    }

    drawOverlay(workspace, x, y, color) {
        let overlayLayer = workspace.getOverlayLayer();
        overlayLayer.clear();
        overlayLayer.draw(x, y, color, this.shape, this.size);
    }
}