import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MenubarButton } from "../component";
import { AppThemeProvider } from "@src/contexts/ThemeContext";

const ThemeWrapper = ({
    theme = "light",
    children,
}: {
    theme?: "light" | "dark";
    children: React.ReactNode;
}) => {
    if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("theme-mode", theme);
    }

    return <AppThemeProvider>{children}</AppThemeProvider>;
};

const meta = {
    title: "Components/MenubarButton",
    component: MenubarButton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        isSelected: {
            control: "boolean",
            description: "버튼의 선택 상태",
        },
        text: {
            control: "text",
            description: "버튼에 표시될 텍스트",
        },
        ariaLabel: {
            control: "text",
            description: "접근성을 위한 aria-label 속성",
        },
        onClick: {
            action: "clicked",
            description: "클릭 이벤트 핸들러",
        },
    },
    decorators: [
        (Story) => (
            <div style={{ padding: "1rem" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof MenubarButton>;

export default meta;
type Story = StoryObj<typeof MenubarButton>;

export const Default: Story = {
    args: {
        isSelected: false,
        text: "메뉴 항목",
        ariaLabel: "메뉴 항목 버튼",
    },
    decorators: [
        (Story) => (
            <ThemeWrapper theme="light">
                <Story />
            </ThemeWrapper>
        ),
    ],
};

export const Selected: Story = {
    args: {
        isSelected: true,
        text: "메뉴 항목",
        ariaLabel: "메뉴 항목 버튼",
    },
    decorators: [
        (Story) => (
            <ThemeWrapper theme="light">
                <Story />
            </ThemeWrapper>
        ),
    ],
};

export const DarkMode: Story = {
    args: {
        isSelected: false,
        text: "메뉴 항목",
        ariaLabel: "메뉴 항목 버튼",
    },
    parameters: {
        backgrounds: { default: "dark" },
    },
    decorators: [
        (Story) => (
            <ThemeWrapper theme="dark">
                <div
                    style={{
                        padding: "1rem",
                        backgroundColor: "#333",
                        borderRadius: "8px",
                    }}
                >
                    <Story />
                </div>
            </ThemeWrapper>
        ),
    ],
};

export const DarkModeSelected: Story = {
    args: {
        isSelected: true,
        text: "메뉴 항목",
        ariaLabel: "메뉴 항목 버튼",
    },
    parameters: {
        backgrounds: { default: "dark" },
    },
    decorators: [
        (Story) => (
            <ThemeWrapper theme="dark">
                <div
                    style={{
                        padding: "1rem",
                        backgroundColor: "#333",
                        borderRadius: "8px",
                    }}
                >
                    <Story />
                </div>
            </ThemeWrapper>
        ),
    ],
};

export const LongText: Story = {
    args: {
        isSelected: false,
        text: "이것은 매우 긴 메뉴 항목 텍스트입니다. 텍스트가 넘칠 때 어떻게 보이는지 확인하세요.",
        ariaLabel: "긴 텍스트 버튼",
    },
    decorators: [
        (Story) => (
            <ThemeWrapper theme="light">
                <Story />
            </ThemeWrapper>
        ),
    ],
};
