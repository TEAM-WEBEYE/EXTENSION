import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@src/background/constants";

export function useSyncedState<T>(
    key: string,
    defaultValue: T,
): [T, (v: T) => void] {
    const [state, setState] = useState<T>(defaultValue);

    useEffect(() => {
        chrome?.storage?.local?.get([key], (result) => {
            if (result[key] !== undefined) {
                setState(result[key]);
            }
        });
    }, [key]);

    const update = (v: T) => {
        setState(v);
        // 스타일 관련 설정이 변경될 때 STYLES_ENABLED를 true로 설정
        if (
            key === STORAGE_KEYS.FONT_SIZE ||
            key === STORAGE_KEYS.FONT_WEIGHT ||
            key === STORAGE_KEYS.THEME_MODE
        ) {
            chrome?.storage?.local?.set({
                [key]: v,
                [STORAGE_KEYS.STYLES_ENABLED]: true,
            });
        } else {
            chrome?.storage?.local?.set({ [key]: v });
        }
    };

    return [state, update];
}
