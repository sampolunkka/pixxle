export const TRANSPARENT_SENTINEL = 0x00000000;

export function isInsideCanvas(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return (
        clientX >= rect.left &&
        clientX < rect.right &&
        clientY >= rect.top &&
        clientY < rect.bottom
    );
}

export function clientPosToCanvasCoords(canvas, clientX, clientY, zoom) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / zoom);
    const y = Math.floor((clientY - rect.top) / zoom);
    return { x, y };
}

export function sixBitHexTo0xColor(hex) {
    hex = hex.replace('#', '');
    return ((parseInt(hex, 16) << 8) | 0xFF) >>> 0;
}

export function intToSixBitHex(i) {
    let hex = (i >>> 0).toString(16).padStart(8, '0');
    return '#' + hex.slice(0, 6);
}