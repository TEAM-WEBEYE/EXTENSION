/* eslint-disable no-console */

type LogArgs = Array<
    string | number | boolean | object | null | undefined | unknown
>;

export const logger = {
    error: (message: string, ...args: LogArgs) => {
        console.error(`[ERROR] ${message}`, ...args);
    },

    warn: (message: string, ...args: LogArgs) => {
        console.warn(`[WARN] ${message}`, ...args);
    },

    debug: (message: string, ...args: LogArgs) => {
        if (process.env.NODE_ENV !== "production") {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    },
};
