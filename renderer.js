import { intToCss, TRANSPARENT_SENTINEL, parseHexToInt } from './utils.js';

export function createRenderer(canvasEl, model) {
    const ctx = canvasEl.getContext('2d');

    function updateCanvasSize() {
        if (!model.width || !model.height) return;
        const DPR = Math.max(1, window.devicePixelRatio || 1);
        const cssW = model.width * model.pixelSize;
        const cssH = model.height * model.pixelSize;
        canvasEl.style.width = cssW + 'px';
        canvasEl.style.height = cssH + 'px';
        canvasEl.width = Math.round(cssW * DPR);
        canvasEl.height = Math.round(cssH * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.imageSmoothingEnabled = false;
    }

    function drawGrid() {
        if (!model.width || !model.height) return;
        const w = model.width * model.pixelSize;
        const h = model.height * model.pixelSize;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        const offset = 0.5;
        for (let i = 0; i <= model.width; i++) {
            const x = i * model.pixelSize + offset;
            ctx.moveTo(x, offset);
            ctx.lineTo(x, h + offset);
        }
        for (let j = 0; j <= model.height; j++) {
            const y = j * model.pixelSize + offset;
            ctx.moveTo(offset, y);
            ctx.lineTo(w + offset, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    function drawCheckerboard() {
        // subtle gray checkerboard
        const c1 = '#e6e6e6';
        const c2 = '#ffffff';
        for (let y = 0; y < model.height; y++) {
            for (let x = 0; x < model.width; x++) {
                ctx.fillStyle = ((x + y) & 1) ? c1 : c2;
                ctx.fillRect(x * model.pixelSize, y * model.pixelSize, model.pixelSize, model.pixelSize);
            }
        }
    }

    function render() {
        if (!model.width || !model.height || !model.previewComposite) return;
        const w = model.width * model.pixelSize;
        const h = model.height * model.pixelSize;
        ctx.clearRect(0, 0, w, h);

        // decide if checkerboard is needed (background or any pixel transparent)
        let needsChecker = false;
        try {
            if (parseHexToInt(model.bgColor) === TRANSPARENT_SENTINEL) needsChecker = true;
        } catch (e) {}
        if (!needsChecker) {
            for (let i = 0; i < model.previewComposite.length; i++) {
                if (model.previewComposite[i] === TRANSPARENT_SENTINEL) { needsChecker = true; break; }
            }
        }

        if (needsChecker) {
            drawCheckerboard();
        }

        // draw opaque pixels on top; transparent sentinel leaves checkerboard visible
        for (let y = 0; y < model.height; y++) {
            for (let x = 0; x < model.width; x++) {
                const c = model.previewComposite[y * model.width + x];
                if (c === TRANSPARENT_SENTINEL) continue;
                ctx.fillStyle = intToCss(c);
                ctx.fillRect(x * model.pixelSize, y * model.pixelSize, model.pixelSize, model.pixelSize);
            }
        }

        drawGrid();
    }

    return { updateCanvasSize, render, ctx };
}