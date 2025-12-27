// toolbox.js
import { PencilTool } from './tools/pencil-tool.js';
import { EraserTool } from './tools/eraser-tool.js';
import { EyeDropperTool } from './tools/eyedropper-tool.js';

export class Toolbox {
    constructor(toolsMap = {}, {
        inputManager = null,
        canvas = null,
        model = null,
        renderer = null,
        preview = null,
        colorEl = null,
        keyMap = {},
        defaultTool = null,
        ignoreModifiers = true
    } = {}) {
        this.tools = { ...toolsMap };
        this.keyMap = { ...keyMap };
        this.input = inputManager;
        this.ignoreModifiers = !!ignoreModifiers;
        this.current = null;
        this._clickHandlers = new Map();
        this._shared = { input: this.input, canvas, model, renderer, preview, colorEl };
        this._listeners = {};
        this.preview = preview;
        this.colorEl = colorEl;
        this.canvas = canvas;
        this.model = model;

        this._onKeyDown = this._onKeyDown.bind(this);
        if (this.input) this.input.on('keydown', this._onKeyDown);

        Object.values(this.tools).forEach(tool => this._wireTool(tool));

        // --- Tool preview overlay ---
        this._createToolHoverOverlay();
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerLeave = this._onPointerLeave.bind(this);
        this._onPointerZoom = this._onPointerZoom.bind(this);

        if (this.input) {
            this.input.on('pointermove', this._onPointerMove);
            this.input.on('wheel', this._onPointerZoom);
        }

        if (this.canvas) {
            this.canvas.addEventListener('pointerleave', this._onPointerLeave);
        }

        // Hide preview on tool change
        this.on('toolChanged', () => {
            this._hideToolHover();
        });

        const first = defaultTool || (this.tools.pencil && 'pencil') || Object.keys(this.tools)[0];
        if (first) this.set(first);
    }

    _createToolHoverOverlay() {
        this.toolHover = document.createElement('div');
        this.toolHover.id = 'toolHoverOverlay';
        Object.assign(this.toolHover.style, {
            position: 'absolute',
            zIndex: 10,
            border: 'none',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            display: 'none',
            background: 'rgba(0,0,0,0)',
        });
        document.body.appendChild(this.toolHover);
    }

    _hideToolHover() {
        if (this.toolHover) this.toolHover.style.display = 'none';
    }

    _showToolHoverAt(clientX, clientY) {
        const model = window.model;
        if (!this.canvas || !model.width) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((clientX - rect.left) / model.pixelSize);
        const y = Math.floor((clientY - rect.top) / model.pixelSize);
        if (x < 0 || x >= model.width || y < 0 || y >= model.height) {
            model.clearPreview();
            window.renderer.render();
            return;
        }

        model.clearPreview();
        // Use the current tool's hover color, fallback to black
        const hoverStyle = this.current.getHoverStyle();
        const color = hoverStyle.color || '#000000';
        model.setPreviewPixel(x, y, color);

        window.renderer.render();
    }

    _onPointerMove(payload) {
        if (!this.current || !this.toolHover) return;
        if (payload.target !== this.canvas && !this.canvas.contains(payload.target)) {
            this._hideToolHover();
            return;
        }
        this._showToolHoverAt(payload.clientX, payload.clientY);
    }

    _onPointerLeave() {
        this._hideToolHover();
    }

    _onPointerZoom(payload) {
        this._showToolHoverAt(payload.clientX, payload.clientY);
    }

    _wireTool(tool) {
        if (!tool) return;
        tool.attach && tool.attach(this._shared);
        tool.on && tool.on('change', (payload) => {
            this.emit('toolChanged', { tool, payload });
        });
        if (tool.buttonEl && !this._clickHandlers.has(tool.buttonEl)) {
            const fn = () => this.set(tool.name);
            tool.buttonEl.addEventListener('click', fn);
            this._clickHandlers.set(tool.buttonEl, fn);
        }
    }

    on(event, fn) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
    }

    off(event, fn) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    }

    emit(event, payload) {
        (this._listeners[event] || []).forEach(fn => fn(payload));
    }

    _onKeyDown(payload) {
        const e = payload.originalEvent;
        if (!e) return;
        if (this.ignoreModifiers && (e.ctrlKey || e.metaKey || e.altKey)) return;
        const key = (payload.key || e.key || '').toLowerCase();
        if (!key) return;
        const toolName = this.keyMap[key];
        if (toolName && this.tools[toolName]) {
            e.preventDefault();
            this.set(toolName);
        }
    }

    set(toolName) {
        if (!toolName) return;
        if (this.current && this.current.name === toolName) return;
        this.current?.deactivate?.();
        const next = this.tools[toolName];
        if (!next) return;
        next.attach && next.attach(this._shared);
        next.activate?.();
        this.current = next;
        this._hideToolHover();
    }

    register(tool) {
        if (!tool || !tool.name) return;
        this._wireTool(tool);
        this.tools[tool.name] = tool;
    }

    destroy() {
        if (this.input) this.input.off('keydown', this._onKeyDown);
        for (const [el, fn] of this._clickHandlers.entries()) {
            el.removeEventListener('click', fn);
        }
        this._clickHandlers.clear();
        if (this.toolHover && this.toolHover.parentElement) {
            this.toolHover.parentElement.removeChild(this.toolHover);
        }
        if (this.canvas && this._onPointerLeave) {
            this.canvas.removeEventListener('pointerleave', this._onPointerLeave);
        }
        this.current = null;
        this.tools = {};
        this._shared = null;
        this._listeners = {};
    }
}

export function createTools({
                                inputManager,
                                canvas,
                                model,
                                renderer,
                                preview = null,
                                colorEl,
                                keyMap = { p: 'pencil', e: 'eraser', i: 'eyedropper' },
                                defaultTool = null,
                                ignoreModifiers = true
                            } = {}) {
    const pencilBtn = document.getElementById('pencilBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const eyedropBtn = document.getElementById('eyedropBtn');

    const toolsMap = {
        pencil: new PencilTool(pencilBtn),
        eraser: new EraserTool(eraserBtn),
        eyedropper: new EyeDropperTool(eyedropBtn)
    };

    return new Toolbox(toolsMap, {
        inputManager,
        canvas,
        model,
        renderer,
        preview,
        colorEl,
        keyMap,
        defaultTool,
        ignoreModifiers
    });
}
