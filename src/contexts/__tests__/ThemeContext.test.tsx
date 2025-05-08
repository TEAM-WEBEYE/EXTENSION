import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AppThemeProvider, useAppTheme } from "../ThemeContext";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// 로거 모킹
jest.mock("@src/utils/logger", () => ({
    logger: {
        error: jest.fn(),
    },
}));

// chrome API 모킹
global.chrome = {
    storage: {
        local: {
            get: jest.fn(),
            set: jest.fn().mockResolvedValue(undefined),
        },
    },
} as any;

const DummyComponent = () => {
    const {
        theme,
        setTheme,
        fontSize,
        setFontSize,
        fontWeight,
        setFontWeight,
        fontClasses,
    } = useAppTheme();

    return (
        <div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="fontSize">{fontSize}</div>
            <div data-testid="fontWeight">{fontWeight}</div>
            <div data-testid="fontHeading">{fontClasses.fontHeading}</div>
            <div data-testid="fontCommon">{fontClasses.fontCommon}</div>
            <div data-testid="fontCaption">{fontClasses.fontCaption}</div>
            <button onClick={() => setTheme("light")}>Set Light Theme</button>
            <button onClick={() => setTheme("dark")}>Set Dark Theme</button>
            <button onClick={() => setFontSize("s")}>
                Set Font Size Small
            </button>
            <button onClick={() => setFontWeight("regular")}>
                Set Font Weight Regular
            </button>
        </div>
    );
};

const renderWithProvider = async () => {
    return render(
        <AppThemeProvider>
            <DummyComponent />
        </AppThemeProvider>,
    );
};

describe("AppThemeProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("초기값을 기본으로 제공한다", async () => {
        (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId("theme").textContent).toBe("light");
        });
        expect(screen.getByTestId("fontSize").textContent).toBe("xl");
        expect(screen.getByTestId("fontWeight").textContent).toBe("xbold");
    });

    it("chrome.storage에서 값을 불러온다", async () => {
        (chrome.storage.local.get as jest.Mock).mockResolvedValue({
            "theme-mode": "dark",
            "font-size": "m",
            "font-weight": "bold",
        });

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId("theme").textContent).toBe("dark");
        });
        expect(screen.getByTestId("fontSize").textContent).toBe("m");
        expect(screen.getByTestId("fontWeight").textContent).toBe("bold");
    });

    it("테마를 변경하고 chrome.storage에 저장한다", async () => {
        (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId("theme")).toBeInTheDocument();
        });

        await act(async () => {
            await userEvent.click(screen.getByText("Set Dark Theme"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("theme").textContent).toBe("dark");
        });

        expect(chrome.storage.local.set).toHaveBeenCalledWith({
            "theme-mode": "dark",
        });
    });

    it("글자 크기를 변경하고 chrome.storage에 저장한다", async () => {
        (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId("fontSize")).toBeInTheDocument();
        });

        await act(async () => {
            await userEvent.click(screen.getByText("Set Font Size Small"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("fontSize").textContent).toBe("s");
        });

        expect(chrome.storage.local.set).toHaveBeenCalledWith({
            "font-size": "s",
        });
    });

    it("글자 굵기를 변경하고 chrome.storage에 저장한다", async () => {
        (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId("fontWeight")).toBeInTheDocument();
        });

        await act(async () => {
            await userEvent.click(screen.getByText("Set Font Weight Regular"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("fontWeight").textContent).toBe(
                "regular",
            );
        });

        expect(chrome.storage.local.set).toHaveBeenCalledWith({
            "font-weight": "regular",
        });
    });

    it("상태에 따라 fontClasses가 올바르게 계산된다", async () => {
        (chrome.storage.local.get as jest.Mock).mockResolvedValue({
            "font-size": "xs",
            "font-weight": "regular",
        });

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId("fontHeading")).toBeInTheDocument();
        });

        // text-[24px]와 같은 tailwind 클래스의 정확한 값 대신 정규식 사용
        const headingContent = screen.getByTestId("fontHeading").textContent;
        const commonContent = screen.getByTestId("fontCommon").textContent;
        const captionContent = screen.getByTestId("fontCaption").textContent;

        expect(headingContent).toContain("text-[24px]");
        expect(headingContent).toContain("font-normal");

        expect(commonContent).toContain("text-[20px]");
        expect(commonContent).toContain("font-normal");

        expect(captionContent).toContain("text-[16px]");
        expect(captionContent).toContain("font-normal");
    });

    it("Provider 없이 훅을 사용할 경우 에러를 발생시킨다", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const BrokenComponent = () => {
            useAppTheme(); // will throw
            return null;
        };

        class ErrorBoundary extends React.Component<
            { children: React.ReactNode },
            { hasError: boolean }
        > {
            constructor(props: any) {
                super(props);
                this.state = { hasError: false };
            }

            static getDerivedStateFromError() {
                return { hasError: true };
            }

            render() {
                if (this.state.hasError)
                    return <div data-testid="error">에러 발생</div>;
                return this.props.children;
            }
        }

        render(
            <ErrorBoundary>
                <BrokenComponent />
            </ErrorBoundary>,
        );

        expect(screen.getByTestId("error")).toBeInTheDocument();
        // ErrorBoundary에 의해 에러가 잡혔으므로 단순히 에러가 발생했는지만 확인
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it("chrome.storage가 없을 경우에도 정상적으로 동작한다", async () => {
        // chrome.storage를 임시로 undefined로 설정
        const originalChromeStorage = chrome.storage;
        chrome.storage = undefined as any;

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId("theme").textContent).toBe("light");
        });

        // chrome.storage 복원
        chrome.storage = originalChromeStorage;
    });

    it("잘못된 값이 chrome.storage에 있는 경우 기본값을 사용한다", async () => {
        (chrome.storage.local.get as jest.Mock).mockResolvedValue({
            "theme-mode": "invalid-theme",
            "font-size": "invalid-size",
            "font-weight": "invalid-weight",
        });

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId("theme").textContent).toBe("light");
        });
        expect(screen.getByTestId("fontSize").textContent).toBe("xl");
        expect(screen.getByTestId("fontWeight").textContent).toBe("xbold");
    });

    it("chrome.storage 값을 저장할 때 에러가 발생하면 로그를 남긴다", async () => {
        const { logger } = jest.requireMock("@src/utils/logger");
        (chrome.storage.local.get as jest.Mock).mockResolvedValue({});
        (chrome.storage.local.set as jest.Mock).mockRejectedValueOnce(
            new Error("Storage error"),
        );

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId("theme")).toBeInTheDocument();
        });

        await act(async () => {
            await userEvent.click(screen.getByText("Set Dark Theme"));
        });

        await waitFor(() => {
            expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
