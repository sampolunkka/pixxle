import { createModel } from './model.js';
import { createRenderer } from './renderer.js';
import { createPreview } from './preview.js';
import { createTools } from './tools.js';
import { createInput } from './input.js';

const canvas = document.getElementById('canvas');
const setupForm = document.getElementById('setup');
const colorInput = document.getElementById('color');
const clearBtn = document.getElementById('clear');
const coordsEl = document.getElementById('coords');
const docScaleEl = document.getElementById('docScale');

const model = createModel();
const renderer = createRenderer(canvas, model);
const preview = createPreview(canvas, model);
const tools = createTools();

function setZoom(z) {
    if (!model.cols) return;
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

setupForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const cols = Math.max(1, Math.min(256, Number(document.getElementById('cols').value) || 32));
    const rows = Math.max(1, Math.min(256, Number(document.getElementById('rows').value) || 32));
    const zoomInput = Math.max(0, Math.floor(Number(document.getElementById('zoom').value) || 0));
    const res = model.init(cols, rows, zoomInput);
    renderer.updateCanvasSize();
    preview.updateHoverSize();
    preview.updatePreviewCanvasSize && preview.updatePreviewCanvasSize();
    if (docScaleEl) docScaleEl.textContent = `${res.pixelSize}px`;
    document.getElementById('topbar')?.classList.remove('hidden');
    document.getElementById('tools')?.classList.remove('hidden');
    setupForm.classList.add('hidden');
    renderer.render();
    preview.renderPreview();
});

clearBtn.addEventListener('click', () => {
    model.clear('#ffffff');
    renderer.render();
    preview.renderPreview();
});

colorInput.addEventListener('input', () => {
    const last = input.lastClient;
    if (last) preview.showHoverAt(last.x, last.y, colorInput.value);
});

console.log('Pixxle modules loaded');
