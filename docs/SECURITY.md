# GPMS 2.0 Security Architecture & Hardening Report

## Executive Summary

Phase 7 instituted defense-in-depth security controls across GPMS 2.0, adhering to OWASP Top 10 guidelines. We fortified the API against brute-force authentication attacks, cross-site scripting (XSS), clickjacking, MIME-type sniffing, Regular Expression Denial of Service (ReDoS), and information leakage.

---

## 1. Security Architecture & Controls

### HTTP Security Headers (`helmet`)
GPMS 2.0 automatically enforces security headers on every HTTP request and response:
* **Content Security Policy (CSP)**: Restricts script execution to approved self-origins and isolates frames.
* **X-Content-Type-Options**: Set to `nosniff` to prevent MIME-confusion attacks.
* **X-Frame-Options**: Set to `SAMEORIGIN` to eliminate UI redressing and Clickjacking attacks.
* **Strict-Transport-Security (HSTS)**: `max-age=31536000; includeSubDomains` ensuring strict HTTPS enforcement.
* **X-DNS-Prefetch-Control**: Disabled (`off`) to prevent sensitive URL leakage.

### Multi-Tier Rate Limiting (`express-rate-limit`)
To protect against distributed denial-of-service and credential stuffing:
1. **Authentication Limiter (`/api/auth/*`)**:
   * Window: 15 minutes
   * Limit: 30 requests per IP
   * Rejection: HTTP 429 with standard `RateLimit-*` draft-7 headers and `AUTH_TOO_MANY_ATTEMPTS` error payload.
2. **Global API Limiter (`/api/*`)**:
   * Window: 1 minute
   * Limit: 300 requests per IP

### Input Sanitization & ReDoS Prevention
* In `getAllTasksService`, user-supplied search keywords are sanitized by escaping all special regex metacharacters (`replace(/[.*+?^${}()|[\]\\]/g, "\\$&")`) before MongoDB execution, neutralizing catastrophic regex backtracking attacks.

### Production Error Sanitization
* In `errorHandler.middleware.ts`, detailed JavaScript stack traces and database schema internal errors are stripped in production mode, responding with sanitized HTTP 500 JSON payloads.

### Session Cookie Protection
* `httpOnly: true` (prevents JavaScript access to authentication cookies)
* `secure: true` in production (enforces transmission strictly over HTTPS)
* `sameSite: "lax"` (mitigates Cross-Site Request Forgery)

---

## 2. Verification Benchmark Telemetry

Empirical results from [`performance/security/security-results.json`](file:///c:/Users/sugud/OneDrive/Documents/Group-Project-Management-Platform/performance/security/security-results.json):

| Threat Vector | Mitigation Technique | Benchmark Result | Status |
| :--- | :--- | :--- | :--- |
| **MIME Sniffing** | `helmet.noSniff()` | `x-content-type-options: nosniff` | **ENFORCED** |
| **Clickjacking** | `helmet.frameguard()` | `x-frame-options: SAMEORIGIN` | **ENFORCED** |
| **Credential Stuffing** | `authRateLimiter` | 5th request triggers HTTP 429 | **ENFORCED** |
| **ReDoS Injection** | Regex Metacharacter Escaping | Query completed in `17.10 ms` (safe) | **PROTECTED** |
| **Stack Leakage** | Production Environment Gate | Internal errors suppressed in prod | **SECURED** |
