import {Tool} from "./tool.js";

export class EyedropperTool extends Tool {
    constructor() {
        super('Eyedropper');
    }

    onPointerDown(workspace, x, y, colorPalette) {
        let layer = workspace.getTopLayer();
        let color = layer.getPixel(x, y);

        colorPalette.setPrimaryColor(color);
    }
}