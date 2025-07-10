/**
 * @description downloadFile is a function that downloads a file from a url.
 * @param {string} url - The url of the file to download.
 */

export const downloadFile = (url: string): void => {
  const anchor = document.createElement("a");
  anchor.href = url;

  anchor.click();
  anchor.remove();
};
