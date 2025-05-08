import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FloatingButton } from "../component";

const meta: Meta<typeof FloatingButton> = {
    title: "Components/FloatingButton",
    component: FloatingButton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        onClick: { action: "clicked" },
    },
};

export default meta;
type Story = StoryObj<typeof FloatingButton>;

export const Default: Story = {
    args: {},
};

export const CustomIcon: Story = {
    args: {},
};

export const LargeIcon: Story = {
    args: {},
    decorators: [
        (Story) => (
            <div style={{ transform: "scale(1.2)" }}>
                <Story />
            </div>
        ),
    ],
};

export const WithInteraction: Story = {
    args: {},
    parameters: {
        docs: {
            description: {
                story: "버튼을 클릭하면 액션이 발생합니다.",
            },
        },
    },
};
