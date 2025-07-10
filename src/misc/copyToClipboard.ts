import oldCopyToClipboard from "copy-text-to-clipboard"

/**
 * @description copyToClipboard is a function that copies a string to the clipboard.
 * @param {string} string - The string to copy to the clipboard.
 * @param {Function} permittedCallback - The callback function to call when the string is copied to the clipboard.
 * @param {Function} deniedCallback - The callback function to call when the string is not copied to the clipboard.
 * @returns {Promise<void>} A promise that resolves when the string is copied to the clipboard.
 */

export const copyToClipboard = async ({
  string,
  permittedCallback,
  deniedCallback
}: {
  string: string
  permittedCallback?: () => void
  deniedCallback?: () => void
}) =>
  navigator.permissions // @ts-expect-error navigator types are not up to date.
    .query({ name: "clipboard-write" })
    .then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        navigator.clipboard
          .writeText(string)
          .then(() => {
            permittedCallback?.()
          })
          .catch((error: unknown) => {
            console.error("COPY LINK ERROR:", error)
          })
      }
      if (result.state === "denied") {
        if (document.queryCommandSupported("copy")) {
          oldCopyToClipboard(string)
          setTimeout(() => {
            permittedCallback?.()
          })
        } else {
          deniedCallback?.()
        }
      }
    })
    .catch(() => {
      deniedCallback?.()
    })