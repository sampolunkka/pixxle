import { Tool } from './tool.js';
import { intToCss } from './utils.js';

export class EyeDropperTool extends Tool {
    constructor(buttonEl) {
        super('eyedropper', buttonEl);
    }

    // return picked color as CSS hex (e.g. "#rrggbb") or null
    handleDraw(model, x, y /*, color */) {
        if (!model.pixels) return null;
        if (x < 0 || x >= model.cols || y < 0 || y >= model.rows) return null;
        const c = model.pixels[y * model.cols + x] || 0;
        return intToCss(c);
    }
}