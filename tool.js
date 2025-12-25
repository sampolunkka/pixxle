export class Tool {
    constructor(name, buttonEl = null) {
        this.name = name;
        this.buttonEl = buttonEl;
        this.active = false;
        if (this.buttonEl) {
            this.buttonEl.title = this.buttonEl.title || name;
            this.buttonEl.setAttribute('role', 'button');
            this.buttonEl.setAttribute('aria-pressed', 'false');
        }
    }

    activate() {
        this.active = true;
        if (this.buttonEl) {
            this.buttonEl.classList.add('active');
            this.buttonEl.setAttribute('aria-pressed', 'true');
        }
    }

    deactivate() {
        this.active = false;
        if (this.buttonEl) {
            this.buttonEl.classList.remove('active');
            this.buttonEl.setAttribute('aria-pressed', 'false');
        }
    }

    /* handleDraw(canvasModel, x, y, color) - to be overridden */
    handleDraw(/* model, x, y, color */) {
        // no-op default
    }
}