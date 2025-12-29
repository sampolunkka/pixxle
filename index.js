// index.js
import {Workspace} from './workspace.js';
import {clientPosToCanvasCoords, isInsideCanvas, sixBitHexTo0xColor} from "./utils.js";
import {createPreviewWindow} from "./preview-window.js";

const setupForm = document.getElementById('setup');
const backgroundCanvas = document.getElementById('backgroundCanvas');
const foregroundCanvas = document.getElementById('foregroundCanvas');
const overlayCanvas = document.getElementById('overlayCanvas');
const bgColorElement = document.getElementById('bgColor');
const canvasStack = document.querySelector('.canvas-stack');
const workspaceElement = document.querySelector('.workspace');
const grid = document.getElementById('pixelGrid');
const canvasScale = document.getElementById('canvasScale');
const canvasSize = document.getElementById('canvasSize');
const coordsDisplay = document.getElementById('coordsDisplay');
const colorPicker = document.getElementById('colorPicker');
console.log(`color picker initial value: ${colorPicker.value}`);

let bgColor = sixBitHexTo0xColor(bgColorElement.value);
console.log(`bg color: ${bgColor}`);
let zoom = 1;
let width = 0;
let height = 0;
let workspace = null;
let preview = null;

let panX = 0, panY = 0;
let isPanning = false;
let startX = 0, startY = 0;
let baseX = 0, baseY = 0;

function updatePixelGrid() {
    const pixelSize = zoom;
    if (pixelSize < 8) {
        grid.style.display = 'none';
        return;
    }
    grid.style.display = '';
    grid.style.setProperty('--pixel-size', pixelSize + 'px');
    grid.style.width = width * zoom + 'px';
    grid.style.height = height * zoom + 'px';
    grid.style.transform = `translate(calc(50vw - 50% + ${panX}px), calc(50vh - 50% + ${panY}px))`;
}

function applyTransform() {
    canvasStack.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`;
    canvasScale.textContent = `Zoom: ${zoom}x`;
    updatePixelGrid();
}

workspaceElement.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const delta = Math.sign(e.deltaY);
        zoom = Math.max(1, Math.min(16, zoom + (delta > 0 ? -1 : 1)));
        applyTransform();
    }
}, { passive: false });

setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    width = Math.max(1, Math.min(256, Number(document.getElementById('width').value) || 32));
    height = Math.max(1, Math.min(256, Number(document.getElementById('height').value) || 32));
    canvasSize.textContent = `${width}px - ${height}px`;

    let autoZoomWidth = window.innerWidth / width * 0.8;
    let autoZoomHeight = window.innerHeight / height * 0.8;
    zoom = Math.floor(Math.min(autoZoomWidth, autoZoomHeight));
    if (zoom < 1) zoom = 1;

    workspace = new Workspace(width, height, backgroundCanvas, foregroundCanvas, overlayCanvas, bgColor);
    workspace.renderAll();

    preview = createPreviewWindow([backgroundCanvas, foregroundCanvas]);
    preview.renderPreview();

    setupForm.classList.add('hidden');
    canvasStack.classList.remove('hidden');
    grid.classList.remove('hidden');
    applyTransform();
});

canvasStack.addEventListener('pointerdown', (e) => {
    if (e.button !== 1) return;
    e.preventDefault();
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    baseX = panX;
    baseY = panY;
    document.body.style.cursor = 'grabbing';
});

window.addEventListener('pointermove', (e) => {
    if (!isPanning) return;
    panX = baseX + (e.clientX - startX);
    panY = baseY + (e.clientY - startY);
    applyTransform();
});

window.addEventListener('pointerup', (e) => {
    if (!isPanning) return;
    isPanning = false;
    document.body.style.cursor = '';
});

function drawPixel(workspace, x, y, color) {
    const layer = workspace.layers[1];
    if (!layer) return;
    layer.model.setPixel(x, y, color);
    layer.render();
    if (preview) preview.renderPreview();
}

window.addEventListener('pointerdown', (e) => {
    if (!workspace) return;
    if (isInsideCanvas(foregroundCanvas, e.clientX, e.clientY)) {
        const coords = clientPosToCanvasCoords(foregroundCanvas, e.clientX, e.clientY, zoom);
        drawPixel(workspace, coords.x, coords.y, sixBitHexTo0xColor(colorPicker.value));}
});
