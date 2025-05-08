import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import Menubar from "../component";
import { AppThemeProvider } from "@src/contexts/ThemeContext";
import { MenubarButton } from "@src/components/menubarButton";

const meta: Meta<typeof Menubar> = {
    title: "Components/Menubar",
    component: Menubar,
    parameters: {
        layout: "centered",
    },
};

export default meta;

type Story = StoryObj<typeof Menubar>;

const MenubarWrapper = (args: any) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <AppThemeProvider>
            <Menubar
                {...args}
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    console.log("Menubar closed");
                }}
            >
                <MenubarButton
                    text="VOIM 화이팅"
                    isSelected={false}
                    ariaLabel="VOIM 화이팅"
                    onClick={() => {
                        setIsOpen(true);
                    }}
                ></MenubarButton>
            </Menubar>
        </AppThemeProvider>
    );
};

export const 기본: Story = {
    render: () => <MenubarWrapper />,
};
