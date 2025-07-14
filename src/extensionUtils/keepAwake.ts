enum Alarms {
  keepAwakeSystemAlarm = "keepAwakeSystemAlarm",
  keepAwakeScreenAlarm = "keepAwakeScreenAlarm",
}

export type KeepAwakeType = "system" | "display" | "both";

let lastActivityTime = Date.now();

export function updateActivityTime() {
  lastActivityTime = Date.now();
}

/**
 * Keeps the screen and system awake.
 * @param type - The type of keep awake to use. @default "both"
 * @returns void
 */

export function keepAwake(type: KeepAwakeType = "both") {
  chrome.alarms.getAll().then((alarms) => {
    const currentAlarm = alarms.find(
      (el) =>
        el.name === Alarms.keepAwakeSystemAlarm ||
        el.name === Alarms.keepAwakeScreenAlarm
    );

    if (currentAlarm) {
      chrome.alarms.clear(currentAlarm.name);
    }

    let alarmName: string;
    let powerLevel: "system" | "display";

    switch (type) {
      case "system":
        alarmName = Alarms.keepAwakeSystemAlarm;
        powerLevel = "system";
        break;
      case "display":
        alarmName = Alarms.keepAwakeScreenAlarm;
        powerLevel = "display";
        break;
      case "both":
      default:
        if (
          !currentAlarm ||
          currentAlarm.name === Alarms.keepAwakeScreenAlarm
        ) {
          alarmName = Alarms.keepAwakeSystemAlarm;
          powerLevel = "system";
        } else {
          alarmName = Alarms.keepAwakeScreenAlarm;
          powerLevel = "display";
        }
        break;
    }

    chrome.alarms.create(alarmName, {
      when: Date.now() + 25000,
      periodInMinutes: 0.5,
    });

    chrome.power.requestKeepAwake(powerLevel);
  });
}

/**
 * Allows the screen and system to sleep.
 * @returns void
 */

export function allowToSleep() {
  chrome.alarms.clear(Alarms.keepAwakeScreenAlarm);
  chrome.alarms.clear(Alarms.keepAwakeSystemAlarm);
  chrome.power.releaseKeepAwake();
}

export function isBackgroundScriptActive(): boolean {
  return Date.now() - lastActivityTime < 30000;
}
