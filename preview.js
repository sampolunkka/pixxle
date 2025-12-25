import { intToCss, TRANSPARENT_SENTINEL, parseHexToInt } from './utils.js';

export function createPreview(mainCanvasEl, model) {
    const hover = document.createElement('div');
    hover.id = 'pixel-preview';
    Object.assign(hover.style, {
        position: 'fixed', pointerEvents: 'none', boxSizing: 'border-box',
        border: '1px solid rgba(0,0,0,0.6)', display: 'none', transform: 'translateZ(0)', zIndex: 9999
    });
    document.body.appendChild(hover);

    function updateHoverSize() {
        hover.style.width = model.pixelSize + 'px';
        hover.style.height = model.pixelSize + 'px';
    }
    function hideHover() { hover.style.display = 'none'; }

    function showHoverAt(clientX, clientY, defaultColor = '#000') {
        if (!mainCanvasEl || !model.width) return hideHover();
        const rect = mainCanvasEl.getBoundingClientRect();
        const x = Math.floor((clientX - rect.left) / model.pixelSize);
        const y = Math.floor((clientY - rect.top) / model.pixelSize);
        if (x < 0 || x >= model.width || y < 0 || y >= model.height) return hideHover();
        hover.style.left = (rect.left + x * model.pixelSize) + 'px';
        hover.style.top = (rect.top + y * model.pixelSize) + 'px';
        const cInt = model.pixels ? model.pixels[y * model.width + x] : 0;
        if (cInt === TRANSPARENT_SENTINEL) {
            hover.style.background = defaultColor;
        } else {
            hover.style.background = intToCss(cInt);
        }
        hover.style.display = 'block';
    }

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

        // decide if checkerboard needed
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

        // draw pixels (transparent pixels will reveal checkerboard)
        for (let y = 0; y < model.height; y++) {
            for (let x = 0; x < model.width; x++) {
                const c = model.pixels[y * model.width + x];
                if (c === TRANSPARENT_SENTINEL) {
                    // leave checkerboard visible; ensure area is cleared if no checkerboard
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

    return { updateHoverSize, hideHover, showHoverAt, updatePreviewCanvasSize, renderPreview };
}