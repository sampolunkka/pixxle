import { Tool } from '../tool.js';

export class EraserTool extends Tool {
    constructor(buttonEl) {
        super('eraser', buttonEl);
        this.hoverColor = 'repeating-linear-gradient(45deg, #ccc 0 4px, #fff 4px 8px)';
        this.hoverBorder = '1px solid #aaa';
        this.hoverShadow = '0 0 2px #0002';
    }

    handleUse(model, x, y/*, color */) {
        model.erasePixel(x, y);
        return null;
    }
}
