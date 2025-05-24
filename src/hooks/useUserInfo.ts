import { useEffect, useState } from "react";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;

export function useUserInfo() {
    const [birthYear, setBirthYear] = useState<string>("");
    const [gender, setGender] = useState<"male" | "female" | "">("");
    const [error, setError] = useState<string>("");
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        chrome.storage.local.get(["birthYear", "gender"], (result) => {
            setBirthYear(result.birthYear ?? "");
            setGender(result.gender ?? "");
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!birthYear) {
            setError("출생연도를 입력해주세요.");
        } else if (!/^\d{4}$/.test(birthYear)) {
            setError("출생연도는 4자리 숫자여야 합니다.");
        } else {
            const year = parseInt(birthYear, 10);
            if (year < MIN_YEAR || year > CURRENT_YEAR) {
                setError(
                    `출생연도는 ${MIN_YEAR}~${CURRENT_YEAR} 사이여야 합니다.`,
                );
            } else {
                setError("");
            }
        }
    }, [birthYear]);

    const handleSave = () => {
        chrome.storage.local.set({ birthYear, gender }, () => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        });
    };

    return {
        birthYear,
        setBirthYear,
        gender,
        setGender,
        error,
        saved,
        loading,
        handleSave,
    };
}
