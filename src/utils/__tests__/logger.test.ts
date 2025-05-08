/* eslint-disable no-console */
import { logger } from "../logger";

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

describe("로거 유틸리티", () => {
    beforeEach(() => {
        console.error = jest.fn();
        console.warn = jest.fn();
        console.log = jest.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        console.log = originalConsoleLog;
        jest.resetAllMocks();
    });

    const originalNodeEnv = process.env.NODE_ENV;

    afterAll(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    it("error 메서드가 메시지와 인자를 console.error로 올바르게 로깅합니다", () => {
        const message = "에러 메시지";
        const args = [42, { key: "value" }, true, null, undefined];

        logger.error(message, ...args);

        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
            "[ERROR] 에러 메시지",
            42,
            { key: "value" },
            true,
            null,
            undefined,
        );
    });

    it("warn 메서드가 메시지와 인자를 console.warn으로 올바르게 로깅합니다", () => {
        const message = "경고 메시지";
        const args = ["추가 정보", 100];

        logger.warn(message, ...args);

        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
            "[WARN] 경고 메시지",
            "추가 정보",
            100,
        );
    });

    it("debug 메서드가 개발 환경에서 메시지와 인자를 console.log로 올바르게 로깅합니다", () => {
        process.env.NODE_ENV = "development";

        const message = "디버그 메시지";
        const args = [{ id: 1 }, "test"];

        logger.debug(message, ...args);

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(
            "[DEBUG] 디버그 메시지",
            { id: 1 },
            "test",
        );
    });

    it("debug 메서드가 프로덕션 환경에서는 로깅하지 않습니다", () => {
        process.env.NODE_ENV = "production";

        const message = "디버그 메시지";
        const args = [{ id: 1 }, "test"];

        logger.debug(message, ...args);

        expect(console.log).not.toHaveBeenCalled();
    });

    it("error 메서드가 인자 없이도 올바르게 작동합니다", () => {
        logger.error("단순 에러 메시지");

        expect(console.error).toHaveBeenCalledWith("[ERROR] 단순 에러 메시지");
    });

    it("warn 메서드가 인자 없이도 올바르게 작동합니다", () => {
        logger.warn("단순 경고 메시지");

        expect(console.warn).toHaveBeenCalledWith("[WARN] 단순 경고 메시지");
    });

    it("debug 메서드가 개발 환경에서 인자 없이도 올바르게 작동합니다", () => {
        process.env.NODE_ENV = "development";

        logger.debug("단순 디버그 메시지");

        expect(console.log).toHaveBeenCalledWith("[DEBUG] 단순 디버그 메시지");
    });

    it("복잡한 객체를 인자로 받아 올바르게 로깅합니다", () => {
        const complexObject = {
            name: "테스트",
            data: {
                id: 123,
                items: [1, 2, 3],
                enabled: true,
            },
        };

        logger.error("복잡한 객체 로깅", complexObject);

        expect(console.error).toHaveBeenCalledWith(
            "[ERROR] 복잡한 객체 로깅",
            complexObject,
        );
    });
});
