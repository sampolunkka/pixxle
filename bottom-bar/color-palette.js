import {makeRandomHex} from "../utils.js";

export class ColorPalette {
    constructor(paletteElement, colors) {
        this.paletteElement = paletteElement;
        this.colors = colors;
        this.activePrimary = undefined;
        this.activeSecondary = undefined;

        this.createColorPaletteElements();
    }

    createColorPaletteElements() {
        this.createAddSwatchButton();
        this.colors.forEach((color) => {
            this.addColor(color, true, false);
        })
        this.paletteElement.children[1].classList.add('active-primary');
        this.activePrimary = this.paletteElement.children[1];
    }

    createAddSwatchButton() {
        const button = document.createElement('button');
        button.textContent = '+';
        button.classList.add('button-swatch', 'button-add-item');
        button.id = "add-color-button";
        button.addEventListener('click', () => {
            const color = makeRandomHex(40, 220);
            this.addColor(color)
        })
        this.paletteElement.appendChild(button);
    }

    makeActivePrimary(swatch) {

    }

    createColorSwatch(color, animate = true) {
        const swatchElement = document.createElement('button');
        swatchElement.classList.add('button-swatch')
        if (animate) {
            swatchElement.classList.add('swatch-enter');
        }
        swatchElement.dataset.color = color;
        swatchElement.style.backgroundColor = color;

        // LMB
        swatchElement.addEventListener('click', (e) => {
            if (e.button !== 0) return;

            // Clear previous primary (if different)
            if (this.activePrimary && this.activePrimary !== swatchElement) {
                this.activePrimary.classList.remove('active-primary');
            }

            // If this was the secondary, swap
            if (this.activeSecondary === swatchElement) {
                swatchElement.classList.remove('active-secondary');
                this.activeSecondary = this.activePrimary;
                this.activeSecondary.classList.add('active-secondary');
            }

            // Set as primary
            swatchElement.classList.add('active-primary');
            this.activePrimary = swatchElement;
        });

        // RMB
        swatchElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            // Clear previous secondary (if different)
            if (this.activeSecondary && this.activeSecondary !== swatchElement) {
                this.activeSecondary.classList.remove('active-secondary');
            }

            // If this was the primary, swap
            if (this.activePrimary === swatchElement) {
                swatchElement.classList.remove('active-primary');
                this.activePrimary = this.activeSecondary;
                this.activePrimary.classList.add('active-primary');
            }

            // Set as secondary
            swatchElement.classList.add('active-secondary');
            this.activeSecondary = swatchElement;
        });

        return swatchElement;
    }

    addColor(color, append = false, animate = true) {
        this.colors.push(color);
        const swatchElement = this.createColorSwatch(color, animate);
        this.animateParentWidthDuring(() => {
            if (append || this.colors.length < 1) {
                this.paletteElement.appendChild(swatchElement);
            } else {
                this.paletteElement.insertBefore(
                    swatchElement,
                    this.paletteElement.children[1]
                );
            }
        }, animate);

        // Trigger animation
        requestAnimationFrame(() => {
            swatchElement.classList.remove("swatch-enter");
        });

        return swatchElement;
    }

    animateParentWidthDuring(mutator, animate = true) {

        const el = this.paletteElement;

        if (!animate) {
            mutator();
            return;
        }

        // Force current width
        const start = el.offsetWidth;
        el.style.width = start + "px";

        // Perform DOM change
        mutator();

        // Measure new natural width
        const end = el.scrollWidth;

        // Animate to it
        requestAnimationFrame(() => {
            el.style.width = end + "px";
        });

        // Reset back to auto after animation
        const cleanup = () => {
            el.style.width = "";
            el.removeEventListener("transitionend", cleanup);
        };
        el.addEventListener("transitionend", cleanup);
    }

    getPrimaryColor() {
        return this.activePrimary ? this.activePrimary.dataset.color : null;
    }

    getSecondaryColor() {
        return this.activeSecondary ? this.activeSecondary.dataset.color : null;
    }
}