export default class ToolManager {
    constructor(workspace, colorPalette) {
        this.workspace = workspace;
        this.colorPalette = colorPalette;

        this.tools = null;
    }

    init(toolsMap) {
        this.tools = toolsMap;
        this.activeToolName = Object.keys(toolsMap)[0];
        this.toolSettings = {};

        // Set tool defaults
        for (const name of Object.keys(toolsMap)) {
            this.toolSettings[name] = { size: 1, shape: 'square' };
        }

        console.log(`toolManager initialized with tools: ${Object.keys(toolsMap).join(', ')}`);
    }

    setActiveTool(name) {
        if (!this.tools[name]) return;

        // Save current tool settings for prev tool
        if (this.activeToolName) {
            this.toolSettings[this.activeToolName] = {
                size: Number(document.getElementById('tool-size').value),
                shape: document.getElementById('tool-shape').value
            };
        }
        this.activeToolName = name;

        // Restore tool settings for newly active tool
        const { size, shape } = this.toolSettings[name];
        document.getElementById('tool-size').value = size;
        document.getElementById('tool-shape').value = shape;
    }

    onPointerDown(e, coords) {
        this.getActiveTool().onPointerDown(this.workspace, coords.x, coords.y, this.colorPalette);
        this.workspace.update();
    }

    onPointerMove(e, coords) {
        this.getActiveTool().onPointerMove(this.workspace, coords.x, coords.y, this.colorPalette);
        this.workspace.update();
    }

    onPointerUp(e, coords) {
        this.getActiveTool().onPointerUp(this.workspace, coords.x, coords.y, this.colorPalette);
        this.workspace.update();
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
}