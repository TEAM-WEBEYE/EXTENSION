import { logger } from "@src/utils/logger";

interface ReviewAnalysisPayload {
    productId: string;
    reviewRating: { totalCount: number; ratings: Record<string, number> };
    reviews: Record<string, Record<string, number>>;
}

export async function handleReviewAnalysisMessage(
    payload: ReviewAnalysisPayload,
    sendResponse: (response: {
        success: boolean;
        error?: string;
        result?: any;
    }) => void,
): Promise<void> {
    logger.debug("리뷰 분석 메시지 수신:", payload);

    const apiUrl = "https://voim.store/api/v1/review/summary";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 응답 오류: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        logger.debug("리뷰 분석 결과:", result);

        // TODO: API 결과 처리 로직 추가 (예: 결과를 저장하거나 콘텐츠 스크립트로 다시 전달)
        // API 결과를 콘텐츠 스크립트로 전달
        sendResponse({ success: true, result: result });
    } catch (error: any) {
        logger.error("리뷰 분석 API 호출 중 오류:", error);
        sendResponse({ success: false, error: error.message });
    }
}
