/**
 * @description attachDebuggerToTab is a function that attaches a debugger to a tab.
 * @param {number} tabId - The id of the tab to attach the debugger to.
 * @param {Set<number>} attachedTabs - The set of tabs that have the debugger attached.
 * @returns {void} A promise that resolves when the debugger is attached.
 */

const DEBUGGER_VERSION = "1.3";

export function attachDebuggerToTab(tabId: number, attachedTabs: Set<number>) {
  if (attachedTabs.has(tabId)) {
    return;
  }

  chrome.debugger.attach({ tabId }, DEBUGGER_VERSION, () => {
    if (chrome.runtime.lastError) {
      console.log(
        ` Debugger attach error for tab ${tabId}:`,
        chrome.runtime.lastError
      );
      return;
    }

    attachedTabs.add(tabId);

    chrome.debugger.sendCommand({ tabId }, "Network.enable", {}, () => {
      if (chrome.runtime.lastError) {
        console.log(
          ` Network enable error for tab ${tabId}:`,
          chrome.runtime.lastError
        );
        return;
      }
    });
  });
}

/**
 * @description detachDebuggerFromTab is a function that detaches a debugger from a tab.
 * @param {number} tabId - The id of the tab to detach the debugger from.
 * @param {Set<number>} attachedTabs - The set of tabs that have the debugger attached.
 * @returns {void} A promise that resolves when the debugger is detached.
 */

export function detachDebuggerFromTab(
  tabId: number,
  attachedTabs: Set<number>
) {
  if (!attachedTabs.has(tabId)) return;

  chrome.debugger.detach({ tabId }, () => {
    if (chrome.runtime.lastError) {
      console.log(
        ` Debugger detach error for tab ${tabId}:`,
        chrome.runtime.lastError
      );
    } else {
      console.log(` Debugger detached from tab ${tabId}`);
      attachedTabs.delete(tabId);
    }
  });
}
