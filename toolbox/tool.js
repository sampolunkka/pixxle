export class Tool {
    constructor(name) {
        this.name = name;
    }

    // Called when the tool is used (e.g., mouse click)
    // TODO: Consider passing "context" or "event" instead of x, y, colorPalette for more flexibility
    use(workspace, x, y, colorPalette) {
        throw new Error('use() must be implemented by subclass');
    }

    // Called to render the overlay (e.g., on hover)
    // TODO: Consider passing "context" or "event" instead of x, y, colorPalette for more flexibility
    drawOverlay(layer, x, y, colorPalette) {
        throw new Error('drawOverlay() must be implemented by subclass');
    }
}