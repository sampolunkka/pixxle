import {workspace} from './workspace/workspace.js';
import {clientPosToCanvasCoords, clientPosToWorkspaceCoords, isInsideCanvas, sixBitHexTo0xColor} from "./utils.js";
import {createDocumentPreview} from "./preview-window.js";
import {contextMenu} from "./context-menu/custom-context-menu.js";
import {PencilTool} from "./toolbox/pencil-tool.js";
import {toolManager} from "./toolbox/tool-manager.js";
import {EraserTool} from "./toolbox/eraser-tool.js";
import {ColorPalette} from "./bottom-bar/color-palette.js";

const setupForm = document.getElementById('setup');
const foregroundCanvas = document.getElementById('foreground-canvas');
const bgColorElement = document.getElementById('background-color-picker');
const canvasStack = document.querySelector('.canvas-stack');
const workspaceElement = document.querySelector('.workspace');
const grid = document.getElementById('pixel-grid');
const canvasScale = document.getElementById('canvas-scale');
const toolSize = document.getElementById('tool-size');
const toolShape = document.getElementById('tool-shape');
const layersList = document.getElementById('layers-list');
const layersPanelElement = document.getElementById('layers-panel');
const paletteContainer = document.querySelector('.bottom-bar');
const layersContainer = document.querySelector('.right-bar');
const toolsContainer = document.querySelector('.top-bar');
const checkerboard = document.getElementById('checkerboard-background');
const contextMenuElement = document.getElementById('custom-context-menu');

const toolButtons = document.querySelectorAll('.button-tool');
const toolsMap = {
    pencil: new PencilTool(),
    eraser: new EraserTool()/*,
    eyedropper: new EyedropperTool()*/
};

