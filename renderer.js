// javascript
import { intToCss } from './utils.js';

export function createRenderer(canvasEl, model) {
    const ctx = canvasEl.getContext('2d');

    function updateCanvasSize() {
        if (!model.cols || !model.rows) return;
        const DPR = Math.max(1, window.devicePixelRatio || 1);
        const cssW = model.cols * model.pixelSize;
        const cssH = model.rows * model.pixelSize;
        canvasEl.style.width = cssW + 'px';
        canvasEl.style.height = cssH + 'px';
        canvasEl.width = Math.round(cssW * DPR);
        canvasEl.height = Math.round(cssH * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.imageSmoothingEnabled = false;
    }

    function drawGrid() {
        if (!model.cols || !model.rows) return;
        const w = model.cols * model.pixelSize;
        const h = model.rows * model.pixelSize;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        const offset = 0.5;
        for (let i = 0; i <= model.cols; i++) {
            const x = i * model.pixelSize + offset;
            ctx.moveTo(x, offset);
            ctx.lineTo(x, h + offset);
        }
        for (let j = 0; j <= model.rows; j++) {
            const y = j * model.pixelSize + offset;
            ctx.moveTo(offset, y);
            ctx.lineTo(w + offset, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    function render() {
        if (!model.cols || !model.rows || !model.pixels) return;
        const w = model.cols * model.pixelSize;
        const h = model.rows * model.pixelSize;
        ctx.clearRect(0, 0, w, h);
        for (let y = 0; y < model.rows; y++) {
            for (let x = 0; x < model.cols; x++) {
                const c = model.pixels[y * model.cols + x] || 0;
                ctx.fillStyle = intToCss(c);
                ctx.fillRect(x * model.pixelSize, y * model.pixelSize, model.pixelSize, model.pixelSize);
            }
        }
        drawGrid();
    }

    return { updateCanvasSize, render, ctx };
}
