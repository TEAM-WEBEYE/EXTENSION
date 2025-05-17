import React, { useEffect, useState } from "react";

interface ControlImageProps {
    targetImg: HTMLImageElement;
}

export const ControlImage: React.FC<ControlImageProps> = ({ targetImg }) => {
    const [showButton, setShowButton] = useState(false);
    const [isSmallButton, setIsSmallButton] = useState(true);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!targetImg.complete) {
            targetImg.onload = () => handleResize();
        } else {
            handleResize();
        }

        function handleResize() {
            const rect = targetImg.getBoundingClientRect();
            const imgWidth = rect.width;
            const smallBtnWidth = 50;
            const largeBtnWidth = 158;

            if (imgWidth >= largeBtnWidth * 2) {
                setIsSmallButton(false);
                setShowButton(true);
            } else if (imgWidth >= smallBtnWidth * 2) {
                setIsSmallButton(true);
                setShowButton(true);
            } else {
                setShowButton(false);
            }

            setPosition({
                top: rect.top + window.scrollY + 10,
                left: rect.left + window.scrollX + 10,
            });
        }

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [targetImg]);

    if (!showButton) return null;

    return (
        <div
            style={{
                position: "absolute",
                top: position.top,
                left: position.left,
                zIndex: 9999,
            }}
        >
            {isSmallButton ? (
                <img
                    src={chrome.runtime.getURL("images/search.png")}
                    alt="돋보기"
                    width={50}
                    height={50}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                        // 버튼 클릭 로직
                    }}
                />
            ) : (
                <div
                    style={{
                        backgroundColor: "#8914FF",
                        color: "white",
                        fontWeight: "bold",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "16px",
                        textAlign: "center",
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        // 버튼 클릭 로직
                    }}
                >
                    이미지 분석 클릭
                    <br />
                    단축키: ALT + A
                </div>
            )}
        </div>
    );
};
