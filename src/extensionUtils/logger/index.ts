import log from "loglevel";

export type TLog = "trace" | "debug" | "info" | "warn" | "error";

export type TLogFrom = "content" | "background" | "popup";

log.setLevel(log.levels.TRACE);

/**
 * Handles logging messages from different sources.
 * This is ready handler for Plasmo messaging, to be set up in the background script.
 * To use in content scripts, you can copy just function and use it.
 *
 * @param req - The request object containing the log message
 * @returns void
 */

const handleLog = async (req: {
  body: { type: TLog; from: TLogFrom; msg: any[] };
}) => {
  const { type, from, msg } = req.body;

  switch (type) {
    case "trace":
      log.trace(`from ${from}:`, ...msg);
      break;
    case "debug":
      log.debug(`from ${from}:`, ...msg);
      break;
    case "info":
      log.info(`from ${from}:`, ...msg);
      break;
    case "warn":
      log.warn(`from ${from}:`, ...msg);
      break;
    case "error":
      log.error(`from ${from}:`, ...msg);
      break;
    default:
      log.info(`from ${from} (unknown type):`, ...msg);
      break;
  }
};

export default handleLog;
