import React, { useEffect, useState } from "react";
import { sendImageAnalysisRequest } from "../../content/apiSetting/sendImageAnalysisRequest";
import { Player } from "@lottiefiles/react-lottie-player";
import Loading from "../Loading/component";

interface ImageModalProps {
    imageUrl: string;
    description: string;
    onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
    imageUrl,
    description,
    onClose,
}) => {
    const [analysis, setAnalysis] = useState<string>();

    useEffect(() => {
        sendImageAnalysisRequest(imageUrl)
            .then((res) => {
                setAnalysis(res || "분석 결과가 없습니다.");
            })
            .catch((err) => {
                setAnalysis("분석 중 오류가 발생했습니다: " + err.message);
            });
    }, [imageUrl]);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2147483647,
                backdropFilter: "blur(4px)",
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    padding: "40px",
                    width: "1200px",
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.2)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "24px",
                        alignItems: "flex-start",
                    }}
                >
                    <img
                        src={imageUrl}
                        alt="분석 이미지"
                        style={{
                            width: "400px",
                            height: "auto",
                            objectFit: "cover",
                            flexShrink: 0,
                        }}
                    />
                    <div style={{ flex: 1 }}>
                        {analysis ? (
                            <p
                                style={{
                                    fontFamily: "KoddiUD OnGothic",
                                    fontSize: "24px",
                                    fontStyle: "normal",
                                    fontWeight: 700,
                                    lineHeight: "150%",
                                    color: "#222",
                                    textAlign: "left",
                                }}
                            >
                                {analysis}
                            </p>
                        ) : (
                            <div
                                style={{
                                    padding: "16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: "320px",
                                }}
                            >
                                <div
                                    style={{ width: "260px", height: "243px" }}
                                >
                                    <Loading />
                                </div>
                                <p
                                    style={{
                                        marginTop: "8px",
                                        fontFamily: "KoddiUD OnGothic",
                                        fontSize: "24px",
                                        fontWeight: 600,
                                        color: "#555",
                                    }}
                                >
                                    이미지를 분석 중입니다. 잠시만 기다려주세요.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    style={{
                        alignSelf: "flex-end",
                        width: "100%",
                        marginTop: "40px",
                        padding: "16px 30px",
                        backgroundColor: "#8914FF",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "24px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background 0.2s ease-in-out",
                    }}
                    onClick={onClose}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#5a0ea7")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#8914FF")
                    }
                >
                    닫기
                </button>
            </div>
        </div>
    );
};
