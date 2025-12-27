import { Tool } from '../tool.js';
import {intToCss, TRANSPARENT_SENTINEL} from '../utils.js';

export class EyeDropperTool extends Tool {
    constructor(buttonEl) {
        super('eyedropper', buttonEl);
        this.hoverBorder = '1px solid #000';
        this.hoverShadow = '0 0 1px #FFF';
        this.hoverColor = intToCss(TRANSPARENT_SENTINEL);
    }

    // return picked color as CSS hex (e.g. "#rrggbb") or null
    handleUse(model, x, y /*, color */) {
        if (!model.pixels) return null;
        if (x < 0 || x >= model.width || y < 0 || y >= model.height) return null;
        const c = model.pixels[y * model.width + x] || 0;
        return intToCss(c);
    }

    _handleUse(button, payload) {
        if (!this.model || !this.canvas) return;
        if (!this._isOnCanvas(payload.target)) return;

        const { x, y } = this._getGridPos(payload.clientX, payload.clientY);
        if (x < 0 || y < 0 || x >= this.model.width || y >= this.model.height) return;

        const pickedColor = this.handleUse(this.model, x, y);
        if (pickedColor && this.colorEl) {
            this.colorEl.value = pickedColor;
        }

        this.renderer && this.renderer.render();
        this.preview && this.preview.renderPreview();
    }
}