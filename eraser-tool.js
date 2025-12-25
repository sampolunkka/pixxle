import { Tool } from './tool.js';

export class EraserTool extends Tool {
    constructor(buttonEl) {
        super('eraser', buttonEl);
    }

    handleDraw(model, x, y/*, color */) {
        model.drawPixel(x, y, model.bgColor);
    }
}
