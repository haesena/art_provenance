/**
 * Generates a deterministic HSL color based on a string seed.
 * Useful for assigning consistent colors to items without images.
 */
export const getDeterministicColor = (seed: string): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use HSL for better control over vibrancy and lightness
    // Hue: 0-360
    const h = Math.abs(hash) % 360;
    // Saturation: 40-60% (avoid too neon or too gray)
    const s = 50 + (Math.abs(hash >> 8) % 20);
    // Lightness: 60-80% (keep it light and pastel-like)
    const l = 70 + (Math.abs(hash >> 16) % 15);

    return `hsl(${h}, ${s}%, ${l}%)`;
};
