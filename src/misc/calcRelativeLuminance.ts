/**
 * @description calcRelativeLuminance is a function that calculates the relative luminance of a color. E.g. if < 0.5, it's dark, if > 0.5, it's light. Helps with making text readable on a background.
 * @param {string} color - The color to calculate the relative luminance of.
 * @returns {number} The relative luminance of the color.
 */

export const calcRelativeLuminance = (color: string) => {
  if (!color) {
    return 0;
  }

  if (color.startsWith("rgba")) {
    const rgba = color.match(/[\d.]+/g)?.map(Number);
    if (!rgba || rgba.length < 3) return 0;
    const [r, g, b] = rgba;
    const result = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return result;
  }

  const hex = color.replace("#", "");
  let r: number, g: number, b: number;

  if (hex.length === 3 || hex.length === 4) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6 || hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return 0;
  }

  const result = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return result;
};
