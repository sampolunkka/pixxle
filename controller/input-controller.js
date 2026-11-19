export class InputController extends EventTarget {
    constructor(toolManager) {
        super();

        this.toolManager = toolManager;
    }

    init() {
        window.addEventListener('pointerdown', e => this.onPointerDown(e));
        window.addEventListener('pointermove', e => this.onPointerMove(e));
        window.addEventListener('pointerup',   e => this.onPointerUp(e));
        /*
        window.addEventListener('wheel',       e => this.#emit('wheel', e), {passive: false});
        window.addEventListener('keydown',     e => this.#emit('key', e));
        */
    }

    onPointerDown(e) {
        this.toolManager.onPointerDown(e);
    }

    onPointerMove(e) {
        this.toolManager.onPointerMove(e);
    }

    onPointerUp(e) {
        this.toolManager.onPointerUp(e);
    }

    // TODO: Add window panning and zooming support
    // TODO: Add context menu support
}