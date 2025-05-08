export function getExtensionUrl(path: string): string {
    if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.getURL
    ) {
        return chrome.runtime.getURL(`/images/${path}`);
    } else {
        return `/images/${path}`;
    }
}
