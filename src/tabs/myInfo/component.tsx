import React from "react";
import { useUserInfo } from "@src/hooks/useUserInfo";
import { InfoForm } from "./components";

interface MyInfoProps {
    onComplete?: () => void;
}

export function MyInfo({ onComplete }: MyInfoProps) {
    const {
        birthYear,
        setBirthYear,
        gender,
        setGender,
        error,
        saved,
        loading,
        handleSave,
    } = useUserInfo();

    const handleSaveWithComplete = async () => {
        await handleSave();
        if (onComplete) {
            onComplete();
        }
    };

    if (loading === null) {
        return null;
    }

    return (
        <InfoForm
            birthYear={birthYear}
            setBirthYear={setBirthYear}
            gender={gender}
            setGender={setGender}
            error={error}
            saved={saved}
            loading={loading}
            handleSave={handleSaveWithComplete}
        />
    );
}
