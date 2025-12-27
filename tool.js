export class Tool {
    constructor(name, buttonEl) {
        this.name = name;
        this.buttonEl = buttonEl;
        this._active = false;

        this._listeners = {};

        // deps filled via attach()
        this.canvas = null;
        this.model = null;
        this.renderer = null;
        this.preview = null;
        this.colorEl = null;
        this.input = null;

        this.tipSize = 1;

        // Hover preferences
        this.hoverBorder = null;
        this.hoverShadow = null;
        this.hoverColor = null;

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);

        if (this.buttonEl) {
            this.buttonEl.addEventListener('click', () => this.activate());
        }
    }

    on(event, fn) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
    }

    emit(event, payload) {
        (this._listeners[event] || []).forEach(fn => fn(payload));
    }

    // override in concrete tools
    handleUse(model, x, y, color, { button } = {}) {
        return null;
    }

    // attach dependencies (call once during init)
    attach({ input, canvas, model, renderer, preview, colorEl } = {}) {
        this.input = input || this.input;
        this.canvas = canvas || this.canvas;
        this.model = model || this.model;
        this.renderer = renderer || this.renderer;
        this.preview = preview || this.preview;
        this.colorEl = colorEl || this.colorEl;
    }

    getHoverStyle() {
        return {
            size: this.tipSize,
            color: this.hoverColor || this.colorEl?.value,
            border: this.hoverBorder,
            shadow: this.hoverShadow
        }
    }

    _isOnCanvas(target) {
        return target === this.canvas || (this.canvas && this.canvas.contains && this.canvas.contains(target));
    }

    _getGridPos(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: Math.floor((clientX - rect.left) / this.model.pixelSize), y: Math.floor((clientY - rect.top) / this.model.pixelSize) };
    }

    _handleUse(button, payload) {
        if (!this.model || !this.canvas) return;
        if (!this._isOnCanvas(payload.target)) return;

        const { x, y } = this._getGridPos(payload.clientX, payload.clientY);
        if (x < 0 || y < 0 || x >= this.model.width || y >= this.model.height) return;

        const color = (this.name === 'eraser') ? this.model.bgColor : (this.colorEl?.value || '#000000');
        this.handleUse(this.model, x, y, color, { button });
        this.emit('change', { x, y, color, tool: this.name });
    }

    _onPointerDown(payload) {
        // payload includes originalEvent, pointerId, button, clientX/clientY, target
        if (!this._isOnCanvas(payload.target)) return;
        // pointer capture on the canvas element
        try { this.canvas.setPointerCapture && this.canvas.setPointerCapture(payload.pointerId); } catch (err) {}
        // immediate use
        this._handleUse(payload.button, payload);
    }

    _onPointerMove(payload) {
        // show hover and continue strokes if button held
        const { x, y } = this._getGridPos(payload.clientX, payload.clientY);
        // Always use the current color for the preview, fallback to black
        const color = this.colorEl?.value || '#000000';
        if (this.preview) this.preview.showHoverAt(payload.clientX, payload.clientY, color);
        // continue drawing while pointer has buttons pressed
        if (payload.buttons) {
            if ((payload.buttons & 1) || (payload.buttons & 2)) {
                const btn = (payload.buttons & 1) ? 0 : 2;
                this._handleUse(btn, payload);
            }
        }
    }

    _onPointerUp(payload) {
        try { this.canvas.releasePointerCapture && this.canvas.releasePointerCapture(payload.pointerId); } catch (err) {}
    }

    _subscribeInput() {
        if (!this.input) return;
        this.input.on('pointerdown', this._onPointerDown);
        this.input.on('pointermove', this._onPointerMove);
        this.input.on('pointerup', this._onPointerUp);
    }

    _unsubscribeInput() {
        if (!this.input) return;
        this.input.off('pointerdown', this._onPointerDown);
        this.input.off('pointermove', this._onPointerMove);
        this.input.off('pointerup', this._onPointerUp);
    }

    activate() {
        if (this._active) return;
        this._active = true;
        this.buttonEl && this.buttonEl.classList?.add('active');
        this._subscribeInput();
    }

    deactivate() {
        if (!this._active) return;
        this._active = false;
        this.buttonEl && this.buttonEl.classList?.remove('active');
        this._unsubscribeInput();
    }

    destroy() {
        this.deactivate();
        this.buttonEl = null;
        this.canvas = null;
        this.model = null;
        this.renderer = null;
        this.preview = null;
        this.colorEl = null;
        this.input = null;
    }
}
