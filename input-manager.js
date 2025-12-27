export class InputManager {
    constructor(root = window) {
        this.root = root;
        this.handlers = new Map(); // eventName -> Set(fn)
        this.enabled = true;
        this.lastClient = null; // keep last pointer client pos for compatibility
        this._bound = {
            pointerdown: this._onPointerDown.bind(this),
            pointermove: this._onPointerMove.bind(this),
            pointerup: this._onPointerUp.bind(this),
            wheel: this._onWheel.bind(this),
            keydown: this._onKeyDown.bind(this),
            keyup: this._onKeyUp.bind(this),
            auxclick: this._onAuxClick.bind(this),
        };
        this._addListeners();
    }

    _addListeners() {
        this.root.addEventListener('pointerdown', this._bound.pointerdown, {passive: true});
        this.root.addEventListener('pointermove', this._bound.pointermove, {passive: true});
        this.root.addEventListener('pointerup', this._bound.pointerup, {passive: true});
        this.root.addEventListener('wheel', this._bound.wheel, {passive: false});
        window.addEventListener('keydown', this._bound.keydown, {passive: true});
        window.addEventListener('keyup', this._bound.keyup, {passive: true});
        this.root.addEventListener('auxclick', this._bound.auxclick, {passive: false});
    }

    _removeListeners() {
        this.root.removeEventListener('pointerdown', this._bound.pointerdown);
        this.root.removeEventListener('pointermove', this._bound.pointermove);
        this.root.removeEventListener('pointerup', this._bound.pointerup);
        this.root.removeEventListener('wheel', this._bound.wheel);
        window.removeEventListener('keydown', this._bound.keydown);
        window.removeEventListener('keyup', this._bound.keyup);
        this.root.removeEventListener('auxclick', this._bound.auxclick);
    }

    on(name, fn) {
        if (!this.handlers.has(name)) this.handlers.set(name, new Set());
        this.handlers.get(name).add(fn);
    }

    off(name, fn) {
        this.handlers.get(name)?.delete(fn);
    }

    emit(name, payload) {
        if (!this.enabled) return;
        const set = this.handlers.get(name);
        if (!set) return;
        set.forEach(h => {
            try {
                h(payload);
            } catch (e) {
            }
        });
    }

    _normalizePointer(e) {
        // keep last pointer client pos for consumers that expect it
        this.lastClient = {x: e.clientX, y: e.clientY};
        return {
            type: e.type,
            originalEvent: e,
            pointerId: e.pointerId,
            button: e.button,
            buttons: e.buttons,
            clientX: e.clientX,
            clientY: e.clientY,
            target: e.target,
        };
    }

    _onPointerDown(e) {
        this.emit('pointerdown', this._normalizePointer(e));
    }

    _onPointerMove(e) {
        this.emit('pointermove', this._normalizePointer(e));
    }

    _onPointerUp(e) {
        this.emit('pointerup', this._normalizePointer(e));
    }

    _onWheel(e) {
        this.emit('wheel', {
            originalEvent: e,
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            clientX: e.clientX,
            clientY: e.clientY,
            target: e.target
        });
    }

    _onKeyDown(e) {
        this.emit('keydown', {originalEvent: e, key: e.key, code: e.code, target: e.target});
    }

    _onKeyUp(e) {
        this.emit('keyup', {originalEvent: e, key: e.key, code: e.code, target: e.target});
    }

    _onAuxClick(e) {
        this.emit('auxclick', {
            originalEvent: e,
            button: e.button,
            clientX: e.clientX,
            clientY: e.clientY,
            target: e.target
        });
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    destroy() {
        this._removeListeners();
        this.handlers.clear();
        this.lastClient = null;
    }
}
