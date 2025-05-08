import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FloatingButton } from "../component";
import { getExtensionUrl } from "@src/utils/getExtensionUrl";

jest.mock("@src/utils/getExtensionUrl", () => ({
    getExtensionUrl: jest
        .fn()
        .mockImplementation((path) => `/mocked-url/${path}`),
}));

describe("FloatingButton", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("스냅샷 테스트", () => {
        const { asFragment } = render(<FloatingButton onClick={() => {}} />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("버튼이 올바르게 렌더링된다", () => {
        const handleClick = jest.fn();
        render(<FloatingButton onClick={handleClick} />);

        const button = screen.getByRole("button", { name: /voim/i });
        expect(button).toBeInTheDocument();
    });

    it("버튼 이미지가 올바르게 렌더링된다", () => {
        render(<FloatingButton onClick={() => {}} />);

        const image = screen.getByAltText("VOIM 익스텐션");
        expect(image).toBeInTheDocument();
        expect(getExtensionUrl).toHaveBeenCalledWith("icon.png");
        expect(image).toHaveAttribute("src", "/mocked-url/icon.png");
    });

    it("클릭 시 onClick 함수가 호출된다", () => {
        const handleClick = jest.fn();
        render(<FloatingButton onClick={handleClick} />);

        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("Enter 키를 누를 때 onClick 함수가 호출된다", () => {
        const handleClick = jest.fn();
        render(<FloatingButton onClick={handleClick} />);

        const button = screen.getByRole("button");
        fireEvent.keyDown(button, { key: "Enter" });

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("스페이스바를 누를 때 onClick 함수가 호출된다", () => {
        const handleClick = jest.fn();
        render(<FloatingButton onClick={handleClick} />);

        const button = screen.getByRole("button");
        fireEvent.keyDown(button, { key: " " });

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("다른 키를 누를 때는 onClick 함수가 호출되지 않는다", () => {
        const handleClick = jest.fn();
        render(<FloatingButton onClick={handleClick} />);

        const button = screen.getByRole("button");
        fireEvent.keyDown(button, { key: "Tab" });

        expect(handleClick).not.toHaveBeenCalled();
    });

    it("올바른 ARIA 속성을 가지고 있다", () => {
        render(<FloatingButton onClick={() => {}} />);

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-haspopup", "menu");
        expect(button).toHaveAttribute("aria-controls", "menubar");
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveAttribute("aria-label", "VOIM");
        expect(button).toHaveAttribute("tabIndex", "0");
    });

    it("클릭 후 aria-expanded 속성이 변경된다", () => {
        render(<FloatingButton onClick={() => {}} />);

        const button = screen.getByRole("button");

        expect(button).toHaveAttribute("aria-expanded", "false");

        fireEvent.click(button);
        expect(button).toHaveAttribute("aria-expanded", "true");

        fireEvent.click(button);
        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("이미지에 aria-hidden 속성이 있다", () => {
        render(<FloatingButton onClick={() => {}} />);

        const image = screen.getByAltText("VOIM 익스텐션");
        expect(image).toHaveAttribute("aria-hidden", "true");
    });
});