let bgColor = sixBitHexTo0xColor(bgColorElement.value);
let zoom = 1;
const maxZoom = 500;
let width = 0;
let height = 0;
let preview = null;
let lastPointer = {x: 0, y: 0};

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
    if (btn.classList.contains('disabled')) return;
    btn.addEventListener('click', () => {
        toolManager.setActiveTool(btn.dataset.tool);
        toolButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// TODO: Move this to separate module which handles Layer UI
function createLayerListItem(index, layer, isActive) {
    // Name button
    const item = document.createElement('button');

    item.className = 'button-layer' +
        (isActive ? ' active' : '') +
        (layer.locked ? ' locked' : '');
    item.type = 'button';
    item.textContent = `${index + 1}`;
    item.title = item.textContent;
    item.dataset.layer = index;

    return item;
}

// TODO: Move this to separate module which handles Layer UI
function renderLayersPanel() {
    layersList.innerHTML = '';
    for (let i = workspace.layers.length - 1; i >= 0; i--) {
        const layer = workspace.layers[i];
        const isActive = i === workspace.activeLayerIdx;
        const item = createLayerListItem(i, layer, isActive);
        layersList.appendChild(item);
    }
}

// TODO: Move this to separate module which handles Layer UI
document.getElementById('add-layer-button').addEventListener('click', () => {
    if (!workspace.width) return;
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

// TODO: Move this to separate module which handles Layer UI
// Layer selecting
layersList.addEventListener('click', (e) => {
    if (!workspace.width) return;
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

workspaceElement.addEventListener('mousedown', (e) => {
    if (!contextMenuElement.contains(e.target)) {
        contextMenuElement.classList.add('hidden');
        contextMenuElement.innerHTML = '';
    }
})

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

function updateCheckerboard() {
    const pixelSize = zoom;

    // Checker tile = 4x pixel grid OR minimum 8px
    const checkerSize = Math.max(pixelSize * 8, 8);

    checkerboard.style.setProperty('--pixel-size', pixelSize + 'px');
    checkerboard.style.setProperty('--checker-size', checkerSize + 'px');

    checkerboard.style.width = width * zoom + 'px';
    checkerboard.style.height = height * zoom + 'px';

    // Must match canvas + grid transform EXACTLY
    checkerboard.style.transform =
        `translate(calc(50vw - 50% + ${panX}px), calc(50vh - 50% + ${panY}px))`;
}

function applyTransform() {
    canvasStack.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`;
    canvasScale.textContent = `Zoom: ${zoom}x`;

    // Update sidebar positions
    // TODO: Clean up this POC
    const workspaceWidth = document.body.clientWidth;
    const centerX = workspaceWidth / 2 + panX;
    const canvasRight = centerX - (width * zoom) / 2;
    const layerPanelWidth = layersContainer.offsetWidth;
    const layerPanelCalculatedX = canvasRight - layerPanelWidth - 20;
    const layerPanelMinX = 8; // Minimum distance from the left edge
    const layerPanelFinalX = Math.max(layerPanelCalculatedX, layerPanelMinX);
    layersContainer.style.right = `${layerPanelFinalX}px`;

    updatePixelGrid();
    updateCheckerboard()
}

function getInitialZoom() {
    let maxZoomWidth = window.innerWidth / width * 0.8;
    let maxZoomHeight = window.innerHeight / height * 0.8;
    return Math.floor(Math.min(maxZoomWidth, maxZoomHeight));
}

// Wheel zooming
workspaceElement.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();

        const zoomFactor = 1.0015; // tweak this
        zoom *= Math.pow(zoomFactor, -e.deltaY);

        zoom = Math.max(1, Math.min(maxZoom, zoom)); // keep your min zoom

        applyTransform();
        contextMenu.updatePosition();
    }
}, {passive: false});

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

// Use tool
window.addEventListener('pointerdown', (e) => {
    if (!workspace.width) return;
    if (!cursorIsOverWorkspace(e.clientX, e.clientY)) return;
    if (!toolManager) return;
    isDrawing = true;
    lastDrawX = null;
    lastDrawY = null;
    const coords = clientPosToWorkspaceCoords(workspace, e.clientX, e.clientY, zoom);
    useTool(workspace, coords.x, coords.y, sixBitHexTo0xColor(colorPalette.getPrimaryColor()));
    lastDrawX = coords.x;
    lastDrawY = coords.y;
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
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    workspace.update();
    if (preview) preview.renderPreview();
}

function cursorIsOverWorkspace(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    return el && el.closest(".workspace");
}

window.addEventListener('pointermove', (e) => {
    lastPointer = {x: e.clientX, y: e.clientY};
    if (!workspace.width || !toolManager) return;
    if (!isDrawing && !cursorIsOverWorkspace(e.clientX, e.clientY)) {
        lastDrawX = null;
        lastDrawY = null;
        workspace.clearOverlays();
        return;
    }

    const coords = clientPosToWorkspaceCoords(workspace, e.clientX, e.clientY, zoom);

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

layersList.addEventListener('contextmenu', (e) => {
    const item = e.target.closest('.button-layer');

    if (!item) return;

    e.preventDefault();
    contextMenu.open(e.clientX, e.clientY, [
        {
            label: 'Delete Layer',
            onClick: () => {
                const idx = parseInt(item.dataset.layer, 10);
                workspace.removeLayer(idx);
                renderLayersPanel();
            }
        }
    ], item);

});

setupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    width = document.getElementById('width').value;
    height = document.getElementById('height').value;

    zoom = getInitialZoom();
    if (zoom < 1) zoom = 1;

    workspace.init(width, height, [foregroundCanvas], bgColor);
    toolManager.init(toolsMap);
    contextMenu.init(contextMenuElement);

    /* Preview Windows - disabled until new position is decided
    let canvases = canvasStack.children;

    preview = createDocumentPreview(canvases);
    preview.renderPreview();
     */

    setupForm.classList.add('hidden');
    canvasStack.classList.remove('hidden');
    grid.classList.remove('hidden');
    layersContainer.classList.remove('hidden');
    paletteContainer.classList.remove('hidden');
    toolsContainer.classList.remove('hidden');
    checkerboard.classList.remove('hidden');
    renderLayersPanel();
    applyTransform();

    // Initial hover
    const initialCoords = clientPosToWorkspaceCoords(workspace, lastPointer.x, lastPointer.y, zoom);
    hoverWithTool(workspace, initialCoords.x, initialCoords.y, sixBitHexTo0xColor(colorPalette.getPrimaryColor()));
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