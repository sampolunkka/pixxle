export class ZoomHandler {
    constructor(inputManager, targetEl, { optInSelector = '[data-zoom-enabled]' } = {}) {
        if (!inputManager) throw new Error('ZoomHandler requires an InputManager');
        this.input = inputManager;
        this.optInSelector = optInSelector;
        this.el = this._resolveEl(targetEl);
        this._onWheel = this._onWheel.bind(this);
        this.input.on('wheel', this._onWheel);
    }

    _resolveEl(target) {
        if (!target) return document.querySelector('.canvas-wrap') || document.getElementById('canvas');
        if (target instanceof HTMLElement) return target;
        if (typeof target === 'string') return document.querySelector(target);
        return null;
    }

    _isOptIn(node) {
        if (!node || node.nodeType !== 1) return true;
        const elOpt = node.closest && node.closest(this.optInSelector);
        if (!elOpt) return true;
        const val = elOpt.getAttribute('data-zoom-enabled');
        if (val === null) return true;
        return !(val === 'false' || val === '0');
    }

    _onWheel(payload) {
        const e = payload.originalEvent;
        if (!e) return;
        if (this.el && !this.el.contains(payload.target)) return;
        if (!this._isOptIn(payload.target)) return;
        e.preventDefault && e.preventDefault();
        const model = window.model;
        if (!model || !window.setZoom) return;
        const current = model.pixelSize;
        const delta = Math.sign(payload.deltaY);
        const next = Math.max(1, current + (delta > 0 ? -1 : 1));
        window.setZoom(next);
    }

    destroy() {
        this.input.off('wheel', this._onWheel);
        this.el = null;
    }
}
