/**
 * @description Universal batch update function for Google Spreadsheets
 * @param options - Configuration options for the batch update
 * @param options.spreadsheet - Either a spreadsheet ID (string) or a pre-loaded GoogleSpreadsheetWorksheet
 * @param options.getAccessToken - Function that returns a promise of an access token (required only if spreadsheet is a string)
 * @param options.updates - Array of updates to perform
 * @param options.updates.rowIdentifier - The value to identify the row (e.g., order ID, user ID, etc.)
 * @param options.updates.rowIdentifierColumn - The column name that contains the row identifier
 * @param options.updates.changes - Array of changes to apply to the row
 * @param options.updates.changes.column - The column name to update
 * @param options.updates.changes.value - The new value to set
 * @returns Promise that resolves when all updates are completed
 */

import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { getAccessToken } from "../googleAuth/fetchAuthFlow/getAccessToken";

interface BatchUpdateOptions {
  spreadsheet: string | GoogleSpreadsheetWorksheet;
  updates: Array<{
    rowIdentifier: string;
    rowIdentifierColumn: string;
    changes: Array<{
      column: string;
      value: any;
    }>;
  }>;
}

export async function batchUpdateSpreadsheet(
  options: BatchUpdateOptions
): Promise<void> {
  const { spreadsheet, updates } = options;

  if (!updates.length) {
    return;
  }

  let sheet: GoogleSpreadsheetWorksheet;

  try {
    if (typeof spreadsheet === "string") {
      const doc = new GoogleSpreadsheet(spreadsheet, {
        token: await getAccessToken(),
      });
      await doc.loadInfo();
      sheet = doc.sheetsByIndex[0];

      if (!sheet) {
        throw new Error("No sheets found in the spreadsheet");
      }
    } else {
      sheet = spreadsheet;
    }

    await sheet.loadHeaderRow();
    const headerValues = sheet.headerValues || [];

    await sheet.loadCells();

    const rowIdentifierToRowIndex = new Map<string, number>();

    const rowIdentifierColumnIndex = headerValues.indexOf(
      options.updates[0].rowIdentifierColumn
    );
    if (rowIdentifierColumnIndex === -1) {
      throw new Error(
        `Column "${options.updates[0].rowIdentifierColumn}" not found in spreadsheet headers`
      );
    }

    for (let rowIndex = 1; rowIndex < sheet.rowCount; rowIndex++) {
      const cell = sheet.getCell(rowIndex, rowIdentifierColumnIndex);
      if (cell.value) {
        rowIdentifierToRowIndex.set(cell.value.toString(), rowIndex);
      }
    }

    let processedCount = 0;
    let skippedCount = 0;

    for (const update of updates) {
      const rowIndex = rowIdentifierToRowIndex.get(update.rowIdentifier);

      if (rowIndex === undefined) {
        skippedCount++;
        continue;
      }

      for (const change of update.changes) {
        const columnIndex = headerValues.indexOf(change.column);

        if (columnIndex === -1) {
          continue;
        }

        const cell = sheet.getCell(rowIndex, columnIndex);

        cell.value = change.value;
      }

      processedCount++;
    }

    await sheet.saveUpdatedCells();
  } catch (error) {
    throw error;
  }
}
