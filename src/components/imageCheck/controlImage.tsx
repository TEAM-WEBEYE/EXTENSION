import React, { useEffect, useRef, useState } from "react";
import { ImageModal } from "./imageModal";

interface ControlImageProps {
    targetImg: HTMLImageElement;
}

export const ControlImage: React.FC<ControlImageProps> = ({ targetImg }) => {
    const [showButton, setShowButton] = useState(false);
    const [isSmallButton, setIsSmallButton] = useState(true);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [showModal, setShowModal] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const updatePosition = () => {
            const rect = targetImg.getBoundingClientRect();
            const imgWidth = rect.width;
            const largeBtnWidth = 158;

            setIsSmallButton(imgWidth < largeBtnWidth * 2);
            setPosition({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
            });
        };

        const handleMove = (e: MouseEvent) => {
            const rect = targetImg.getBoundingClientRect();
            const isOver =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            if (isOver) {
                if (hideTimer.current) {
                    clearTimeout(hideTimer.current);
                    hideTimer.current = null;
                }
                setShowButton(true);
            } else {
                if (!hideTimer.current) {
                    hideTimer.current = setTimeout(() => {
                        setShowButton(false);
                        hideTimer.current = null;
                    }, 300);
                }
            }
        };

        if (!targetImg.complete || targetImg.naturalWidth === 0) {
            targetImg.onload = updatePosition;
        } else {
            updatePosition();
        }

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("scroll", updatePosition);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("scroll", updatePosition);
            window.removeEventListener("resize", updatePosition);
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, [targetImg]);

    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: position.top,
                    left: position.left,
                    zIndex: 1,
                    pointerEvents: "none",
                    opacity: showButton ? 1 : 0,
                    transition: "opacity 0.2s ease-in-out",
                }}
            >
                {isSmallButton ? (
                    <img
                        src={chrome.runtime.getURL("images/search.png")}
                        alt="돋보기"
                        width={50}
                        height={50}
                        style={{
                            cursor: "pointer",
                            pointerEvents: "auto",
                        }}
                        onClick={() => {
                            console.log("분석 버튼 클릭");
                            setShowModal(true);
                        }}
                    />
                ) : (
                    <div
                        style={{
                            backgroundColor: "#8914FF",
                            color: "white",
                            fontWeight: "bold",
                            padding: "8px 16px",
                            fontSize: "16px",
                            textAlign: "center",
                            cursor: "pointer",
                            pointerEvents: "auto",
                        }}
                        onClick={() => {
                            console.log("분석 버튼 클릭");
                            setShowModal(true);
                        }}
                    >
                        이미지 분석 클릭
                        <br />
                        단축키: ALT + I
                    </div>
                )}
            </div>

            {showModal && (
                <ImageModal
                    imageUrl={targetImg.src}
                    description={`이미지 분석 중입니다`}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};
