const isDev = process.env.NODE_ENV === "development";

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.log("[CT]", ...args); // eslint-disable-line no-console
  },
  warn: (...args: unknown[]) => {
    console.warn("[CT]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[CT]", ...args);
  },
};
