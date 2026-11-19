import {interpolatePositions} from "../utils.js";

export class Tool {
    constructor(name) {
        this.name = name;
        this.lastPosition = null;
    }

    // Called when the tool is used (e.g., mouse click)
    // TODO: Consider passing "context" or "event" instead of x, y, colorPalette for more flexibility
    onPointerDown(workspace, x, y, colorPalette) {
        throw new Error('onPointerDown() must be implemented by subclass');
    }

    // TODO: DEPRECATED
    // Called to render the overlay (e.g., on hover)
    // TODO: Consider passing "context" or "event" instead of x, y, colorPalette for more flexibility
    drawOverlay(workspace, x, y, colorPalette) {
        throw new Error('drawOverlay() must be implemented by subclass');
    }

    interpolateTo(x, y, callback) {
        if (!this.lastPosition) {
            this.lastPosition = { x, y };
            callback(x, y);
            return;
        }

        for (const pos of interpolatePositions(
            this.lastPosition.x,
            this.lastPosition.y,
            x,
            y
        )) {
            callback(pos.x, pos.y);
        }

        this.lastPosition = { x, y };
    }

    resetInterpolation() {
        this.lastPosition = null;
    }
}