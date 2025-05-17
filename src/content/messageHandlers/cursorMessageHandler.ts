import { applyCursorStyle, removeCursorStyle } from "../styles";

let contentCursorEnabled = true;

export const handleCursorMessage = (
    message: { type: string; isCursorEnabled?: boolean; cursorUrl?: string },
    sendResponse: (response: any) => void,
) => {
    if (message.type === "UPDATE_CURSOR") {
        chrome.storage.sync.get(["stylesEnabled"], (result) => {
            const stylesEnabled =
                result.stylesEnabled !== undefined
                    ? result.stylesEnabled
                    : true;

            if (!stylesEnabled) {
                console.log(
                    "스타일이 비활성화 상태입니다. 커서 설정을 적용하지 않습니다.",
                );
                sendResponse({
                    success: false,
                    error: "스타일이 비활성화 상태입니다",
                });
                return;
            }

            if (message.isCursorEnabled && message.cursorUrl) {
                applyCursorStyle(message.cursorUrl);
                contentCursorEnabled = true;
            } else {
                removeCursorStyle();
                contentCursorEnabled = false;
            }

            sendResponse({ success: true });
        });
        return true;
    }
    return false;
};
