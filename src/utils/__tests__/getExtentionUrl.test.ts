import { getExtensionUrl } from "../getExtensionUrl";

describe("getExtensionUrl", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("chrome.runtime.getURL이 존재하면 chrome.runtime.getURL('/images/path')를 반환해야 한다", () => {
        const mockGetURL = jest.fn(
            (path: string) => `chrome-extension://fakeid${path}`,
        );

        global.chrome = {
            runtime: {
                getURL: mockGetURL,
            },
        } as unknown as typeof chrome;

        const result = getExtensionUrl("test.png");

        expect(mockGetURL).toHaveBeenCalledWith("/images/test.png");
        expect(result).toBe("chrome-extension://fakeid/images/test.png");
    });

    it("chrome.runtime.getURL이 존재하지 않으면 `/images/path`를 반환해야 한다", () => {
        const originalChrome = global.chrome;
        global.chrome = undefined as unknown as typeof chrome;

        try {
            const result = getExtensionUrl("test.png");
            expect(result).toBe("/images/test.png");
        } finally {
            global.chrome = originalChrome;
        }
    });
});
