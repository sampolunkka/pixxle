import {clientPosToGridCoords} from "../utils.js";

export class InputController extends EventTarget {
    constructor(toolManager, viewport) {
        super();

        this.toolManager = toolManager;
        this.viewport = viewport;
    }

    init() {
        window.addEventListener('pointerdown', e => this.onPointerDown(e));
        window.addEventListener('pointermove', e => this.onPointerMove(e));
        window.addEventListener('pointerup', e => this.onPointerUp(e));
        window.addEventListener('wheel', e => this.onWheel(e), {passive: false});
        /*
        window.addEventListener('wheel',       e => this.#emit('wheel', e), {passive: false});
        window.addEventListener('keydown',     e => this.#emit('key', e));
        */
    }

    onPointerDown(e) {
        if (e.button === 1) { this.viewport.onPointerDown(e); return; }
        if (e.button === 0) { this.toolManager.onPointerDown(e, this.#getGridCoords(e)); }
    }

    onPointerMove(e) {
        this.viewport.onPointerMove(e);
        this.toolManager.onPointerMove(e, this.#getGridCoords(e));
    }

    onPointerUp(e) {

        if (e.button === 1) { this.viewport.onPointerUp(e); return; }
        if (e.button === 0) { this.toolManager.onPointerUp(e, this.#getGridCoords(e)); }
    }

    onWheel(e) {
        if (e.ctrlKey || e.metaKey) return;

        e.preventDefault();
        this.viewport.onWheel(e.deltaY);
    }

    #getGridCoords(e) {
        return clientPosToGridCoords(
            this.viewport.getDrawingAreaClientBoundingRect(),
            e.clientX,
            e.clientY,
            this.viewport.getZoom());
    }

    // TODO: Add window panning and zooming support
    // TODO: Add context menu support
}
