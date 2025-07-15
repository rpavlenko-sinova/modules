import { GoogleSpreadsheetWorksheet } from "google-spreadsheet";

const HEADER_ROW = 1;

/**
 * Finds the row index containing a specific value in a given column
 * @param sheet - The Google Spreadsheet worksheet to search
 * @param columnName - The name of the column to search in
 * @param searchValue - The value to search for
 * @returns The row index where the value was found, or -1 if not found
 */

export async function findRowIndexByColumnValue(
  sheet: GoogleSpreadsheetWorksheet,
  columnName: string,
  searchValue: string | number | boolean | null | undefined
): Promise<number> {
  try {
    await sheet.loadHeaderRow();

    const rows = await sheet.getRows();

    const headerValues = sheet.headerValues;
    if (!headerValues) {
      throw new Error("Failed to load header values");
    }

    const columnIndex = headerValues.findIndex(
      (header) => header === columnName
    );
    if (columnIndex === -1) {
      throw new Error(`Column "${columnName}" not found in the sheet headers`);
    }

    const foundRow = rows.find((row) => {
      const cellValue = row.get(columnName);
      return searchValue === cellValue;
    });

    return foundRow ? foundRow.rowNumber : -1;
  } catch (error) {
    console.error("Error finding row:", error);
    throw error;
  }
}
