// javascript
import { createModel } from './model.js';
import { createRenderer } from './renderer.js';
import { createPreviewWindow } from './preview-window.js';
import { InputManager } from './input-manager.js';
import { PanHandler } from './pan-handler.js';
import { ZoomHandler } from './zoom-handler.js';
import { createTools } from './toolbox.js';

const canvas = document.getElementById('canvas');
const setupForm = document.getElementById('setup');
const colorInput = document.getElementById('color');
const bgColorInput = document.getElementById('bgColor');
const bgTransparentEl = document.getElementById('bgTransparent');
const clearBtn = document.getElementById('clear');
const docScaleEl = document.getElementById('docScale');
const canvasSizeEl = document.getElementById('canvasSize');

const model = createModel();
window.model = model;
const renderer = createRenderer(canvas, model);
window.renderer = renderer;
const previewWindow = createPreviewWindow(model);

// InputManager
const rootEl = document.querySelector('.canvas-wrap') || canvas || document;
const input = new InputManager(rootEl);

// Create tools and attach shared deps (tool preview handled inside toolbox)
const tools = createTools({
    inputManager: input,
    canvas,
    model,
    renderer,
    colorEl: colorInput
});

const panHandler = new PanHandler(input, document.querySelector('.canvas-wrap') || canvas);
window.__panHandle = panHandler;

const zoomHandler = new ZoomHandler(input, document.querySelector('.canvas-wrap') || canvas);
window.__zoomHandler = zoomHandler;

function setZoom(z) {
    if (!model.width) return;
    const newZoom = Math.max(1, Math.floor(Number(z) || 1));
    if (newZoom === model.pixelSize) return;
    model.setPixelSize(newZoom);
    renderer.updateCanvasSize();
    previewWindow.updatePreviewCanvasSize();
    if (docScaleEl) docScaleEl.textContent = `${newZoom}px`;
    renderer.render();
    previewWindow.renderPreview();
}

window.setZoom = setZoom;
window.exportPNG = () => model.exportPNG();

canvas.classList.add('hidden');
setupForm.classList.remove('hidden');

function applyBackground() {
    const transparent = bgTransparentEl ? bgTransparentEl.checked : false;
    const bg = transparent ? '#00000000' : (bgColorInput ? bgColorInput.value : '#ffffff');
    if (typeof model.setBackground === 'function') {
        model.setBackground(bg);
    } else {
        model.clear(bg);
    }
    renderer.render();
    previewWindow.renderPreview();
}

if (bgColorInput) {
    bgColorInput.addEventListener('input', () => {
        applyBackground();
    });
}
if (bgTransparentEl) {
    bgTransparentEl.addEventListener('change', () => {
        if (bgColorInput) bgColorInput.disabled = bgTransparentEl.checked;
        applyBackground();
    });
}

setupForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const width = Math.max(1, Math.min(256, Number(document.getElementById('width').value) || 32));
    const height = Math.max(1, Math.min(256, Number(document.getElementById('height').value) || 32));
    const transparent = bgTransparentEl ? bgTransparentEl.checked : false;
    const bg = transparent ? '#00000000' : (bgColorInput ? bgColorInput.value : '#ffffff');

    const res = model.init(width, height, 0, bg);
    renderer.updateCanvasSize();
    previewWindow.updatePreviewCanvasSize();

    if (docScaleEl) docScaleEl.textContent = `${res.pixelSize}px`;
    if (canvasSizeEl) canvasSizeEl.textContent = `Canvas: ${res.width} × ${res.height}`;

    setupForm.classList.add('hidden');
    canvas.classList.remove('visible');
    canvas.classList.remove('hidden');

    renderer.render();
    previewWindow.renderPreview();
});

clearBtn.addEventListener('click', () => {
    model.clear(model.bgColor);
    renderer.render();
    previewWindow.renderPreview();
});

tools.on('toolChanged', () => {
    renderer.render();
    previewWindow.renderPreview();
});

console.log('Pixxle modules loaded');
