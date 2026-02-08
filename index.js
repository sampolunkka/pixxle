import {Workspace} from './workspace/workspace.js';
import {clientPosToCanvasCoords, isInsideCanvas, sixBitHexTo0xColor} from "./utils.js";
import {createDocumentPreview} from "./preview-window.js";
import {PencilTool} from "./toolbox/pencil-tool.js";
import {ToolManager} from "./toolbox/tool-manager.js";
import {EraserTool} from "./toolbox/eraser-tool.js";
import {ColorPalette} from "./bottom-bar/color-palette.js";

const setupForm = document.getElementById('setup');
const backgroundCanvas = document.getElementById('background-canvas');
const foregroundCanvas = document.getElementById('foreground-canvas');
const bgColorElement = document.getElementById('background-color-picker');
const canvasStack = document.querySelector('.canvas-stack');
const workspaceElement = document.querySelector('.workspace');
const grid = document.getElementById('pixel-grid');
const canvasScale = document.getElementById('canvas-scale');
const canvasSize = document.getElementById('canvas-size');
const toolSize = document.getElementById('tool-size');
const toolShape = document.getElementById('tool-shape');
const layersList = document.getElementById('layers-list');
const layersPanelElement = document.getElementById('layers-panel');
const paletteContainer = document.querySelector('.bottom-bar');

const toolButtons = document.querySelectorAll('.button-tool');
const toolMap = {
    pencil: new PencilTool(),
    eraser: new EraserTool()/*,
    eyedropper: new EyedropperTool()*/
};
const toolManager = new ToolManager(toolMap);

let bgColor = sixBitHexTo0xColor(bgColorElement.value);
let zoom = 1;
let width = 0;
let height = 0;
let workspace = null;
let preview = null;

let panX = 0, panY = 0;
let isPanning = false;
let startX = 0, startY = 0;
let baseX = 0, baseY = 0;

// Draw interpolation state
const drawInterpolation = true;
let isDrawing = false;
let lastDrawX = null;
let lastDrawY = null;

// Overlay optimization - only re-render when coords change
let lastOverlayX = null;
let lastOverlayY = null;

// Draw optimization (coelesced to animation frame)
let drawPending = false;
let pendingDraw = null;

// Overlay optimization (coelesced to animation frame)
let latestOverlayCoords = null;
let overlayRenderPending = false;

toolSize.addEventListener('input', () => {
    if (!toolManager) return;
    toolManager.setActiveToolSize(toolSize.value);
});

toolShape.addEventListener('change', () => {
    if (!toolManager) return;
    toolManager.setActiveToolShape(toolShape.value);
});

toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toolManager.setActiveTool(btn.dataset.tool);
        toolButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

function createLayerListItem(index, layer, isActive) {
    const item = document.createElement('div');
    item.className = 'layer-list-item' +
        (isActive ? ' active' : '') +
        (layer.locked ? ' locked' : '');
    item.dataset.layer = index;

    // Visibility button
    const visBtn = document.createElement('button');
    visBtn.className = 'button-layer visibility-btn';
    visBtn.type = 'button';
    visBtn.title = layer.visible ? 'Hide layer' : 'Show layer';
    visBtn.innerHTML = `<img class="icon-tool" src="assets/visibility.svg" alt="Visibility" width="20" height="20">`;
    visBtn.dataset.action = 'toggle-visibility';

    // Name button
    const nameBtn = document.createElement('button');
    nameBtn.className = 'button-layer name-btn';
    nameBtn.type = 'button';
    nameBtn.textContent = layer.locked ? 'Background' : `Layer ${index}`;
    nameBtn.title = nameBtn.textContent;
    nameBtn.dataset.layer = index;

    if (layer.locked) nameBtn.disabled = true;

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-button';
    delBtn.type = 'button';
    delBtn.title = 'Delete layer';
    delBtn.innerHTML = `<img class="icon-tool" src="assets/delete.svg" alt="Delete" width="20" height="20">`;
    delBtn.dataset.action = 'delete-layer';
    if (layer.locked) delBtn.disabled = true;

    item.appendChild(visBtn);
    item.appendChild(nameBtn);
    item.appendChild(delBtn);

    return item;
}

function renderLayersPanel() {
    layersList.innerHTML = '';
    for (let i = workspace.layers.length - 1; i >= 0; i--) {
        const layer = workspace.layers[i];
        const isActive = i === workspace.activeLayerIdx;
        const item = createLayerListItem(i, layer, isActive);
        layersList.appendChild(item);
    }
}

document.getElementById('add-layer-button').addEventListener('click', () => {
    if (!workspace) return;
    const newCanvas = document.createElement('canvas');
    newCanvas.className = 'workspace-canvas';
    newCanvas.width = workspace.width;
    newCanvas.height = workspace.height;
    // Insert before background canvas in stack
    canvasStack.appendChild(newCanvas);
    // Add to workspace
    workspace.addLayer(newCanvas);
    renderLayersPanel();
    workspace.update();
});

// Layer selecting
layersList.addEventListener('click', (e) => {
    if (!workspace) return;
    const btn = e.target.closest('.button-layer');
    if (!btn || btn.classList.contains('locked')) return;
    const match = btn.dataset.layer && btn.dataset.layer.match(/^(\d+)$/);
    if (match) {
        console.log("Selecting layer", match[1]);
        const idx = parseInt(match[1], 10);
        workspace.setActiveLayer(idx);
        renderLayersPanel();
    }
});

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

