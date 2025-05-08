import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { CloseButton } from "../component";
import { useAppTheme } from "@src/contexts/ThemeContext";

// ThemeContext 모킹
jest.mock("@src/contexts/ThemeContext", () => ({
    useAppTheme: jest.fn(),
}));

describe("CloseButton 컴포넌트", () => {
    const mockOnClick = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // 기본적으로 라이트 모드 설정
        (useAppTheme as jest.Mock).mockReturnValue({
            theme: "light",
        });
    });

    it("버튼이 올바르게 렌더링된다", () => {
        render(<CloseButton onClick={mockOnClick} />);

        // SVG 요소가 있는지 확인
        const svgElement = screen.getByRole("button").querySelector("svg");
        expect(svgElement).toBeInTheDocument();
    });

    it("기본 aria-label이 '닫기'로 설정된다", () => {
        render(<CloseButton onClick={mockOnClick} />);

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "닫기");
    });

    it("커스텀 aria-label이 적용된다", () => {
        render(<CloseButton onClick={mockOnClick} ariaLabel="창 닫기" />);

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "창 닫기");
    });

    it("버튼 클릭 시 onClick 핸들러가 호출된다", async () => {
        render(<CloseButton onClick={mockOnClick} />);

        const button = screen.getByRole("button");
        const user = userEvent.setup();
        await user.click(button);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("라이트 모드에서 올바른 스타일이 적용된다", () => {
        (useAppTheme as jest.Mock).mockReturnValue({
            theme: "light",
        });

        render(<CloseButton onClick={mockOnClick} />);

        const button = screen.getByRole("button");
        expect(button).toHaveClass("bg-grayscale-100");
        expect(button).toHaveClass("border-grayscale-300");

        // SVG 경로의 stroke 색상 확인
        const path = button.querySelector("path");
        expect(path).toHaveAttribute("stroke", "#121212");
    });

    it("다크 모드에서 올바른 스타일이 적용된다", () => {
        (useAppTheme as jest.Mock).mockReturnValue({
            theme: "dark",
        });

        render(<CloseButton onClick={mockOnClick} />);

        const button = screen.getByRole("button");
        expect(button).toHaveClass("bg-grayscale-900");
        expect(button).toHaveClass("border-grayscale-700");

        // SVG 경로의 stroke 색상 확인
        const path = button.querySelector("path");
        expect(path).toHaveAttribute("stroke", "#FEFEFE");
    });
});
