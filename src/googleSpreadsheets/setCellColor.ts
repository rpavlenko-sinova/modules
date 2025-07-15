import { GoogleSpreadsheetCell } from "google-spreadsheet";
import { convertColorToRGB } from "./colorUtils";

/**
 * @description Sets the background color of a cell in a Google Spreadsheet
 * @param cell - The GoogleSpreadsheetCell instance (obtained from sheet.getCellByA1() or sheet.getCell())
 * @param color - The color to set. Can be:
 *   - Hex color code (e.g., "#FF0000" for red)
 *   - RGB object (e.g., { red: 1, green: 0, blue: 0 } for red)
 *   - Named color (e.g., "red", "blue", "green")
 * @returns Promise that resolves when the color is set
 */
export async function setCellColor(
  cell: GoogleSpreadsheetCell,
  color: string | { red: number; green: number; blue: number }
): Promise<void> {
  try {
    if (!cell) {
      throw new Error("Cell is required");
    }

    const backgroundColor = convertColorToRGB(color);

    cell.backgroundColor = backgroundColor;

    await cell._sheet.saveUpdatedCells();
  } catch (error) {
    throw error;
  }
}
