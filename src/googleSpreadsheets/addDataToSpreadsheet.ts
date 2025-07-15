import { GoogleSpreadsheet } from "google-spreadsheet";
import { getColumnLetter } from "./getColumnLetter";

/**
 * @description Adds data to a spreadsheet.
 * @param options - Options for the spreadsheet.
 * @param options.spreadsheetId - The ID of the spreadsheet to add data to (optional if sheet is provided).
 * @param options.sheet - A pre-loaded GoogleSpreadsheet instance (optional if spreadsheetId is provided).
 * @param options.getAccessToken - A function that returns a promise of an access token (required only if sheet is not provided).
 * @param options.items - The items to add to the spreadsheet.
 * @param options.formulaColumns - The columns to add formulas to.
 * @param options.formulaColumns.columnKey - The key of the column to add a formula to.
 * @param options.formulaColumns.formula - The formula to add to the column. Receives rowIndex, headers, and getColumnLetter function. returns a string in format "=SUM(A1:A10)"
 */

interface SpreadsheetOptions<
  T extends Record<string, any> = Record<string, any>
> {
  spreadsheetId?: string;
  sheet?: GoogleSpreadsheet;
  getAccessToken?: () => Promise<string>;
  items: T[];
  formulaColumns?: {
    columnKey: string;
    formula: (
      rowIndex: number,
      headers: string[],
      getColumnLetter: (headers: string[], key: string) => string
    ) => string;
  }[];
}

export async function addDataToSheet<T extends Record<string, any>>(
  options: SpreadsheetOptions<T>
) {
  const {
    spreadsheetId,
    sheet,
    getAccessToken,
    items,
    formulaColumns = [],
  } = options;

  if (!items.length) return;

  if (!spreadsheetId && !sheet) {
    throw new Error("Either spreadsheetId or sheet must be provided");
  }

  if (spreadsheetId && !getAccessToken) {
    throw new Error("getAccessToken is required when using spreadsheetId");
  }

  try {
    let doc: GoogleSpreadsheet;

    if (sheet) {
      doc = sheet;
    } else {
      const accessToken = await getAccessToken!();
      doc = new GoogleSpreadsheet(spreadsheetId!, { token: accessToken });
      await doc.loadInfo();
    }

    let sheetInstance = doc.sheetsByIndex[0];
    if (!sheetInstance) sheetInstance = await doc.addSheet({ title: "Sheet1" });

    await sheetInstance.loadHeaderRow();
    const headers = sheetInstance.headerValues || [];

    const existingRows = await sheetInstance.getRows();
    // +2 to account for 1-based row and header
    const rowOffset = existingRows.length + 2;

    const rowCountNeeded = existingRows.length + items.length;
    if (rowCountNeeded >= sheetInstance.rowCount) {
      await sheetInstance.resize({
        rowCount: rowCountNeeded + 10,
        columnCount: headers.length,
      });
    }

    // adds info to the sheet
    await sheetInstance.addRows(items);

    await sheetInstance.loadCells();

    //insert formulas
    for (let i = 0; i < items.length; i++) {
      const rowIndex = rowOffset + i;

      formulaColumns.forEach((col) => {
        const columnLetter = getColumnLetter(headers, col.columnKey);
        const cell = sheetInstance.getCellByA1(`${columnLetter}${rowIndex}`);
        cell.formula = col.formula(rowIndex, headers, getColumnLetter);
      });
    }

    await sheetInstance.saveUpdatedCells();
  } catch (error) {
    throw error;
  }
}
