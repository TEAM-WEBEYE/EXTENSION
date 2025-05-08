import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const MockedCloseButton = ({
    onClick = () => {},
    ariaLabel = "닫기",
    mockTheme = "light",
}) => {
    const isDarkMode = mockTheme === "dark";
    const strokeColor = isDarkMode ? "#FEFEFE" : "#121212";

    return (
        <button
            className={` p-[16px] relative rounded-[14px] ${
                isDarkMode
                    ? "bg-grayscale-900 hover:opacity-30 border-4 border-solid border-grayscale-700 active:border-purple-light active:hover:opacity-100"
                    : "bg-grayscale-100 hover:opacity-30 border-4 border-solid border-grayscale-300 active:border-purple-default active:hover:opacity-100"
            }`}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
            >
                <path
                    d="M27 8.99805L9 26.998M27 26.998L9 8.99805"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </svg>
        </button>
    );
};

const meta = {
    title: "Components/CloseButton",
    component: MockedCloseButton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        onClick: { action: "clicked" },
        ariaLabel: { control: "text" },
        mockTheme: {
            control: "select",
            options: ["light", "dark"],
            description: "Mocked theme for the button (for Storybook only)",
        },
    },
} satisfies Meta<typeof MockedCloseButton>;

export default meta;
type Story = StoryObj<typeof MockedCloseButton>;

export const LightMode: Story = {
    args: {
        onClick: () => void 0,
        ariaLabel: "닫기",
        mockTheme: "light",
    },
};

export const DarkMode: Story = {
    args: {
        onClick: () => void 0,
        ariaLabel: "닫기",
        mockTheme: "dark",
    },
    parameters: {
        backgrounds: { default: "dark" },
    },
    decorators: [
        (Story) => (
            <div
                style={{
                    padding: "2rem",
                    backgroundColor: "#333",
                    borderRadius: "8px",
                }}
            >
                <Story />
            </div>
        ),
    ],
};

export const CustomAriaLabel: Story = {
    args: {
        onClick: () => void 0,
        ariaLabel: "창 닫기",
        mockTheme: "light",
    },
};
