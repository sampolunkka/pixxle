export class Viewport extends EventTarget {
    static MIN_ZOOM = 1;
    static WHEEL_ZOOM_FACTOR = 1.0015;
    static GRID_MIN_PIXEL_SIZE = 8;

    /**
     * @param {object} opts
     * @param {Element} opts.canvasStack
     * @param {HTMLElement} opts.grid
     * @param {HTMLElement} opts.checkerboard
     * @param maxZoom = 64
     */
    constructor({
                    canvasStack,
                    grid,
                    checkerboard
                },
                    maxZoom = 64,) {
        super();

        this.canvasStack = canvasStack;
        this.grid = grid;
        this.checkerboard = checkerboard;

        this.width = 0;
        this.height = 0;
        this.maxZoom = maxZoom;

        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
    }

    init(width, height) {
        this.width = width;
        this.height = height;
        this.zoom = this.#clampZoom(this.getInitialZoom());
        this.applyTransform();
        this.#emitZoomChange();
    }

    getZoom() {
        return this.zoom;
    }

    setZoom(zoom) {
        const next = this.#clampZoom(zoom);
        if (next === this.zoom) return;

        this.zoom = next;
        this.applyTransform();
        this.#emitZoomChange();
    }

    zoomByWheel(deltaY) {
        this.setZoom(this.zoom * Math.pow(Viewport.WHEEL_ZOOM_FACTOR, -deltaY));
    }

    setPan(panX, panY) {
        this.panX = panX;
        this.panY = panY;
        this.applyTransform();
    }

    panBy(dx, dy) {
        this.setPan(this.panX + dx, this.panY + dy);
    }

    resetPan() {
        this.setPan(0, 0);
    }

    getInitialZoom() {
        const maxZoomWidth = (window.innerWidth / this.width) * 0.8;
        const maxZoomHeight = (window.innerHeight / this.height) * 0.8;
        return Math.floor(Math.min(maxZoomWidth, maxZoomHeight));
    }

    applyTransform() {
        const { zoom, panX, panY } = this;

        this.canvasStack.style.transform =
            `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`;

        this.updatePixelGrid();
        this.updateCheckerboard();

        this.dispatchEvent(new CustomEvent('viewchange', {
            detail: { zoom, panX, panY },
        }));
    }

    getDrawingAreaClientBoundingRect() {
        return this.checkerboard.getBoundingClientRect();
    }

    updatePixelGrid() {
        const pixelSize = this.zoom;

        if (pixelSize < Viewport.GRID_MIN_PIXEL_SIZE) {
            this.grid.style.display = 'none';
            return;
        }

        this.grid.style.display = '';
        this.grid.style.setProperty('--pixel-size', pixelSize + 'px');
        this.grid.style.width = this.width * this.zoom + 'px';
        this.grid.style.height = this.height * this.zoom + 'px';
        this.grid.style.transform = this.#overlayTransform();
    }

    updateCheckerboard() {
        const pixelSize = this.zoom;

        // TODO: Make checkerboard min tile size configurable
        // Checker tile = 8x pixel size, but never smaller than 8px
        const checkerSize = Math.max(pixelSize * 8, 8);

        this.checkerboard.style.setProperty('--pixel-size', pixelSize + 'px');
        this.checkerboard.style.setProperty('--checker-size', checkerSize + 'px');
        this.checkerboard.style.width = this.width * this.zoom + 'px';
        this.checkerboard.style.height = this.height * this.zoom + 'px';

        // Must match canvas + grid transform EXACTLY
        this.checkerboard.style.transform = this.#overlayTransform();
    }

    #overlayTransform() {
        return `translate(calc(50vw - 50% + ${this.panX}px), calc(50vh - 50% + ${this.panY}px))`;
    }

    #clampZoom(zoom) {
        return Math.max(Viewport.MIN_ZOOM, Math.min(this.maxZoom, zoom));
    }

    #emitZoomChange() {
        this.dispatchEvent(new CustomEvent('zoomchange', {
            detail: { zoom: this.zoom },
        }));
    }
}
