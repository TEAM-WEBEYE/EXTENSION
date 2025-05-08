// import React from "react";
// import { render, screen, fireEvent } from "@testing-library/react";
// import { BaseButton } from "../component";
// import { AppThemeProvider } from "@src/contexts/ThemeContext";
// import * as ThemeContext from "@src/contexts/ThemeContext";
// import "@testing-library/jest-dom";

// // ThemeContext의 useAppTheme 모킹
// jest.mock("@src/contexts/ThemeContext", () => ({
//     ...jest.requireActual("@src/contexts/ThemeContext"),
//     useAppTheme: jest.fn(),
// }));

// describe("BaseButton", () => {
//     const mockOnClick = jest.fn();

//     // 각 테스트 전에 모킹된 useAppTheme 초기화
//     beforeEach(() => {
//         jest.clearAllMocks();
//         (ThemeContext.useAppTheme as jest.Mock).mockReturnValue({
//             theme: "light",
//             fontClasses: {
//                 fontCommon: "text-base",
//             },
//         });
//     });

//     it("자식 요소를 올바르게 렌더링합니다", () => {
//         render(
//             <AppThemeProvider>
//                 <BaseButton onClick={mockOnClick}>테스트 버튼</BaseButton>
//             </AppThemeProvider>,
//         );

//         expect(screen.getByText("테스트 버튼")).toBeInTheDocument();
//     });

//     it("버튼이 클릭되었을 때 onClick 함수를 호출합니다", () => {
//         render(
//             <AppThemeProvider>
//                 <BaseButton onClick={mockOnClick}>테스트 버튼</BaseButton>
//             </AppThemeProvider>,
//         );

//         fireEvent.click(screen.getByText("테스트 버튼"));
//         expect(mockOnClick).toHaveBeenCalledTimes(1);
//     });

//     it("올바른 aria 속성을 가지고 있습니다", () => {
//         render(
//             <AppThemeProvider>
//                 <BaseButton
//                     onClick={mockOnClick}
//                     ariaLabel="테스트 라벨"
//                     isSelected={true}
//                 >
//                     테스트 버튼
//                 </BaseButton>
//             </AppThemeProvider>,
//         );

//         const button = screen.getByText("테스트 버튼");
//         expect(button).toHaveAttribute("aria-label", "테스트 라벨");
//         expect(button).toHaveAttribute("aria-pressed", "true");
//     });

//     it("선택되었을 때 체크마크 아이콘을 표시합니다", () => {
//         render(
//             <AppThemeProvider>
//                 <BaseButton onClick={mockOnClick} isSelected={true}>
//                     테스트 버튼
//                 </BaseButton>
//             </AppThemeProvider>,
//         );

//         expect(screen.getByTestId("checkmark-icon")).toBeInTheDocument();
//     });

//     it("선택되지 않았을 때 체크마크 아이콘을 표시하지 않습니다", () => {
//         render(
//             <AppThemeProvider>
//                 <BaseButton onClick={mockOnClick} isSelected={false}>
//                     테스트 버튼
//                 </BaseButton>
//             </AppThemeProvider>,
//         );

//         expect(screen.queryByTestId("checkmark-icon")).not.toBeInTheDocument();
//     });

//     it("선택되지 않은 상태의 라이트 모드에서 올바른 클래스를 적용합니다", () => {
//         (ThemeContext.useAppTheme as jest.Mock).mockReturnValue({
//             theme: "light",
//             fontClasses: {
//                 fontCommon: "text-base",
//             },
//         });

//         render(
//             <AppThemeProvider>
//                 <BaseButton onClick={mockOnClick} isSelected={false}>
//                     테스트 버튼
//                 </BaseButton>
//             </AppThemeProvider>,
//         );

//         const button = screen.getByText("테스트 버튼");
//         expect(button.className).toContain("bg-grayscale-100");
//         expect(button.className).toContain("text-grayscale-900");
//         expect(button.className).toContain("border-grayscale-300");
//     });

//     it("선택되지 않은 상태의 다크 모드에서 올바른 클래스를 적용합니다", () => {
//         (ThemeContext.useAppTheme as jest.Mock).mockReturnValue({
//             theme: "dark",
//             fontClasses: {
//                 fontCommon: "text-base",
//             },
//         });

//         render(
//             <AppThemeProvider>
//                 <BaseButton onClick={mockOnClick} isSelected={false}>
//                     테스트 버튼
//                 </BaseButton>
//             </AppThemeProvider>,
//         );

//         const button = screen.getByText("테스트 버튼");
//         expect(button.className).toContain("bg-grayscale-900");
//         expect(button.className).toContain("text-grayscale-100");
//         expect(button.className).toContain("border-grayscale-700");
//     });

//     it("선택된 상태의 라이트 모드에서 올바른 클래스를 적용합니다", () => {
//         (ThemeContext.useAppTheme as jest.Mock).mockReturnValue({
//             theme: "light",
//             fontClasses: {
//                 fontCommon: "text-base",
//             },
//         });

//         render(
//             <AppThemeProvider>
//                 <BaseButton onClick={mockOnClick} isSelected={true}>
//                     테스트 버튼
//                 </BaseButton>
//             </AppThemeProvider>,
//         );

//         const button = screen.getByText("테스트 버튼");
//         expect(button.className).toContain("bg-grayscale-100");
//         expect(button.className).toContain("text-grayscale-900");
//         expect(button.className).toContain("border-purple-default");
//     });

//     it("applies correct classes for dark mode when selected", () => {
//         (ThemeContext.useAppTheme as jest.Mock).mockReturnValue({
//             theme: "dark",
//             fontClasses: {
//                 fontCommon: "text-base",
//             },
//         });

//         render(
//             <AppThemeProvider>
//                 <BaseButton onClick={mockOnClick} isSelected={true}>
//                     테스트 버튼
//                 </BaseButton>
//             </AppThemeProvider>,
//         );

//         const button = screen.getByText("테스트 버튼");
//         expect(button.className).toContain("bg-grayscale-900");
//         expect(button.className).toContain("text-grayscale-100");
//         expect(button.className).toContain("border-purple-light");
//     });
// });
