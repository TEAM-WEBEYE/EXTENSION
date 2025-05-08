// import React from "react";
// import { render, screen, fireEvent, act } from "@testing-library/react";
// import { MenubarButton } from "../component";
// import "@testing-library/jest-dom";
// import { AppThemeProvider, AppThemeContext } from "@src/contexts/ThemeContext";

// const Wrapper = ({ children }: { children: React.ReactNode }) => (
//     <AppThemeProvider>{children}</AppThemeProvider>
// );

// const MockAppThemeProvider = ({ children }: { children: React.ReactNode }) => {
//     return (
//         <AppThemeContext.Provider
//             value={{
//                 theme: "dark",
//                 setTheme: jest.fn(),
//                 fontSize: "xl",
//                 setFontSize: jest.fn(),
//                 fontWeight: "xbold",
//                 setFontWeight: jest.fn(),
//                 fontClasses: {
//                     fontHeading: "text-[32px] font-extrabold",
//                     fontCommon: "text-[28px] font-extrabold",
//                     fontCaption: "text-[24px] font-extrabold",
//                 },
//             }}
//         >
//             {children}
//         </AppThemeContext.Provider>
//     );
// };

// describe("MenubarButton", () => {
//     it("버튼이 정상적으로 렌더링된다", async () => {
//         await act(async () => {
//             render(
//                 <Wrapper>
//                     <MenubarButton
//                         isSelected={false}
//                         text="Button Text"
//                         ariaLabel="Button"
//                     />
//                 </Wrapper>,
//             );
//         });

//         expect(screen.getByText("Button Text")).toBeInTheDocument();
//     });

//     it("isSelected가 true일 때 스타일이 변경된다", async () => {
//         await act(async () => {
//             render(
//                 <Wrapper>
//                     <MenubarButton
//                         isSelected={true}
//                         text="Button Text"
//                         ariaLabel="Button"
//                     />
//                 </Wrapper>,
//             );
//         });

//         const button = screen.getByText("Button Text");

//         expect(button).toHaveClass("bg-grayscale-100");
//         expect(button).toHaveClass("text-grayscale-900");
//         expect(button).toHaveClass("border-4");
//         expect(button).toHaveClass("border-purple-default");
//     });

//     it("isSelected가 false일 때 스타일이 변경된다", async () => {
//         await act(async () => {
//             render(
//                 <Wrapper>
//                     <MenubarButton
//                         isSelected={false}
//                         text="Button Text"
//                         ariaLabel="Button"
//                     />
//                 </Wrapper>,
//             );
//         });

//         const button = screen.getByText("Button Text");

//         expect(button).toHaveClass("bg-grayscale-100");
//         expect(button).toHaveClass("text-grayscale-900");
//         expect(button).toHaveClass("hover:opacity-30");
//     });

//     it("theme이 dark일 때, isSelected가 true인 경우에 스타일이 dark 모드로 적용된다", async () => {
//         await act(async () => {
//             render(
//                 <MockAppThemeProvider>
//                     <MenubarButton
//                         isSelected={true}
//                         text="Button Text"
//                         ariaLabel="Button"
//                     />
//                 </MockAppThemeProvider>,
//             );
//         });

//         const button = screen.getByText("Button Text");

//         expect(button).toHaveClass("bg-grayscale-900");
//         expect(button).toHaveClass("text-grayscale-100");
//         expect(button).toHaveClass("border-purple-light");
//     });

//     it("onClick이 호출된다", async () => {
//         const handleClick = jest.fn();
//         await act(async () => {
//             render(
//                 <Wrapper>
//                     <MenubarButton
//                         isSelected={false}
//                         text="Button Text"
//                         ariaLabel="Button"
//                         onClick={handleClick}
//                     />
//                 </Wrapper>,
//             );
//         });

//         const button = screen.getByText("Button Text");
//         fireEvent.click(button);

//         expect(handleClick).toHaveBeenCalledTimes(1);
//     });

//     it("isSelected일 때 CheckmarkIcon이 나타난다", async () => {
//         await act(async () => {
//             render(
//                 <Wrapper>
//                     <MenubarButton
//                         isSelected={true}
//                         text="Button Text"
//                         ariaLabel="Button"
//                     />
//                 </Wrapper>,
//             );
//         });

//         expect(screen.getByTestId("checkmark-icon")).toBeInTheDocument();
//     });

//     it("isSelected가 false일 때 CheckmarkIcon이 나타나지 않는다", async () => {
//         await act(async () => {
//             render(
//                 <Wrapper>
//                     <MenubarButton
//                         isSelected={false}
//                         text="Button Text"
//                         ariaLabel="Button"
//                     />
//                 </Wrapper>,
//             );
//         });

//         expect(screen.queryByTestId("checkmark-icon")).toBeNull();
//     });

//     it("테마가 변경될 때 act로 상태 업데이트", async () => {
//         await act(async () => {
//             render(
//                 <Wrapper>
//                     <MenubarButton
//                         isSelected={true}
//                         text="Button Text"
//                         ariaLabel="Button"
//                     />
//                 </Wrapper>,
//             );
//         });
//     });
// });
