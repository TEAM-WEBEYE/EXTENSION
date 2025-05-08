import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { CursorProvider, useCursorTheme } from "../CursorContext";

global.chrome = {
    storage: {
        sync: {
            get: jest.fn(),
            set: jest.fn(),
        },
    },
} as any;

const TestComponent = () => {
    const { cursorTheme, cursorSize, setCursorTheme, setCursorSize } =
        useCursorTheme();

    return (
        <div>
            <div data-testid="cursor-theme">{cursorTheme}</div>
            <div data-testid="cursor-size">{cursorSize}</div>
            <button
                data-testid="set-theme-purple"
                onClick={() => setCursorTheme("purple")}
            >
                Set Purple Theme
            </button>
            <button
                data-testid="set-size-large"
                onClick={() => setCursorSize("large")}
            >
                Set Large Size
            </button>
        </div>
    );
};

describe("CursorContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (chrome.storage.sync.get as jest.Mock).mockReset();
        (chrome.storage.sync.set as jest.Mock).mockReset();
    });

    it("기본값으로 초기화된다", async () => {
        (chrome.storage.sync.get as jest.Mock).mockImplementation(
            (keys, callback) => {
                callback({});
            },
        );

        render(
            <CursorProvider>
                <TestComponent />
            </CursorProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("cursor-theme").textContent).toBe(
                "white",
            );
            expect(screen.getByTestId("cursor-size").textContent).toBe(
                "medium",
            );
        });
    });

    it("custom 초기값으로 초기화된다", async () => {
        (chrome.storage.sync.get as jest.Mock).mockImplementation(
            (keys, callback) => {
                callback({});
            },
        );

        render(
            <CursorProvider initialTheme="black" initialSize="small">
                <TestComponent />
            </CursorProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("cursor-theme").textContent).toBe(
                "black",
            );
            expect(screen.getByTestId("cursor-size").textContent).toBe("small");
        });
    });

    it("chrome.storage에서 값을 불러온다", async () => {
        (chrome.storage.sync.get as jest.Mock).mockImplementation(
            (keys, callback) => {
                callback({
                    cursorTheme: "pink",
                    cursorSize: "large",
                });
            },
        );

        render(
            <CursorProvider>
                <TestComponent />
            </CursorProvider>,
        );

        await waitFor(() => {
            expect(chrome.storage.sync.get).toHaveBeenCalledWith(
                ["cursorTheme", "cursorSize"],
                expect.any(Function),
            );
            expect(screen.getByTestId("cursor-theme").textContent).toBe("pink");
            expect(screen.getByTestId("cursor-size").textContent).toBe("large");
        });
    });

    it("잘못된 값이 chrome.storage에 있을 경우 기본값을 사용한다", async () => {
        (chrome.storage.sync.get as jest.Mock).mockImplementation(
            (keys, callback) => {
                callback({
                    cursorTheme: "invalid-theme",
                    cursorSize: "invalid-size",
                });
            },
        );

        render(
            <CursorProvider>
                <TestComponent />
            </CursorProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("cursor-theme").textContent).toBe(
                "white",
            );
            expect(screen.getByTestId("cursor-size").textContent).toBe(
                "medium",
            );
        });
    });

    it("커서 테마를 변경하고 chrome.storage에 저장한다", async () => {
        (chrome.storage.sync.get as jest.Mock).mockImplementation(
            (keys, callback) => {
                callback({});
            },
        );

        render(
            <CursorProvider>
                <TestComponent />
            </CursorProvider>,
        );

        const user = userEvent.setup();
        await user.click(screen.getByTestId("set-theme-purple"));

        await waitFor(() => {
            expect(screen.getByTestId("cursor-theme").textContent).toBe(
                "purple",
            );
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                cursorTheme: "purple",
            });
        });
    });

    it("커서 크기를 변경하고 chrome.storage에 저장한다", async () => {
        (chrome.storage.sync.get as jest.Mock).mockImplementation(
            (keys, callback) => {
                callback({});
            },
        );

        render(
            <CursorProvider>
                <TestComponent />
            </CursorProvider>,
        );

        const user = userEvent.setup();
        await user.click(screen.getByTestId("set-size-large"));

        await waitFor(() => {
            expect(screen.getByTestId("cursor-size").textContent).toBe("large");
            expect(chrome.storage.sync.set).toHaveBeenCalledWith({
                cursorSize: "large",
            });
        });
    });

    it("Provider 없이 훅을 사용할 경우 에러를 발생시킨다", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const BrokenComponent = () => {
            useCursorTheme();
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
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it("chrome.storage가 없는 경우에도 에러 없이 동작한다", async () => {
        const originalChromeStorage = chrome.storage;
        chrome.storage = undefined as any;

        render(
            <CursorProvider>
                <TestComponent />
            </CursorProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("cursor-theme")).toBeInTheDocument();
        });

        chrome.storage = originalChromeStorage;
    });

    it("storage.sync의 일부 메서드만 없는 경우에도 동작한다", async () => {
        const originalSet = chrome.storage.sync.set;
        chrome.storage.sync.set = undefined as any;

        (chrome.storage.sync.get as jest.Mock).mockImplementation(
            (keys, callback) => {
                callback({});
            },
        );

        render(
            <CursorProvider>
                <TestComponent />
            </CursorProvider>,
        );

        const user = userEvent.setup();
        await user.click(screen.getByTestId("set-theme-purple"));

        await waitFor(() => {
            expect(screen.getByTestId("cursor-theme").textContent).toBe(
                "purple",
            );
        });

        chrome.storage.sync.set = originalSet;
    });
});
