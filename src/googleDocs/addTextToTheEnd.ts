import { withValidToken } from "../googleAuth/fetchAuthFlow/withValidToken";

/**
 * @description addTextToTheEnd is a function that adds text to the end of a Google Doc. Requires user to be logged in via auth flow.
 * @param {string} id - The ID of the Google Doc to edit.
 * @param {string} newContent - The new content to add to the Google Doc.
 * @returns {Promise<any>} The response from the Google Docs API.
 */

export default async function addTextToTheEnd(id: string, newContent: string) {
  return withValidToken(async (token) => {
    const res = await fetch(
      `https://docs.googleapis.com/v1/documents/${id}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                endOfSegmentLocation: {},
                text: newContent,
              },
            },
          ],
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`Edit failed: ${res.status}`);
    }
    return res.json();
  });
}