function getMaxZoom() {
    let maxZoomWidth = window.innerWidth / width * 0.8;
    let maxZoomHeight = window.innerHeight / height * 0.8;
    return Math.floor(Math.min(maxZoomWidth, maxZoomHeight));
}

// Wheel zooming
workspaceElement.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const delta = Math.sign(e.deltaY);
        let maxZoom = getMaxZoom();
        zoom = Math.max(1, Math.min(maxZoom, zoom + (delta > 0 ? -1 : 1)));
        applyTransform();
    }
}, { passive: false });

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

function hoverWithTool(workspace, x, y, color) {
    toolManager.hoverActiveTool(workspace.getActiveLayer(), x, y, color);
    workspace.update();
}

function useTool(workspace, x, y, color, shouldUpdate = true) {
    toolManager.useActiveTool(workspace.getActiveLayer(), x, y, color);
    if (shouldUpdate) {
        workspace.update();
        if (preview) preview.renderPreview();
    }
}

window.addEventListener('pointerdown', (e) => {
    if (!workspace) return;
    if (!toolManager) return;
    if (isInsideCanvas(foregroundCanvas, e.clientX, e.clientY)) {
        isDrawing = true;
        lastDrawX = null;
        lastDrawY = null;
        const coords = clientPosToCanvasCoords(foregroundCanvas, e.clientX, e.clientY, zoom);
        useTool(workspace, coords.x, coords.y, sixBitHexTo0xColor(colorPalette.getPrimaryColor()));
        lastDrawX = coords.x;
        lastDrawY = coords.y;
    }
});

window.addEventListener('pointerup', () => {
    isDrawing = false;
    lastDrawX = null;
    lastDrawY = null;
});

function interpolate(workspace, x0, y0, x1, y1, color) {
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
        useTool(workspace, x0, y0, color, false);
        if (x0 === x1 && y0 === y1) break;
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
    workspace.update();
    if (preview) preview.renderPreview();
}

window.addEventListener('pointermove', (e) => {
    if (!workspace || !toolManager) return;
    if (!isInsideCanvas(foregroundCanvas, e.clientX, e.clientY)) {
        lastOverlayX  = null;
        lastOverlayY  = null;
        return;
    }
    const coords = clientPosToCanvasCoords(foregroundCanvas, e.clientX, e.clientY, zoom);

    if (isDrawing && (coords.x !== lastDrawX || coords.y !== lastDrawY)) {
        pendingDraw = {x0: lastDrawX, y0: lastDrawY, x1: coords.x, y1: coords.y};
        if (!drawPending) {
            drawPending = true;
            requestAnimationFrame(() => {
                let color0x = sixBitHexTo0xColor(colorPalette.getPrimaryColor());
                if (drawInterpolation && pendingDraw && pendingDraw.x0 !== null && pendingDraw.y0 !== null) {
                    interpolate(workspace, pendingDraw.x0, pendingDraw.y0, pendingDraw.x1, pendingDraw.y1, color0x);
                } else if (pendingDraw) {
                    useTool(workspace, pendingDraw.x1, pendingDraw.y1, color0x);
                }
                lastDrawX = pendingDraw.x1;
                lastDrawY = pendingDraw.y1;
                drawPending = false;
                pendingDraw = null;
            });
        }
    } else {
        if (coords.x !== lastOverlayX || coords.y !== lastOverlayY) {
            latestOverlayCoords = coords;
            lastOverlayX = coords.x;
            lastOverlayY = coords.y;
            if (!overlayRenderPending) {
                overlayRenderPending = true;
                requestAnimationFrame(() => {
                    if (latestOverlayCoords) {
                        hoverWithTool(workspace, latestOverlayCoords.x, latestOverlayCoords.y, sixBitHexTo0xColor(colorPalette.getPrimaryColor()));
                    }
                    overlayRenderPending = false;
                });
            }
        }
    }
});

window.addEventListener('pointerdown', (e) => {
    if (!workspace) return;
    if (!toolManager) return;
    if (isInsideCanvas(foregroundCanvas, e.clientX, e.clientY)) {
        const coords = clientPosToCanvasCoords(foregroundCanvas, e.clientX, e.clientY, zoom);
        useTool(workspace, coords.x, coords.y, sixBitHexTo0xColor(colorPalette.getPrimaryColor()));}
});

setupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    width = document.getElementById('width').value;
    height = document.getElementById('height').value;

    canvasSize.textContent = `${width}px - ${height}px`;

    zoom = getMaxZoom();
    if (zoom < 1) zoom = 1;

    workspace = new Workspace(width, height, backgroundCanvas, foregroundCanvas, bgColor);
    workspace.update();

    let canvases = canvasStack.children;

    preview = createDocumentPreview(canvases);
    preview.renderPreview();

    setupForm.classList.add('hidden');
    canvasStack.classList.remove('hidden');
    grid.classList.remove('hidden');
    layersPanelElement.classList.remove('hidden');
    renderLayersPanel();

    applyTransform();
});

const colors = [
    "#ffa502", // warm amber
    "#ff6b6b", // coral red
    "#ff9ff3", // soft pink
    "#48dbfb", // sky blue
    "#1dd1a1", // mint green
    "#10ac84", // teal
    "#54a0ff", // bright blue
    "#5f27cd", // royal purple
    "#222f3e", // deep navy
    "#c8d6e5", // light gray-blue
];

const colorPalette = new ColorPalette(paletteContainer, colors);

function init() {

}