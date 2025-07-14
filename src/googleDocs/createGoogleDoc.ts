import { withValidToken } from "../googleAuth/fetchAuthFlow/withValidToken";

/**
 * @description createGoogleDoc is a function that creates a new Google Doc. Requires user to be logged in via auth flow.
 * @param {string} title - The title of the new Google Doc.
 * @returns {Promise<string>} The ID of the new Google Doc.
 */

export default async function createGoogleDoc(title = 'My New Document'): Promise<string> {
  const requestBody = { title };

  const doc = await withValidToken(async (token) => {
    const res = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!res.ok) {
      throw new Error(`Create failed: ${res.status}`);
    }
    return res.json();
  });

  return doc.documentId;
}