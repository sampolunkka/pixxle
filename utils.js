import {Shape} from './const.js';

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

export function clientPosToWorkspaceCoords(workspace, clientX, clientY, zoom) {
    const rect = workspace.getCanvasBoundingClientRect();
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

export function makeRandomHex(min = 0, max = 255) {
    const clamp = v => Math.min(255, Math.max(0, v));
    min = clamp(min);
    max = clamp(max);

    const rand = () =>
        Math.floor(Math.random() * (max - min + 1) + min)
            .toString(16)
            .padStart(2, "0");

    return `#${rand()}${rand()}${rand()}`;
}

export function squarePixels(cx, cy, color, size) {
    const half = Math.floor(size / 2);
    const pixels = [];
    for (let y = cy - half; y <= cy + half; y++) {
        for (let x = cx - half; x <= cx + half; x++) {
            pixels.push({x, y, color});
        }
    }
    return pixels;
}

export function circlePixels(cx, cy, color, size) {
    const radius = Math.floor(size / 2);
    const r2 = radius * radius;
    const pixels = [];
    for (let dy = -radius; dy <= radius; dy++) {
        const dxLimit = Math.floor(Math.sqrt(r2 - dy * dy));
        for (let dx = -dxLimit; dx <= dxLimit; dx++) {
            pixels.push({x: cx + dx, y: cy + dy, color});
        }
    }
    return pixels;
}

export function shapePixels(cx, cy, color, shape, size) {
    switch (shape) {
        case Shape.CIRCLE: return circlePixels(cx, cy, color, size);
        case Shape.SQUARE: return squarePixels(cx, cy, color, size);
        default:           return [{x: cx, y: cy, color}];
    }
}