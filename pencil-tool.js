import { Tool } from './tool.js';

export class PencilTool extends Tool {
    constructor(buttonEl) {
        super('pencil', buttonEl);
    }

    handleDraw(model, x, y, color) {
        model.drawPixel(x, y, color);
    }
}
