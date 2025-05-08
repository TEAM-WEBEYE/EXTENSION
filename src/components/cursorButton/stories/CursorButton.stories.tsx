import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CursorButton } from "../component";
import { AppThemeProvider } from "@src/contexts/ThemeContext";

const mockUrls: Record<string, string> = {
    "cursors/white_small.png": "/mockCursors/white_small.png",
    "cursors/white_medium.png": "/mockCursors/white_medium.png",
    "cursors/white_large.png": "/mockCursors/white_large.png",
    "cursors/purple_small.png": "/mockCursors/purple_small.png",
    "cursors/purple_medium.png": "/mockCursors/purple_medium.png",
    "cursors/purple_large.png": "/mockCursors/purple_large.png",
    "cursors/yellow_small.png": "/mockCursors/yellow_small.png",
    "cursors/yellow_medium.png": "/mockCursors/yellow_medium.png",
    "cursors/yellow_large.png": "/mockCursors/yellow_large.png",
    "cursors/mint_small.png": "/mockCursors/mint_small.png",
    "cursors/mint_medium.png": "/mockCursors/mint_medium.png",
    "cursors/mint_large.png": "/mockCursors/mint_large.png",
    "cursors/pink_small.png": "/mockCursors/pink_small.png",
    "cursors/pink_medium.png": "/mockCursors/pink_medium.png",
    "cursors/pink_large.png": "/mockCursors/pink_large.png",
    "cursors/black_small.png": "/mockCursors/black_small.png",
    "cursors/black_medium.png": "/mockCursors/black_medium.png",
    "cursors/black_large.png": "/mockCursors/black_large.png",
};

const mockGetExtensionUrl = (path: string) => {
    return (
        mockUrls[path] ||
        `/api/placeholder/80/80?text=${encodeURIComponent(path)}`
    );
};

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

const MockGetExtensionUrlWrapper = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return <>{children}</>;
};

const AllProviders = ({
    theme = "light",
    children,
}: {
    theme?: "light" | "dark";
    children: React.ReactNode;
}) => {
    return (
        <ThemeWrapper theme={theme}>
            <MockGetExtensionUrlWrapper>{children}</MockGetExtensionUrlWrapper>
        </ThemeWrapper>
    );
};

const MockedCursorButton = (
    props: React.ComponentProps<typeof CursorButton>,
) => {
    const {
        onClick,
        color = "white",
        size = "medium",
        isSelected = false,
    } = props;

    // 직접 테마 값을 설정
    const [theme, setTheme] = React.useState("light");

    // localStorage에서 테마 값을 읽어옴
    React.useEffect(() => {
        if (typeof window !== "undefined" && window.localStorage) {
            const storedTheme = localStorage.getItem("theme-mode");
            if (storedTheme) {
                setTheme(storedTheme);
            }
        }
    }, []);

    const isDarkMode = theme === "dark";
    const fileName = `cursors/${color}_${size}.png`;

    return (
        <button
            className={`flex items-center justify-center w-[140px] h-[140px] rounded-[20px] relative ${
                isSelected
                    ? isDarkMode
                        ? "bg-grayscale-800 border-4 border-solid border-purple-light"
                        : "bg-grayscale-100 border-4 border-solid border-purple-default"
                    : isDarkMode
                      ? "bg-grayscale-800 hover:opacity-30"
                      : "bg-grayscale-100 hover:opacity-30"
            }`}
            onClick={onClick}
            aria-label={`커서 변경 버튼: ${size}, ${color}`}
        >
            <img
                src={mockGetExtensionUrl(fileName)}
                alt={`커서: ${size}, ${color}`}
            />
            {isSelected && (
                <div className="absolute -right-[10px] -top-[10px]">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="12" cy="12" r="12" fill="#9747FF" />
                        <path
                            d="M7 12L10 15L17 8"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            )}
        </button>
    );
};

const meta = {
    title: "Components/CursorButton",
    component: MockedCursorButton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        color: {
            control: "select",
            options: ["white", "purple", "yellow", "mint", "pink", "black"],
            description: "커서 색상",
        },
        size: {
            control: "select",
            options: ["small", "medium", "large"],
            description: "커서 크기",
        },
        isSelected: {
            control: "boolean",
            description: "선택 상태",
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
} satisfies Meta<typeof MockedCursorButton>;

export default meta;
type Story = StoryObj<typeof MockedCursorButton>;

export const Default: Story = {
    args: {
        color: "white",
        size: "medium",
        isSelected: false,
    },
    decorators: [
        (Story) => (
            <AllProviders theme="light">
                <Story />
            </AllProviders>
        ),
    ],
};

export const Selected: Story = {
    args: {
        color: "white",
        size: "medium",
        isSelected: true,
    },
    decorators: [
        (Story) => (
            <AllProviders theme="light">
                <Story />
            </AllProviders>
        ),
    ],
};

export const DarkMode: Story = {
    args: {
        color: "white",
        size: "medium",
        isSelected: false,
    },
    decorators: [
        (Story) => (
            <AllProviders theme="dark">
                <div
                    style={{
                        padding: "1rem",
                        backgroundColor: "#333",
                        borderRadius: "8px",
                    }}
                >
                    <Story />
                </div>
            </AllProviders>
        ),
    ],
    parameters: {
        backgrounds: { default: "dark" },
    },
};

export const PurpleCursor: Story = {
    args: {
        color: "purple",
        size: "medium",
        isSelected: false,
    },
    decorators: [
        (Story) => (
            <AllProviders theme="light">
                <Story />
            </AllProviders>
        ),
    ],
};

export const SmallSize: Story = {
    args: {
        color: "white",
        size: "small",
        isSelected: false,
    },
    decorators: [
        (Story) => (
            <AllProviders theme="light">
                <Story />
            </AllProviders>
        ),
    ],
};

export const LargeSize: Story = {
    args: {
        color: "white",
        size: "large",
        isSelected: false,
    },
    decorators: [
        (Story) => (
            <AllProviders theme="light">
                <Story />
            </AllProviders>
        ),
    ],
};

export const ColorGrid: Story = {
    render: () => (
        <div className="grid grid-cols-3 gap-4">
            {["white", "purple", "yellow", "mint", "pink", "black"].map(
                (color) => (
                    <MockedCursorButton
                        key={color}
                        color={
                            color as
                                | "white"
                                | "purple"
                                | "yellow"
                                | "mint"
                                | "pink"
                                | "black"
                        }
                        size="medium"
                        isSelected={color === "purple"}
                        onClick={() => void 0}
                    />
                ),
            )}
        </div>
    ),
    decorators: [
        (Story) => (
            <AllProviders theme="light">
                <Story />
            </AllProviders>
        ),
    ],
};
