/**
 * @jest-environment node
 */

const mockGetUser = jest.fn();
const mockResponseCookieSet = jest.fn();
const mockRequestCookieSet = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    next: ({ request }: { request: unknown }) => ({
      request,
      cookies: { set: mockResponseCookieSet },
      headers: new Map(),
    }),
  },
}));

jest.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: Array<{ name: string; value: string; options?: object }>
        ) => void;
      };
    }
  ) => {
    options.cookies.setAll([
      {
        name: "sb-access-token",
        value: "refreshed-token",
        options: { path: "/" },
      },
    ]);
    return {
      auth: { getUser: () => mockGetUser() },
    };
  },
}));

import { updateSession } from "@/lib/supabase/middleware";

function createMockRequest(url: string) {
  return {
    url,
    cookies: {
      getAll: () => [{ name: "sb-access-token", value: "old-token" }],
      set: mockRequestCookieSet,
    },
    headers: new Map(),
    nextUrl: new URL(url),
  };
}

describe("Auth middleware (token refresh)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("calls getUser to trigger token refresh", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });

    const request = createMockRequest("http://localhost:3000/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await updateSession(request as any);

    expect(mockGetUser).toHaveBeenCalled();
    expect(response).toBeDefined();
  });

  it("refreshes cookies when tokens are updated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const request = createMockRequest("http://localhost:3000/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateSession(request as any);

    expect(mockRequestCookieSet).toHaveBeenCalledWith(
      "sb-access-token",
      "refreshed-token"
    );
    expect(mockResponseCookieSet).toHaveBeenCalledWith(
      "sb-access-token",
      "refreshed-token",
      { path: "/" }
    );
  });

  it("still returns a response when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Not authenticated" },
    });

    const request = createMockRequest("http://localhost:3000/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await updateSession(request as any);

    expect(response).toBeDefined();
    expect(mockGetUser).toHaveBeenCalled();
  });

  it("handles expired refresh token gracefully", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Refresh token expired", status: 401 },
    });

    const request = createMockRequest("http://localhost:3000/dogs");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await updateSession(request as any);

    expect(response).toBeDefined();
  });
});
