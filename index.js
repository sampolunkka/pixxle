// javascript
// File: `index.js` (added topbar listeners and helper)
import { createModel } from './model.js';
import { createRenderer } from './renderer.js';
import { createPreview } from './preview.js';
import { createTools } from './tools.js';
import { createInput } from './input.js';

const canvas = document.getElementById('canvas');
const setupForm = document.getElementById('setup');
const colorInput = document.getElementById('color'); // drawing color (now in own window)
const bgColorInput = document.getElementById('bgColor'); // background color in topbar
const bgTransparentEl = document.getElementById('bgTransparent'); // background transparent checkbox
const clearBtn = document.getElementById('clear');
const coordsEl = document.getElementById('coords');
const docScaleEl = document.getElementById('docScale');
const canvasSizeEl = document.getElementById('canvasSize');

const model = createModel();
const renderer = createRenderer(canvas, model);
const preview = createPreview(canvas, model);
const tools = createTools();

function setZoom(z) {
    if (!model.width) return;
    const newZoom = Math.max(1, Math.floor(Number(z) || 1));
    if (newZoom === model.pixelSize) return;
    model.setPixelSize(newZoom);
    renderer.updateCanvasSize();
    preview.updateHoverSize();
    preview.updatePreviewCanvasSize && preview.updatePreviewCanvasSize();
    if (docScaleEl) docScaleEl.textContent = `${newZoom}px`;
    renderer.render();
    preview.renderPreview();
}
window.setZoom = setZoom;
window.exportPNG = () => model.exportPNG();

const input = createInput(canvas, model, renderer, preview, tools, colorInput, coordsEl, setZoom);

canvas.classList.add('hidden');
setupForm.classList.remove('hidden');

function applyTopbarBackgroundToModel() {
    const transparent = bgTransparentEl ? bgTransparentEl.checked : false;
    const bg = transparent ? '#00000000' : (bgColorInput ? bgColorInput.value : '#ffffff');
    // use model.setBackground to preserve user pixels and only update true background pixels
    if (typeof model.setBackground === 'function') {
        model.setBackground(bg);
    } else {
        // fallback if model doesn't have setBackground yet
        model.clear(bg);
    }
    renderer.render();
    preview.renderPreview();
}

if (bgColorInput) {
    bgColorInput.addEventListener('input', () => {
        applyTopbarBackgroundToModel();
    });
}
if (bgTransparentEl) {
    bgTransparentEl.addEventListener('change', () => {
        // optionally disable the color input while transparent is on
        if (bgColorInput) bgColorInput.disabled = bgTransparentEl.checked;
        applyTopbarBackgroundToModel();
    });
}

setupForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const width = Math.max(1, Math.min(256, Number(document.getElementById('width').value) || 32));
    const height = Math.max(1, Math.min(256, Number(document.getElementById('height').value) || 32));
    // read background settings from the topbar controls
    const transparent = bgTransparentEl ? bgTransparentEl.checked : false;
    const bg = transparent ? '#00000000' : (bgColorInput ? bgColorInput.value : '#ffffff');

    const res = model.init(width, height, 0, bg);
    renderer.updateCanvasSize();
    preview.updateHoverSize();
    preview.updatePreviewCanvasSize && preview.updatePreviewCanvasSize();

    if (docScaleEl) docScaleEl.textContent = `${res.pixelSize}px`;
    if (canvasSizeEl) canvasSizeEl.textContent = `Canvas: ${res.width} × ${res.height}`;

    setupForm.classList.add('hidden');
    canvas.classList.remove('hidden');

    renderer.render();
    preview.renderPreview();
});

// Use current model bgColor so Clear respects transparent background
clearBtn.addEventListener('click', () => {
    model.clear(model.bgColor);
    renderer.render();
    preview.renderPreview();
});

colorInput.addEventListener('input', () => {
    const last = input.lastClient;
    if (last) preview.showHoverAt(last.x, last.y, colorInput.value);
});

console.log('Pixxle modules loaded');
