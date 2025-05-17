global.chrome = {
    storage: {
        local: {
            get: jest.fn(() =>
                Promise.resolve({
                    "theme-mode": "light",
                    "font-size": "m",
                    "font-weight": "bold",
                }),
            ),
            set: jest.fn(() => Promise.resolve()),
        },
    },
} as never;
