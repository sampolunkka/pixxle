export class Tool {
    constructor(name) {
        this.name = name;
    }

    // Called when the tool is used (e.g., mouse click)
    use(layer, x, y, color) {
        throw new Error('use() must be implemented by subclass');
    }

    // Called to render the overlay (e.g., on hover)
    drawOverlay(layer, x, y, color) {
        throw new Error('drawOverlay() must be implemented by subclass');
    }
}