import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Menubar } from "../component";
import { logger } from "@src/utils/logger";

jest.mock("@src/components/baseButton/component", () => ({
    BaseButton: ({
        children,
        onClick,
    }: {
        children: React.ReactNode;
        onClick: () => void;
    }) => (
        <button onClick={onClick} data-testid="base-button">
            {children}
        </button>
    ),
}));

jest.mock("@src/components/closeButton/component", () => ({
    CloseButton: ({ onClick }: { onClick: () => void }) => (
        <button onClick={onClick} data-testid="close-button">
            X
        </button>
    ),
}));

jest.mock("@src/contexts/ThemeContext", () => ({
    useAppTheme: jest.fn().mockReturnValue({
        theme: "light",
    }),
    AppThemeProvider: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    ThemeMode: {
        LIGHT: "light",
        DARK: "dark",
    },
}));

jest.mock("@src/utils/logger", () => ({
    logger: {
        debug: jest.fn(),
        error: jest.fn(),
    },
}));

global.chrome = {
    runtime: {
        sendMessage: jest.fn(),
    },
} as never;

describe("Menubar 컴포넌트", () => {
    const mockOnClose = jest.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        children: <div data-testid="menu-content">메뉴 내용</div>,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (chrome.runtime.sendMessage as jest.Mock).mockReset();
    });

    it("isOpen이 true일 때 메뉴바를 렌더링한다", () => {
        render(<Menubar {...defaultProps} />);

        expect(screen.getByTestId("menubar-overlay")).toBeInTheDocument();
        expect(screen.getByTestId("menubar-container")).toBeInTheDocument();
        expect(screen.getByTestId("menu-content")).toBeInTheDocument();
        expect(screen.getByText("설정 초기화")).toBeInTheDocument();
    });

    it("isOpen이 false일 때 메뉴바를 렌더링하지 않는다", () => {
        render(<Menubar {...defaultProps} isOpen={false} />);

        expect(screen.queryByTestId("menubar-overlay")).not.toBeInTheDocument();
    });

    it("오버레이를 클릭하면 onClose 함수가 호출된다", async () => {
        render(<Menubar {...defaultProps} />);

        const overlay = screen.getByTestId("menubar-overlay");
        await userEvent.click(overlay);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("메뉴바 내부를 클릭하면 onClose 함수가 호출되지 않는다", async () => {
        render(<Menubar {...defaultProps} />);

        const container = screen.getByTestId("menubar-container");
        await userEvent.click(container);

        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("닫기 버튼을 클릭하면 onClose 함수가 호출된다", async () => {
        render(<Menubar {...defaultProps} />);

        const closeButton = screen.getByTestId("close-button");
        await userEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("설정 초기화 버튼을 클릭하면 chrome.runtime.sendMessage가 호출된다", async () => {
        (chrome.runtime.sendMessage as jest.Mock).mockResolvedValueOnce({
            success: true,
        });

        render(<Menubar {...defaultProps} />);

        const resetButton = screen.getByTestId("base-button");
        await userEvent.click(resetButton);

        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
            type: "RESET_SETTINGS",
        });

        await waitFor(() => {
            expect(logger.debug).toHaveBeenCalledWith(
                "설정이 초기화되었습니다.",
            );
        });
    });

    it("chrome.runtime.sendMessage 호출 실패 시 에러를 로깅한다", async () => {
        const error = new Error("메시지 전송 실패");
        (chrome.runtime.sendMessage as jest.Mock).mockRejectedValueOnce(error);

        render(<Menubar {...defaultProps} />);

        const resetButton = screen.getByTestId("base-button");
        await userEvent.click(resetButton);

        await waitFor(() => {
            expect(logger.error).toHaveBeenCalledWith(
                "메시지 전송 중 오류:",
                error,
            );
        });
    });

    it("다크 모드에서 적절한 스타일을 적용한다", () => {
        const { useAppTheme } = jest.requireMock("@src/contexts/ThemeContext");
        useAppTheme.mockReturnValueOnce({
            theme: "dark",
        });

        render(<Menubar {...defaultProps} />);

        const container = screen.getByTestId("menubar-container");
        expect(container.className).toContain("bg-grayscale-900");
    });
});
