import { PencilTool } from './pencil-tool.js';
import { EraserTool } from './eraser-tool.js';
import { EyeDropperTool } from './eyedropper-tool.js';

export function createTools() {
    const pencilBtn = document.getElementById('pencilBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const eyedropBtn = document.getElementById('eyedropBtn');

    const pencil = new PencilTool(pencilBtn);
    const eraser = new EraserTool(eraserBtn);
    const eyedropper = new EyeDropperTool(eyedropBtn);

    const tools = { pencil, eraser, eyedropper };
    let current = pencil;

    function set(toolName) {
        if (current && current.name === toolName) return;
        current?.deactivate();
        const next = tools[toolName] || pencil;
        next.activate();
        current = next;
    }

    pencilBtn?.addEventListener('click', () => set('pencil'));
    eraserBtn?.addEventListener('click', () => set('eraser'));
    eyedropBtn?.addEventListener('click', () => set('eyedropper'));

    // ensure default active state
    set('pencil');

    return {
        get current() { return current; },
        set
    };
}