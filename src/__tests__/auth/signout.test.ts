/**
 * @jest-environment node
 */

import { signOut } from "@/lib/auth/signout";

const mockSignOut = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      signOut: () => mockSignOut(),
    },
  }),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Server-side sign out", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls supabase signOut", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await signOut();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("redirects to home page after sign out", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    const { redirect } = require("next/navigation");

    await signOut();

    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("redirects even when signOut returns an error", async () => {
    mockSignOut.mockResolvedValue({ error: { message: "Session not found" } });
    const { redirect } = require("next/navigation");

    await signOut();

    expect(redirect).toHaveBeenCalledWith("/");
  });
});
