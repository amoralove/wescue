/**
 * @jest-environment node
 */

const mockVerifyOtp = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: string | URL) => {
      const location = typeof url === "string" ? url : url.toString();
      return {
        status: 307,
        headers: new Map([["location", location]]),
      };
    },
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    },
  }),
}));

import { GET } from "@/app/auth/confirm/route";

describe("Email confirmation route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("verifies OTP and redirects to /dashboard on success", async () => {
    mockVerifyOtp.mockResolvedValue({ data: { user: {} }, error: null });

    const request = new Request(
      "http://localhost:3000/auth/confirm?token_hash=abc123&type=signup"
    );
    const response = await GET(request);

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      token_hash: "abc123",
      type: "signup",
    });
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("redirects to custom 'next' path on success", async () => {
    mockVerifyOtp.mockResolvedValue({ data: { user: {} }, error: null });

    const request = new Request(
      "http://localhost:3000/auth/confirm?token_hash=abc123&type=signup&next=/chat"
    );
    const response = await GET(request);

    expect(response.headers.get("location")).toBe("http://localhost:3000/chat");
  });

  it("handles email_change OTP type", async () => {
    mockVerifyOtp.mockResolvedValue({ data: { user: {} }, error: null });

    const request = new Request(
      "http://localhost:3000/auth/confirm?token_hash=abc123&type=email_change"
    );
    const response = await GET(request);

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      token_hash: "abc123",
      type: "email_change",
    });
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("redirects to login with error when verification fails", async () => {
    mockVerifyOtp.mockResolvedValue({
      data: { user: null },
      error: { message: "Token expired" },
    });

    const request = new Request(
      "http://localhost:3000/auth/confirm?token_hash=expired&type=signup"
    );
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?error=confirmation_failed"
    );
  });

  it("redirects to login when token_hash is missing", async () => {
    const request = new Request("http://localhost:3000/auth/confirm?type=signup");
    const response = await GET(request);

    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?error=confirmation_failed"
    );
  });

  it("redirects to login when type is missing", async () => {
    const request = new Request(
      "http://localhost:3000/auth/confirm?token_hash=abc123"
    );
    const response = await GET(request);

    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?error=confirmation_failed"
    );
  });

  it("redirects to login when both params are missing", async () => {
    const request = new Request("http://localhost:3000/auth/confirm");
    const response = await GET(request);

    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?error=confirmation_failed"
    );
  });
});
