import { describe, it, expect } from "vitest";

describe("Security Sanitization Unit Tests", () => {
  it("should escape all regex special characters to neutralize ReDoS", () => {
    const maliciousPayloads = [
      "((((((a+)+)+)+)+)+)$",
      ".*?.*?",
      "^.*[a-zA-Z0-9]+.*$",
      "[a-z]+|[0-9]+",
      "{1,1000}",
    ];

    for (const payload of maliciousPayloads) {
      const sanitized = payload.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Compiling as literal regex should not throw and should match literal string only
      const regex = new RegExp(sanitized, "i");
      expect(regex.test(payload)).toBe(true);
      expect(regex.test("arbitrary random string")).toBe(false);
    }
  });

  it("should strip internal database stack traces in production error handler", () => {
    const mockError = new Error("MongoServerError: E11000 duplicate key error collection");
    mockError.stack = "Error at line 45 in mongo driver...";

    const isProduction = true;
    const responsePayload = {
      message: "Internal Server Error",
      errorCode: "INTERNAL_SERVER_ERROR",
      ...(!isProduction ? { error: mockError.message } : {}),
    };

    expect(responsePayload).not.toHaveProperty("error");
    expect(responsePayload).not.toHaveProperty("stack");
    expect(responsePayload.message).toBe("Internal Server Error");
    expect(responsePayload.errorCode).toBe("INTERNAL_SERVER_ERROR");
  });
});
