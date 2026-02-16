class ContextMenu {
    constructor() {
        this.contextMenuElement = null;
        this.anchorElement = null;
        this.isOpen = false;
    }

    init(contextMenuElement) {
        this.contextMenuElement = contextMenuElement;

        // Close menu on outside click
        document.addEventListener('click', (event) => {
            if (!this.contextMenuElement.contains(event.target)) {
                this.close();
            }
        });

        console.log('contextMenu initialized');
    }

    open(x, y, options, anchorElement = null) {
        console.log('open', x, y, options, anchorElement);
        this.contextMenuElement.innerHTML = '';
        this.anchorElement = anchorElement;
        this.contextMenuElement.classList.remove('hidden');
        options.forEach(option => {
            const menuItemElement = document.createElement('button');
            menuItemElement.className = 'menu-item';
            menuItemElement.textContent = option.label;
            menuItemElement.addEventListener('click', () => {
                option.onClick();
                this.close();
            });
            this.contextMenuElement.appendChild(menuItemElement);
        });
        this.isOpen = true;
        this.updatePosition();
    }

    close() {
        this.contextMenuElement.innerHTML = '';
        this.contextMenuElement.classList.add('hidden');
        this.isOpen = false;
    }

    updatePosition() {
        if (!this.isOpen) return;

        // Get anchor position
        const rect = this.anchorElement.getBoundingClientRect();
        const menuWidth = this.contextMenuElement.offsetWidth;
        const menuHeight = this.contextMenuElement.offsetHeight;

        // Compute menu position
        let left = rect.right;
        let top = rect.top;

        // Open left if not enough space on right
        if (rect.right + menuWidth > window.innerWidth) {
            left = rect.left - menuWidth - 16;
        }

        // Shift up if off bottom
        if (rect.top + menuHeight > window.innerHeight) {
            top = window.innerHeight - menuHeight - 8;
        }

        this.contextMenuElement.style.left = left + 'px';
        this.contextMenuElement.style.top = top + 'px';
    }
}

export const contextMenu = new ContextMenu();