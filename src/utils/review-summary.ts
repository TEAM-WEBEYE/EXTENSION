export async function postReviewData(data: any) {
    try {
        const response = await fetch(
            "https://voim.store/api/v1/review/summary",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status}`);
        }

        console.log("✅ 서버에 리뷰 데이터 전송 완료");
    } catch (error) {
        console.error("❌ 리뷰 데이터 전송 실패:", error);
    }
}
