export class ToolManager {
    constructor(toolMap) {
        this.tools = toolMap;
        this.activeToolName = Object.keys(toolMap)[0];
        this.toolSettings = {};

        // Set tool defaults
        for (const name of Object.keys(toolMap)) {
            this.toolSettings[name] = { size: 1, shape: 'square' };
        }

        console.log(`toolManager initialized with tools: ${Object.keys(toolMap).join(', ')}`);
    }

    setActiveTool(name) {
        if (!this.tools[name]) return;

        // Save current tool settings for prev tool
        if (this.activeToolName) {
            this.toolSettings[this.activeToolName] = {
                size: Number(document.getElementById('toolSize').value),
                shape: document.getElementById('toolShape').value
            };
        }
        this.activeToolName = name;

        // Restore tool settings for newly active tool
        const { size, shape } = this.toolSettings[name];
        document.getElementById('toolSize').value = size;
        document.getElementById('toolShape').value = shape;
    }

    useActiveTool(layer, x, y, color) {
        this.getActiveTool().use(layer, x, y, color);
    }

    hoverActiveTool(layer, x, y, color) {
        this.getActiveTool().drawOverlay(layer, x, y, color);
    }

    setActiveToolSize(size) {
        this.getActiveTool().size = size;
    }

    setActiveToolShape(shape) {
        this.getActiveTool().shape = shape;
    }

    getActiveTool() {
        return this.tools[this.activeToolName];
    }

    handleEvent(event) {
        if (this.activeTool && this.activeTool.handleEvent) {
            this.activeTool.handleEvent(event);
        }
    }
}
