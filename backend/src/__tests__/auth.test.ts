import { describe, it, expect } from "vitest";
import { hashValue, compareValue } from "../utils/bcrypt";
import { registerSchema, loginSchema } from "../validation/auth.validation";

describe("Authentication & Cryptography Unit Tests", () => {
  it("should securely hash password with bcrypt and verify correctly", async () => {
    const rawPassword = "SuperSecretPassword123!";
    const hashed = await hashValue(rawPassword, 10);

    expect(hashed).not.toBe(rawPassword);
    expect(hashed).toMatch(/^\$2[aby]?\$\d+\$/);

    const isMatch = await compareValue(rawPassword, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await compareValue("WrongPassword", hashed);
    expect(isWrongMatch).toBe(false);
  });

  it("should validate valid registration schema successfully", () => {
    const validData = {
      name: "Alice Engineer",
      email: "alice@gpms.io",
      password: "StrongPassword123!",
    };
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid emails in registration schema", () => {
    const invalidData = {
      name: "Alice",
      email: "not-a-valid-email",
      password: "pass",
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path.includes("email"));
      expect(emailIssue).toBeDefined();
      expect(emailIssue?.message).toContain("Invalid email");
    }
  });

  it("should reject short passwords below minimum length", () => {
    const invalidData = {
      email: "alice@gpms.io",
      password: "123", // less than 4 chars
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
