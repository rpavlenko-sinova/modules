export interface GoogleDocsData {
  title: string;
  content: string;
  lastModified: string;
  documentId: string;
}

export interface GoogleDocsError {
  error: string;
  message: string;
  status?: number;
}

export interface DocumentAccessResult {
  accessible: boolean;
  message: string;
  suggestions: string[];
}

// Google Docs API response types
interface GoogleDocsParagraphElement {
  textRun?: {
    content?: string;
  };
}

interface GoogleDocsParagraph {
  elements?: GoogleDocsParagraphElement[];
}

interface GoogleDocsTableCell {
  content?: Array<{
    paragraph?: GoogleDocsParagraph;
  }>;
}

interface GoogleDocsTableRow {
  tableCells?: GoogleDocsTableCell[];
}

interface GoogleDocsTable {
  tableRows?: GoogleDocsTableRow[];
}

interface GoogleDocsContentElement {
  paragraph?: GoogleDocsParagraph;
  table?: GoogleDocsTable;
}

interface GoogleDocsBody {
  content?: GoogleDocsContentElement[];
}

interface GoogleDocsApiResponse {
  body?: GoogleDocsBody;
}

const GOOGLE_DOCS_BASE_URL = "https://docs.google.com/document/d";
const EXPORT_FORMATS = ["txt", "html", "docx"] as const;
const DEFAULT_TITLE = "Untitled Document";

/**
 * Fetches a Google Doc by its URL.
 * @param url - The URL of the Google Doc.
 * @returns A promise that resolves to the Google Docs data or an error.
 */
export async function fetchGoogleDoc(
  url: string
): Promise<GoogleDocsData | GoogleDocsError> {
  try {
    if (!isValidGoogleDocsUrl(url)) {
      return {
        error: "INVALID_URL",
        message: "Invalid Google Docs URL format",
      };
    }

    const docId = extractDocId(url);
    if (!docId) {
      return {
        error: "INVALID_URL",
        message: "Could not extract document ID from URL",
      };
    }

    const result = await tryExportMethods(docId, url);
    if (result) {
      return result;
    }

    return {
      error: "ACCESS_DENIED",
      message:
        "Unable to access document. Make sure the document is publicly accessible or shared with appropriate permissions. You may need to: 1) Make the document public, 2) Share it with 'Anyone with the link can view', or 3) Use a different document URL.",
      status: 403,
    };
  } catch (error) {
    console.error("Error fetching Google Doc:", error);
    return {
      error: "FETCH_ERROR",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Validates if the URL is a valid Google Docs URL
 */
function isValidGoogleDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "docs.google.com" &&
      urlObj.pathname.includes("/document/")
    );
  } catch {
    return false;
  }
}

/**
 * Tries different export methods to fetch the document
 */
async function tryExportMethods(
  docId: string,
  originalUrl: string
): Promise<GoogleDocsData | null> {
  const exportUrls = EXPORT_FORMATS.map(
    (format) => `${GOOGLE_DOCS_BASE_URL}/${docId}/export?format=${format}`
  );

  // Text export
  const textResult = await tryExportMethod(
    exportUrls[0],
    "text",
    originalUrl,
    docId
  );
  if (textResult) return textResult;

  // HTML export
  const htmlResult = await tryExportMethod(
    exportUrls[1],
    "html",
    originalUrl,
    docId
  );
  if (htmlResult) return htmlResult;

  // Public view
  const publicUrl = `${GOOGLE_DOCS_BASE_URL}/${docId}/pub`;
  const publicResult = await tryExportMethod(
    publicUrl,
    "public",
    originalUrl,
    docId
  );
  if (publicResult) return publicResult;

  return null;
}

/**
 * Attempts to fetch document using a specific export method
 */
async function tryExportMethod(
  url: string,
  method: string,
  originalUrl: string,
  docId: string
): Promise<GoogleDocsData | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`${method} export failed with status: ${response.status}`);
      return null;
    }

    const content = await response.text();
    const title = extractTitleFromContent(content, originalUrl);
    const lastModified = new Date().toISOString();

    return {
      title,
      content:
        method === "text" ? cleanText(content) : extractTextFromHtml(content),
      lastModified,
      documentId: docId,
    };
  } catch (error) {
    console.log(`${method} export failed:`, error);
    return null;
  }
}

/**
 * Extracts title from content or URL
 */
function extractTitleFromContent(content: string, originalUrl: string): string {
  return (
    extractTitleFromHtml(content) ||
    extractTitleFromUrl(originalUrl) ||
    DEFAULT_TITLE
  );
}

