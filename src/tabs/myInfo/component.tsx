import React, { useEffect, useState } from "react";
import { useUserInfo } from "@src/hooks/useUserInfo";
import { Onboarding, InfoForm } from "./components";

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

    const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

    useEffect(() => {
        if (!loading) {
            const hasInfo = birthYear !== "" || gender !== "";
            setOnboardingDone(hasInfo);
        }
    }, [loading, birthYear, gender]);

    if (loading || onboardingDone === null) {
        return null;
    }

    if (!onboardingDone) {
        return <Onboarding onComplete={() => setOnboardingDone(true)} />;
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
            handleSave={handleSave}
        />
    );
}
