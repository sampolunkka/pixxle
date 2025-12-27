import { intToCss, TRANSPARENT_SENTINEL, parseHexToInt } from './utils.js';

export function createPreviewWindow(model) {
    const previewCanvas = document.getElementById('previewCanvas');
    const previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;
    const previewScaleSelect = document.getElementById('previewScale');
    let previewScale = previewScaleSelect ? Number(previewScaleSelect.value) || 1 : 1;

    function updatePreviewCanvasSize() {
        if (!previewCanvas || !model.width) return;
        const DPR = Math.max(1, window.devicePixelRatio || 1);
        const cssW = model.width * previewScale;
        const cssH = model.height * previewScale;
        previewCanvas.style.width = cssW + 'px';
        previewCanvas.style.height = cssH + 'px';
        previewCanvas.width = Math.round(cssW * DPR);
        previewCanvas.height = Math.round(cssH * DPR);
        if (previewCtx) {
            previewCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
            previewCtx.imageSmoothingEnabled = false;
        }
    }

    function drawCheckerboardPreview() {
        if (!previewCtx) return;
        const c1 = '#e6e6e6';
        const c2 = '#ffffff';
        for (let y = 0; y < model.height; y++) {
            for (let x = 0; x < model.width; x++) {
                previewCtx.fillStyle = ((x + y) & 1) ? c1 : c2;
                previewCtx.fillRect(x * previewScale, y * previewScale, previewScale, previewScale);
            }
        }
    }

    function renderPreview() {
        if (!previewCtx || !model.pixels || !model.width) {
            if (previewCanvas) previewCanvas.style.display = 'none';
            return;
        }
        previewCanvas.style.display = 'inline-block';
        updatePreviewCanvasSize();

        let needsChecker = false;
        try {
            if (parseHexToInt(model.bgColor) === TRANSPARENT_SENTINEL) needsChecker = true;
        } catch (e) {}
        if (!needsChecker) {
            for (let i = 0; i < model.pixels.length; i++) {
                if (model.pixels[i] === TRANSPARENT_SENTINEL) { needsChecker = true; break; }
            }
        }

        if (needsChecker) {
            drawCheckerboardPreview();
        } else {
            previewCtx.clearRect(0, 0, model.width * previewScale, model.height * previewScale);
        }

        for (let y = 0; y < model.height; y++) {
            for (let x = 0; x < model.width; x++) {
                const c = model.pixels[y * model.width + x];
                if (c === TRANSPARENT_SENTINEL) {
                    if (!needsChecker) previewCtx.clearRect(x * previewScale, y * previewScale, previewScale, previewScale);
                } else {
                    previewCtx.fillStyle = intToCss(c);
                    previewCtx.fillRect(x * previewScale, y * previewScale, previewScale, previewScale);
                }
            }
        }
    }

    if (previewScaleSelect) {
        previewScaleSelect.addEventListener('change', () => {
            previewScale = Math.max(1, Number(previewScaleSelect.value) || 1);
            updatePreviewCanvasSize();
            renderPreview();
        });
    }

    return { updatePreviewCanvasSize, renderPreview };
}