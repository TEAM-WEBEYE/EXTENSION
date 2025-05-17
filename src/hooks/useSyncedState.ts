import { useEffect, useState } from "react";

export function useSyncedState<T>(
    key: string,
    defaultValue: T,
): [T, (v: T) => void] {
    const [state, setState] = useState<T>(defaultValue);

    useEffect(() => {
        chrome?.storage?.sync?.get([key], (result) => {
            if (result[key] !== undefined) {
                setState(result[key]);
            }
        });
    }, [key]);

    const update = (v: T) => {
        setState(v);
        chrome?.storage?.sync?.set({ [key]: v });
    };

    return [state, update];
}
