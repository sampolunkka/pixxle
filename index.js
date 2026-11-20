import {Workspace} from './workspace/workspace.js';
import {sixBitHexTo0xColor} from "./utils.js";
import {contextMenu} from "./context-menu/custom-context-menu.js";
import {PencilTool} from "./toolbox/pencil-tool.js";
import ToolManager from "./toolbox/tool-manager.js";
import {EraserTool} from "./toolbox/eraser-tool.js";
import {ColorPalette} from "./bottom-bar/color-palette.js";
import {InputController} from "./controller/input-controller.js";
import {Viewport} from "./controller/viewport.js";

const setupForm = document.getElementById('setup');
const foregroundCanvas = document.getElementById('foreground-canvas');
const bgColorElement = document.getElementById('background-color-picker');
const canvasStack = document.querySelector('.canvas-stack');
const workspaceElement = document.querySelector('.workspace');
const grid = document.getElementById('pixel-grid');
const toolSize = document.getElementById('tool-size');
const toolShape = document.getElementById('tool-shape');
const layersList = document.getElementById('layers-list');
const paletteContainer = document.querySelector('.bottom-bar');
const layersContainer = document.querySelector('.right-bar');
const toolsContainer = document.querySelector('.top-bar');
const checkerboard = document.getElementById('checkerboard-background');
const contextMenuElement = document.getElementById('custom-context-menu');

const toolButtons = document.querySelectorAll('.button-tool');

let bgColor = sixBitHexTo0xColor(bgColorElement.value);
let zoom = 1;
const maxZoom = 500;
let width = 0;
let height = 0;

let panX = 0, panY = 0;

const toolsMap = {
    pencil: new PencilTool(),
    eraser: new EraserTool()/*,
    eyedropper: new EyedropperTool()*/
};

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

const viewport = new Viewport({canvasStack, grid, checkerboard});
const workspace = new Workspace({workspaceElement, canvasStack, grid, checkerboard});
const colorPalette = new ColorPalette(paletteContainer, colors);
const toolManager = new ToolManager(workspace, colorPalette);
const inputController = new InputController(toolManager, viewport);

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

    workspace.init(width, height, [foregroundCanvas], bgColor);
    viewport.init(width, height);
    toolManager.init(toolsMap);
    contextMenu.init(contextMenuElement);
    inputController.init();

    setupForm.classList.add('hidden');
    canvasStack.classList.remove('hidden');
    grid.classList.remove('hidden');
    layersContainer.classList.remove('hidden');
    paletteContainer.classList.remove('hidden');
    toolsContainer.classList.remove('hidden');
    checkerboard.classList.remove('hidden');
    renderLayersPanel();
});