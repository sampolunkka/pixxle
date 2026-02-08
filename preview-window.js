export function createDocumentPreview(canvases) {
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;
    const previewScaleSelect = document.getElementById('preview-scale-input');
    let previewScale = previewScaleSelect ? Number(previewScaleSelect.value) || 1 : 1;

    function updatePreviewCanvasSize() {
        if (!previewCanvas || !canvases[0] || !canvases[0].width) return;
        const DPR = Math.max(1, window.devicePixelRatio || 1);
        const cssW = canvases[0].width * previewScale;
        const cssH = canvases[0].height * previewScale;
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
        const baseCanvas = canvases[0];
        if (!previewCtx || !baseCanvas || !baseCanvas.width) {
            if (previewCanvas) previewCanvas.style.display = 'none';
            console.log("Preview canvas or base canvas not ready, skipping preview render");
            return;
        }
        previewCanvas.style.display = 'inline-block';
        updatePreviewCanvasSize();
        previewCtx.clearRect(0, 0, baseCanvas.width * previewScale, baseCanvas.height * previewScale);

        console.log("Rendering preview with scale:", previewScale);
        for (const c of canvases) {
            if (!c) continue;
            previewCtx.drawImage(
                c,
                0, 0, c.width, c.height,
                0, 0, c.width * previewScale, c.height * previewScale
            );
        }
    }

    if (previewScaleSelect) {
        previewScaleSelect.addEventListener('change', () => {
            previewScale = Math.max(1, Number(previewScaleSelect.value) || 1);
            updatePreviewCanvasSize();
            renderPreview();
        });
    }

    return { updatePreviewCanvasSize: updatePreviewCanvasSize, renderPreview };
}
