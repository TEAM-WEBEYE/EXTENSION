import React from "react";
import { useUserInfo } from "@src/hooks/useUserInfo";
import { InfoForm } from "./components";

export function MyInfo() {
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

    return (
        <InfoForm
            birthYear={birthYear}
            setBirthYear={setBirthYear}
            gender={gender}
            setGender={setGender}
            error={error}
            saved={saved}
            loading={loading}
            handleSave={handleSave}
        />
    );
}
