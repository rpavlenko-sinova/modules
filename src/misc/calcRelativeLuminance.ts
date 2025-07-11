/**
 * @description calcRelativeLuminance is a function that calculates the relative luminance of a color. E.g. if < 0.5, it's dark, if > 0.5, it's light. Helps with making text readable on a background.
 * @param {string} color - The color to calculate the relative luminance of.
 * @returns {number} The relative luminance of the color.
 */

export const calcRelativeLuminance = (color: string) => {
  if (!color) {
    console.warn("calcRelativeLuminance: No color provided");
    return 0;
  }

  if (color.startsWith("rgba")) {
    const rgba = color.match(/[\d.]+/g)?.map(Number);
    if (!rgba || rgba.length < 3) return 0;
    const [r, g, b] = rgba;
    const result = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return result;
  }

  if (color.startsWith("rgb")) {
    const rgb = color.match(/[\d.]+/g)?.map(Number);
    if (!rgb || rgb.length < 3) return 0;
    const [r, g, b] = rgb;
    const result = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return result;
  }

  if (color.startsWith("hsl")) {
    const hsl = color.match(/[\d.]+/g)?.map(Number);
    if (!hsl || hsl.length < 3) return 0;
    const [h, s, l] = hsl;

    // Convert HSL to RGB
    const hue = h / 360;
    const saturation = s / 100;
    const lightness = l / 100;

    const hueToRgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (saturation === 0) {
      r = g = b = lightness;
    } else {
      const q =
        lightness < 0.5
          ? lightness * (1 + saturation)
          : lightness + saturation - lightness * saturation;
      const p = 2 * lightness - q;
      r = hueToRgb(p, q, hue + 1 / 3);
      g = hueToRgb(p, q, hue);
      b = hueToRgb(p, q, hue - 1 / 3);
    }

    // Convert to 0-255 range
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

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
    console.warn(`calcRelativeLuminance: Unsupported color format: "${color}"`);
    return 0;
  }

  const result = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return result;
};
