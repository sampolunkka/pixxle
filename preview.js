// javascript
import { intToCss } from './utils.js';

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
        if (!mainCanvasEl || !model.cols) return hideHover();
        const rect = mainCanvasEl.getBoundingClientRect();
        const x = Math.floor((clientX - rect.left) / model.pixelSize);
        const y = Math.floor((clientY - rect.top) / model.pixelSize);
        if (x < 0 || x >= model.cols || y < 0 || y >= model.rows) return hideHover();
        hover.style.left = (rect.left + x * model.pixelSize) + 'px';
        hover.style.top = (rect.top + y * model.pixelSize) + 'px';
        const cInt = model.pixels ? model.pixels[y * model.cols + x] : 0;
        hover.style.background = cInt ? intToCss(cInt) : defaultColor;
        hover.style.display = 'block';
    }

    const previewCanvas = document.getElementById('previewCanvas');
    const previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;
    const previewScaleSelect = document.getElementById('previewScale');
    let previewScale = previewScaleSelect ? Number(previewScaleSelect.value) || 1 : 1;

    function updatePreviewCanvasSize() {
        if (!previewCanvas || !model.cols) return;
        const DPR = Math.max(1, window.devicePixelRatio || 1);
        const cssW = model.cols * previewScale;
        const cssH = model.rows * previewScale;
        previewCanvas.style.width = cssW + 'px';
        previewCanvas.style.height = cssH + 'px';
        previewCanvas.width = Math.round(cssW * DPR);
        previewCanvas.height = Math.round(cssH * DPR);
        if (previewCtx) {
            previewCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
            previewCtx.imageSmoothingEnabled = false;
        }
    }

    function renderPreview() {
        if (!previewCtx || !model.pixels || !model.cols) {
            if (previewCanvas) previewCanvas.style.display = 'none';
            return;
        }
        previewCanvas.style.display = 'inline-block';
        updatePreviewCanvasSize();
        const pw = model.cols * previewScale;
        const ph = model.rows * previewScale;
        previewCtx.clearRect(0, 0, pw, ph);
        for (let y = 0; y < model.rows; y++) {
            for (let x = 0; x < model.cols; x++) {
                const c = model.pixels[y * model.cols + x] || 0;
                previewCtx.fillStyle = intToCss(c);
                previewCtx.fillRect(x * previewScale, y * previewScale, previewScale, previewScale);
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
