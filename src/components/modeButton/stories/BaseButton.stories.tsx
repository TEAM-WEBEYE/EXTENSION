// import React from "react";
// import type { Meta, StoryObj } from "@storybook/react";
// import { ModeButton } from "../component";
// import { AppThemeProvider } from "@src/contexts/ThemeContext";

// const meta: Meta<typeof ModeButton> = {
//     title: "Components/BaseButton",
//     component: ModeButton,
//     parameters: {
//         layout: "centered",
//     },
//     tags: ["autodocs"],
//     decorators: [
//         (Story) => (
//             <AppThemeProvider>
//                 <Story />
//             </AppThemeProvider>
//         ),
//     ],
//     argTypes: {
//         children: {
//             control: "text",
//             description: "Button content",
//         },
//         onClick: {
//             action: "clicked",
//             description: "Function to call when button is clicked",
//         },
//         ariaLabel: {
//             control: "text",
//             description: "Accessibility label for the button",
//         },
//         isSelected: {
//             control: "boolean",
//             description: "Whether the button is selected",
//         },
//     },
// };

// export default meta;
// type Story = StoryObj<typeof ModeButton>;

// export const Default: Story = {
//     args: {
//         children: "버튼",
//         ariaLabel: "Default button",
//         isSelected: false,
//     },
// };

// export const Selected: Story = {
//     args: {
//         children: "선택된 버튼",
//         ariaLabel: "Selected button",
//         isSelected: true,
//     },
// };

// export const LongText: Story = {
//     args: {
//         children: "긴 텍스트가 있는 버튼입니다",
//         ariaLabel: "Button with long text",
//         isSelected: false,
//     },
// };

// export const WithIcon: Story = {
//     args: {
//         children: (
//             <div className="flex items-center gap-2">
//                 <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 16 16"
//                     fill="none"
//                     xmlns="http://www.w3.org/2000/svg"
//                 >
//                     <path
//                         d="M8 4V12M4 8H12"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                     />
//                 </svg>
//                 아이콘 버튼
//             </div>
//         ),
//         ariaLabel: "Button with icon",
//         isSelected: false,
//     },
// };

// // Light and Dark mode variants to demonstrate theme changes
// export const LightModeDefault: Story = {
//     args: {
//         ...Default.args,
//     },
//     parameters: {
//         backgrounds: {
//             default: "light",
//         },
//     },
// };

// export const DarkModeDefault: Story = {
//     args: {
//         ...Default.args,
//     },
//     parameters: {
//         backgrounds: {
//             default: "dark",
//         },
//     },
// };

// export const LightModeSelected: Story = {
//     args: {
//         ...Selected.args,
//     },
//     parameters: {
//         backgrounds: {
//             default: "light",
//         },
//     },
// };

// export const DarkModeSelected: Story = {
//     args: {
//         ...Selected.args,
//     },
//     parameters: {
//         backgrounds: {
//             default: "dark",
//         },
//     },
// };
