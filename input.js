export function createInput(mainCanvasEl, model, renderer, preview, tools, colorEl, coordsEl, setZoom) {
    let drawing = false;
    let lastClient = null;
    let pencilAfterEyedropper = true;

    function getGridPos(clientX, clientY) {
        const rect = mainCanvasEl.getBoundingClientRect();
        return { x: Math.floor((clientX - rect.left) / model.pixelSize), y: Math.floor((clientY - rect.top) / model.pixelSize) };
    }

    function handleDraw(e) {
        const { x, y } = getGridPos(e.clientX, e.clientY);
        if (x >= 0 && x < model.width && y >= 0 && y < model.height) {
            const tool = tools.current;
            const color = (tool.name === 'eraser') ? model.bgColor : (colorEl.value || '#000000');
            const result = tool.handleDraw(model, x, y, color);
            if (tool.name === 'eyedropper' && result) {
                try { colorEl.value = result; } catch (err) {}
                if (pencilAfterEyedropper) {
                    tools.set('pencil');
                }
            }
            renderer.render();
            preview.renderPreview();
        }
    }

    mainCanvasEl.addEventListener('pointerdown', (e) => {
        drawing = true;
        mainCanvasEl.setPointerCapture(e.pointerId);
        handleDraw(e);
    });

    mainCanvasEl.addEventListener('pointermove', (e) => {
        const { x, y } = getGridPos(e.clientX, e.clientY);
        if (coordsEl) coordsEl.textContent = `x:${x} y:${y}`;
        if (drawing) handleDraw(e);
        preview.showHoverAt(e.clientX, e.clientY, colorEl.value);
        lastClient = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => { drawing = false; });

    mainCanvasEl.addEventListener('pointerenter', (e) => {
        preview.updateHoverSize();
        preview.showHoverAt(e.clientX, e.clientY, colorEl.value);
    });
    mainCanvasEl.addEventListener('pointerleave', () => preview.hideHover());

    mainCanvasEl.addEventListener('wheel', (e) => {
        if (!model.width) return;
        e.preventDefault();
        const dir = Math.sign(e.deltaY) || 0;
        const step = e.shiftKey ? 4 : 1;
        const newZoom = model.pixelSize - dir * step;
        setZoom && setZoom(newZoom);
    }, { passive: false });

    return { get lastClient() { return lastClient; } };
}