export class ToolManager {
    constructor(toolMap) {
        this.tools = toolMap;
        this.activeToolName = Object.keys(toolMap)[0];
        console.log()
    }

    setActiveTool(name) {
        if (this.tools[name]) {
            this.activeToolName = name;
        }
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
