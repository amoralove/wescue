/**
 * @jest-environment node
 */

const mockExchangeCodeForSession = jest.fn();

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
      exchangeCodeForSession: (...args: unknown[]) =>
        mockExchangeCodeForSession(...args),
    },
  }),
}));

import { GET } from "@/app/auth/callback/route";

describe("OAuth callback route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exchanges a valid code for a session and redirects to /dashboard", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });

    const request = new Request("http://localhost:3000/auth/callback?code=valid-auth-code");
    const response = await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("valid-auth-code");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("redirects to a custom 'next' path when provided", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });

    const request = new Request(
      "http://localhost:3000/auth/callback?code=valid-auth-code&next=/dogs/123"
    );
    const response = await GET(request);

    expect(response.headers.get("location")).toBe("http://localhost:3000/dogs/123");
  });

  it("redirects to login with error when code exchange fails", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { message: "Invalid code" },
    });

    const request = new Request("http://localhost:3000/auth/callback?code=bad-code");
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?error=auth_failed"
    );
  });

  it("redirects to login with error when no code is provided", async () => {
    const request = new Request("http://localhost:3000/auth/callback");
    const response = await GET(request);

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?error=auth_failed"
    );
  });

  it("redirects to login when code is empty string", async () => {
    const request = new Request("http://localhost:3000/auth/callback?code=");
    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?error=auth_failed"
    );
  });

  it("propagates Supabase exceptions", async () => {
    mockExchangeCodeForSession.mockRejectedValue(new Error("Network failure"));

    const request = new Request("http://localhost:3000/auth/callback?code=valid-code");

    await expect(GET(request)).rejects.toThrow("Network failure");
  });
});
