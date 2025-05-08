// import React from "react";
// import { render, screen, fireEvent, act } from "@testing-library/react";
// import { CursorButton } from "../component";
// import { AppThemeProvider, AppThemeContext } from "@src/contexts/ThemeContext";
// import "@testing-library/jest-dom";

// const renderWithProvider = (
//     onClick: () => void,
//     color: "white" | "purple" | "yellow" | "mint" | "pink" | "black" = "white",
//     size: "small" | "medium" | "large" = "medium",
//     isSelected: boolean = false,
// ) =>
//     render(
//         <AppThemeProvider>
//             <CursorButton
//                 onClick={onClick}
//                 color={color}
//                 size={size}
//                 isSelected={isSelected}
//             />
//         </AppThemeProvider>,
//     );

// // 다크 모드 테스트를 위한 Mock Provider 추가
// const MockAppThemeProvider = ({
//     children,
//     theme = "dark",
// }: {
//     children: React.ReactNode;
//     theme?: "dark" | "light";
// }) => {
//     return (
//         <AppThemeContext.Provider
//             value={{
//                 theme: theme,
//                 setTheme: jest.fn(),
//                 fontSize: "xl",
//                 setFontSize: jest.fn(),
//                 fontWeight: "xbold",
//                 setFontWeight: jest.fn(),
//                 fontClasses: {
//                     fontHeading: "text-[32px] font-extrabold",
//                     fontCommon: "text-[28px] font-extrabold",
//                     fontCaption: "text-[24px] font-extrabold",
//                 // },
//             }}
//         >
//             {children}
//         </AppThemeContext.Provider>
//     );
// };

// // 다크 모드 렌더링을 위한 함수 추가
// const renderWithTheme = (
//     onClick: () => void,
//     color: "white" | "purple" | "yellow" | "mint" | "pink" | "black" = "white",
//     size: "small" | "medium" | "large" = "medium",
//     isSelected: boolean = false,
//     theme: "dark" | "light" = "dark",
// ) =>
//     render(
//         <MockAppThemeProvider theme={theme}>
//             <CursorButton
//                 onClick={onClick}
//                 color={color}
//                 size={size}
//                 isSelected={isSelected}
//             />
//         </MockAppThemeProvider>,
//     );

// describe("CursorButton 컴포넌트", () => {
//     it("초기 상태에서는 선택되지 않은 버튼을 렌더링한다", async () => {
//         await act(async () => {
//             renderWithProvider(jest.fn(), "white", "medium", false);
//         });

//         expect(screen.getByRole("button")).toHaveClass("bg-grayscale-100");
//         // SVG가 없는지 확인 (체크마크 아이콘이 없어야 함)
//         expect(screen.queryByRole("svg")).toBeNull();
//     });

//     it("버튼을 클릭하면 onClick 핸들러가 호출된다", async () => {
//         const handleClick = jest.fn();
//         await act(async () => {
//             renderWithProvider(handleClick, "white", "medium", false);
//         });

//         fireEvent.click(screen.getByRole("button"));
//         expect(handleClick).toHaveBeenCalledTimes(1);
//     });

//     it("isSelected가 true일 때, 체크 아이콘이 표시된다", async () => {
//         await act(async () => {
//             renderWithProvider(jest.fn(), "white", "medium", true);
//         });

//         // SVG 요소로 체크마크 아이콘을 확인
//         const svg = screen.getByText("", { selector: "svg" });
//         expect(svg).toBeInTheDocument();
//         // 또는 path 요소를 확인
//         const checkmarkPath = document.querySelector('path[fill="#8914FF"]');
//         expect(checkmarkPath).toBeInTheDocument();
//     });

//     it("isSelected가 true일 때, 버튼의 배경색은 bg-grayscale-100이다", async () => {
//         await act(async () => {
//             renderWithProvider(jest.fn(), "white", "medium", true);
//         });

//         expect(screen.getByRole("button")).toHaveClass("bg-grayscale-100");
//     });

//     // 다크 모드 테스트 수정
//     it("다크 모드에서 isSelected가 true일 때, 버튼의 배경색은 bg-grayscale-800이다", async () => {
//         await act(async () => {
//             renderWithTheme(jest.fn(), "white", "medium", true);
//         });

//         expect(screen.getByRole("button")).toHaveClass("bg-grayscale-800");
//     });

//     it("버튼 클릭 시 'onClick' 핸들러가 호출되고, aria-label이 제대로 설정되어 있는지 확인한다", async () => {
//         const handleClick = jest.fn();
//         await act(async () => {
//             renderWithProvider(handleClick, "white", "medium", false);
//         });

//         const button = screen.getByRole("button");
//         expect(button).toHaveAttribute(
//             "aria-label",
//             "커서 변경 버튼: medium, white",
//         );

//         fireEvent.click(button);
//         expect(handleClick).toHaveBeenCalledTimes(1);
//     });

//     it("색상과 크기 옵션에 맞는 클래스가 버튼에 적용된다", async () => {
//         await act(async () => {
//             renderWithProvider(jest.fn(), "purple", "large", false);
//         });

//         const button = screen.getByRole("button");
//         expect(button).toHaveClass("bg-grayscale-100");
//     });

//     // 다크 모드 테스트 수정
//     it("다크 모드에서 isSelected가 false일 때, 버튼의 스타일이 적절히 적용된다", async () => {
//         await act(async () => {
//             renderWithTheme(jest.fn(), "white", "medium", false);
//         });

//         const button = screen.getByRole("button");
//         expect(button).toHaveClass("bg-grayscale-800");
//         expect(button).toHaveClass("hover:opacity-30");
//     });

//     it("다크 모드에서 선택된 버튼(isSelected=true)은 border-purple-light 클래스를 가진다", async () => {
//         await act(async () => {
//             renderWithTheme(jest.fn(), "white", "medium", true);
//         });

//         const button = screen.getByRole("button");
//         expect(button).toHaveClass("border-purple-light");
//         expect(button).toHaveClass("border-4");
//     });

//     it("테마가 변경될 때 act로 상태 업데이트", async () => {
//         await act(async () => {
//             renderWithTheme(jest.fn(), "white", "medium", true, "light");
//         });

//         // light 테마로 변경 시 스타일 확인
//         expect(screen.getByRole("button")).toHaveClass("bg-grayscale-100");
//     });
// });
