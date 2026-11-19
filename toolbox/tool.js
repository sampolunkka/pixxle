import {interpolatePositions} from "../utils.js";

export class Tool {
    constructor(name) {
        this.name = name;
        this.lastPosition = null;
    }

    onPointerDown(workspace, x, y, colorPalette) {
        throw new Error('onPointerDown() must be implemented by subclass');
    }

    onPointerMove(workspace, x, y, colorPalette) {
        throw new Error('onPointerMove() must be implemented by subclass');
    }

    onPointerUp(workspace, x, y, colorPalette) {
        throw new Error('onPointerUp() must be implemented by subclass');
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