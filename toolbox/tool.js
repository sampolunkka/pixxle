export class Tool {
    constructor(name) {
        this.name = name;
    }

    // Called when the tool is used (e.g., mouse click)
    use(layer, position) {
        throw new Error('use() must be implemented by subclass');
    }

    // Called to render the overlay (e.g., on hover)
    renderOverlay(layer, position) {
        throw new Error('renderOverlay() must be implemented by subclass');
    }
}