function extractTextFromHtml(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const scripts = doc.querySelectorAll("script, style");
    scripts.forEach((script) => script.remove());

    const text =
      doc.body?.textContent || doc.documentElement?.textContent || "";
    return cleanText(text);
  } catch (error) {
    console.error("Error extracting text from HTML:", error);
    return "";
  }
}

function extractTitleFromHtml(html: string): string | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const titleElement = doc.querySelector("title");
    return titleElement?.textContent?.trim() || null;
  } catch (error) {
    console.error("Error extracting title from HTML:", error);
    return null;
  }
}

function extractTitleFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    const titleIndex = pathParts.findIndex(
      (part) => part === "edit" || part === "view"
    );
    if (titleIndex !== -1 && titleIndex + 1 < pathParts.length) {
      const titlePart = pathParts[titleIndex + 1];
      if (titlePart && titlePart !== "d" && titlePart !== "u") {
        return decodeURIComponent(titlePart.replace(/-/g, " "));
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function extractTextFromGoogleDocsData(
  data: GoogleDocsApiResponse
): string {
  try {
    if (!data?.body?.content) {
      return "";
    }

    const text = data.body.content
      .map((element: GoogleDocsContentElement) => {
        if (element.paragraph) {
          return extractTextFromParagraph(element.paragraph);
        }
        if (element.table) {
          return extractTextFromTable(element.table);
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");

    return cleanText(text);
  } catch (error) {
    console.error("Error extracting text from Google Docs data:", error);
    return "";
  }
}

function extractTextFromParagraph(paragraph: GoogleDocsParagraph): string {
  if (!paragraph.elements) return "";

  return paragraph.elements
    .map(
      (element: GoogleDocsParagraphElement) => element.textRun?.content || ""
    )
    .join("");
}

function extractTextFromTable(table: GoogleDocsTable): string {
  if (!table.tableRows) return "";

  return table.tableRows
    .map((row: GoogleDocsTableRow) => {
      if (!row.tableCells) return "";

      return row.tableCells
        .map((cell: GoogleDocsTableCell) => {
          if (!cell.content) return "";

          return cell.content
            .map((element) => {
              if (element.paragraph) {
                return extractTextFromParagraph(element.paragraph);
              }
              return "";
            })
            .join("");
        })
        .join("\t");
    })
    .join("\n");
}

function extractDocId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    if (pathParts.includes("document") && pathParts.includes("d")) {
      const docIndex = pathParts.indexOf("d");
      if (docIndex !== -1 && pathParts[docIndex + 1]) {
        return pathParts[docIndex + 1];
      }
    }

    if (pathParts.includes("document") && pathParts.includes("u")) {
      const docIndex = pathParts.indexOf("document");
      if (docIndex !== -1 && pathParts[docIndex + 2]) {
        return pathParts[docIndex + 2];
      }
    }

    return null;
  } catch {
    return null;
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

export async function checkDocumentAccess(
  url: string
): Promise<DocumentAccessResult> {
  try {
    if (!isValidGoogleDocsUrl(url)) {
      return {
        accessible: false,
        message: "Invalid Google Docs URL",
        suggestions: [
          "Make sure you're using a valid Google Docs URL",
          "URL should look like: https://docs.google.com/document/d/DOCUMENT_ID/...",
        ],
      };
    }

    const docId = extractDocId(url);
    if (!docId) {
      return {
        accessible: false,
        message: "Could not extract document ID from URL",
        suggestions: [
          "Check if the URL format is correct",
          "Make sure the document ID is present in the URL",
        ],
      };
    }

    const testUrls = [
      `${GOOGLE_DOCS_BASE_URL}/${docId}/export?format=txt`,
      `${GOOGLE_DOCS_BASE_URL}/${docId}/export?format=html`,
      `${GOOGLE_DOCS_BASE_URL}/${docId}/pub`,
    ];

    for (const testUrl of testUrls) {
      try {
        const response = await fetch(testUrl);
        if (response.ok) {
          return {
            accessible: true,
            message: "Document is accessible",
            suggestions: [],
          };
        }
      } catch (error) {
        continue;
      }
    }

    return {
      accessible: false,
      message: "Document is not publicly accessible",
      suggestions: [
        "Open the document in Google Docs",
        "Click 'Share' in the top right corner",
        "Change sharing settings to 'Anyone with the link can view'",
        "Or make the document public",
        "Copy the new sharing link and try again",
      ],
    };
  } catch (error) {
    return {
      accessible: false,
      message: "Error checking document access",
      suggestions: [
        "Check your internet connection",
        "Verify the URL is correct",
        "Try refreshing the page",
      ],
    };
  }
}
