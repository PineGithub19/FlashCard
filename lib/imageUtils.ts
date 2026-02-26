/**
 * Compute grid dimensions from a card count.
 * Tries to find the most square-like grid.
 */
export function computeGridDimensions(cardCount: number): { cols: number; rows: number } {
    const cols = Math.ceil(Math.sqrt(cardCount));
    const rows = Math.ceil(cardCount / cols);
    return { cols, rows };
}

/**
 * Returns the CSS clip/position values for a given card index in the grid.
 */
export function getCardPosition(
    index: number,
    cols: number,
    rows: number
): { col: number; row: number; percentX: number; percentY: number } {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const percentX = (col / cols) * 100;
    const percentY = (row / rows) * 100;
    return { col, row, percentX, percentY };
}

/**
 * Generate a unique ID.
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}
