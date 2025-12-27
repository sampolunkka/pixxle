// javascript
export class PanHandler {
    constructor(inputManager, targetEl, { optInSelector = '[data-pan-enabled]' } = {}) {
        if (!inputManager) throw new Error('PanHandler requires an InputManager');
        this.input = inputManager;
        this.optInSelector = optInSelector;
        this.el = this._resolveEl(targetEl);
        if (!this.el) throw new Error('PanHandler requires a target element');

        this.isPanning = false;
        this.panX = 0;
        this.panY = 0;
        this._startX = 0;
        this._startY = 0;
        this._baseX = 0;
        this._baseY = 0;
        this._prevBodyCursor = '';

        if (!this.el.style.transform) this.el.style.transform = 'translate(-50%, -50%)';

        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onAux = this._onAux.bind(this);

        // always use the global root so we intercept events outside canvas-wrap
        this._nativeRoot = window;
        this._nativePointerDown = this._nativePointerDown.bind(this);
        this._nativeAuxClick = this._nativeAuxClick.bind(this);
        this._nativePointerMove = this._nativePointerMove.bind(this);
        this._nativePointerUp = this._nativePointerUp.bind(this);

        this._addListeners();
        // still use InputManager for move/up emission when appropriate
        this.input.on('pointermove', this._onPointerMove);
        this.input.on('pointerup', this._onPointerUp);
        this.input.on('auxclick', this._onAux); // defensive fallback
    }

    _addListeners() {
        // capture non-passive so we can call preventDefault safely and stop propagation
        this._nativeRoot.addEventListener('pointerdown', this._nativePointerDown, { passive: false, capture: true });
        this._nativeRoot.addEventListener('auxclick', this._nativeAuxClick, { passive: false, capture: true });
    }

    _removeListeners() {
        this._nativeRoot.removeEventListener('pointerdown', this._nativePointerDown, { capture: true });
        this._nativeRoot.removeEventListener('auxclick', this._nativeAuxClick, { capture: true });
        // also ensure any move/up listeners are removed
        this._removeNativeMoveUp();
    }

    _addNativeMoveUp() {
        // add global move/up so panning continues and ends outside InputManager root
        this._nativeRoot.addEventListener('pointermove', this._nativePointerMove, { passive: true, capture: true });
        this._nativeRoot.addEventListener('pointerup', this._nativePointerUp, { passive: true, capture: true });
    }

    _removeNativeMoveUp() {
        try {
            this._nativeRoot.removeEventListener('pointermove', this._nativePointerMove, { capture: true });
            this._nativeRoot.removeEventListener('pointerup', this._nativePointerUp, { capture: true });
        } catch (err) {}
    }

    _resolveEl(target) {
        if (!target) return document.querySelector('.canvas-wrap') || document.getElementById('canvas');
        if (target instanceof HTMLElement) return target;
        if (typeof target === 'string') return document.querySelector(target);
        return null;
    }

    _isInteractive(node) {
        if (!node || node.nodeType !== 1) return false;
        const tag = node.tagName;
        if (!tag) return false;
        if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(tag)) return true;
        if (node.hasAttribute && node.hasAttribute('contenteditable') && node.getAttribute('contenteditable') !== 'false') return true;
        return false;
    }

    _isOptIn(node) {
        // allow outside panning by default unless an ancestor explicitly disables it
        if (!node || node.nodeType !== 1) return true;
        const elOpt = node.closest && node.closest(this.optInSelector);
        if (!elOpt) return true;
        const val = elOpt.getAttribute('data-pan-enabled');
        if (val === null) return true;
        return !(val === 'false' || val === '0');
    }

    _applyPan(x = this.panX, y = this.panY) {
        this.el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }

    _nativePointerDown(e) {
        // intercept middle-button before InputManager emits (prevents tools receiving it)
        if (e.button !== 1) return;
        const target = e.target;
        const allowed = (this.el.contains && !this.el.contains(target)) ? this._isOptIn(target) : true;
        if (!allowed) return;
        if (this._isInteractive(target)) return;

        // non-passive capture listener: safe to preventDefault and stop propagation
        e.preventDefault();
        e.stopPropagation();

        this.isPanning = true;
        this._startX = e.clientX;
        this._startY = e.clientY;
        this._baseX = this.panX;
        this._baseY = this.panY;
        this._prevBodyCursor = document.body.style.cursor || '';
        document.body.style.cursor = 'grabbing';
        this.el.style.cursor = 'grabbing';

        // ensure we receive pointermove/pointerup globally while panning
        this._addNativeMoveUp();
    }

    _nativeAuxClick(e) {
        // intercept middle-button auxclick to prevent default behavior when panning allowed
        if (e.button !== 1) return;
        const target = e.target;
        const allowed = (this.el.contains && !this.el.contains(target)) ? this._isOptIn(target) : true;
        if (!allowed) return;
        if (this._isInteractive(target)) return;

        e.preventDefault();
        e.stopPropagation();
    }

    _nativePointerMove(e) {
        if (!this.isPanning) return;
        const dx = e.clientX - this._startX;
        const dy = e.clientY - this._startY;
        this._applyPan(this._baseX + dx, this._baseY + dy);
    }

    _nativePointerUp(e) {
        if (!this.isPanning) return;
        const dx = e.clientX - this._startX;
        const dy = e.clientY - this._startY;
        this.panX = this._baseX + dx;
        this.panY = this._baseY + dy;
        this.isPanning = false;
        document.body.style.cursor = this._prevBodyCursor || '';
        this._prevBodyCursor = '';
        this.el.style.cursor = '';
        this._applyPan();
        // remove the temporary global move/up listeners
        this._removeNativeMoveUp();
    }

    _onPointerMove(payload) {
        if (!this.isPanning) return;
        const dx = payload.clientX - this._startX;
        const dy = payload.clientY - this._startY;
        this._applyPan(this._baseX + dx, this._baseY + dy);
    }

    _onPointerUp(payload) {
        if (!this.isPanning) return;
        const dx = payload.clientX - this._startX;
        const dy = payload.clientY - this._startY;
        this.panX = this._baseX + dx;
        this.panY = this._baseY + dy;
        this.isPanning = false;
        document.body.style.cursor = this._prevBodyCursor || '';
        this._prevBodyCursor = '';
        this.el.style.cursor = '';
        this._applyPan();
        // ensure native listeners cleaned up in case InputManager handled the up
        this._removeNativeMoveUp();
    }

    _onAux(payload) {
        const e = payload.originalEvent || payload;
        if (payload.button !== 1) return;
        const target = payload.target;
        const allowed = (this.el.contains && !this.el.contains(target)) ? this._isOptIn(target) : true;
        if (allowed && !this._isInteractive(target)) {
            try { e.preventDefault && e.preventDefault(); } catch (err) {}
        }
    }

    reset() {
        this.panX = 0;
        this.panY = 0;
        this._applyPan();
    }

    destroy() {
        this._removeListeners();
        this.input.off('pointermove', this._onPointerMove);
        this.input.off('pointerup', this._onPointerUp);
        this.input.off('auxclick', this._onAux);
        this.el = null;
    }
}
