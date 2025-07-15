/**
 * @description Utility functions for converting colors to Google Sheets format
 */

/**
 * Converts various color formats to the RGB object format expected by Google Sheets API
 * @param color - The color to convert. Can be:
 *   - Hex color code (e.g., "#FF0000" for red)
 *   - RGB object (e.g., { red: 1, green: 0, blue: 0 } for red)
 *   - Named color (e.g., "red", "blue", "green")
 * @returns RGB object with values between 0 and 1
 */
export function convertColorToRGB(
  color: string | { red: number; green: number; blue: number }
): { red: number; green: number; blue: number } {
  if (typeof color === "object") {
    return color;
  }

  if (color.startsWith("#")) {
    // Hex color
    const hex = color.replace("#", "");
    return {
      red: parseInt(hex.substring(0, 2), 16) / 255,
      green: parseInt(hex.substring(2, 4), 16) / 255,
      blue: parseInt(hex.substring(4, 6), 16) / 255,
    };
  }

  // Named color - convert to RGB
  const colorMap: Record<string, { red: number; green: number; blue: number }> =
    {
      red: { red: 1, green: 0, blue: 0 },
      green: { red: 0, green: 1, blue: 0 },
      blue: { red: 0, green: 0, blue: 1 },
      yellow: { red: 1, green: 1, blue: 0 },
      cyan: { red: 0, green: 1, blue: 1 },
      magenta: { red: 1, green: 0, blue: 1 },
      black: { red: 0, green: 0, blue: 0 },
      white: { red: 1, green: 1, blue: 1 },
      gray: { red: 0.5, green: 0.5, blue: 0.5 },
      grey: { red: 0.5, green: 0.5, blue: 0.5 },
      orange: { red: 1, green: 0.5, blue: 0 },
      purple: { red: 0.5, green: 0, blue: 0.5 },
      pink: { red: 1, green: 0.75, blue: 0.8 },
      brown: { red: 0.6, green: 0.4, blue: 0.2 },
    };

  const rgb = colorMap[color.toLowerCase()];
  if (!rgb) {
    throw new Error(
      `Unknown color name: ${color}. Use hex code or RGB object instead.`
    );
  }

  return rgb;
}
