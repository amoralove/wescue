import React from "react";
import { render, screen } from "@testing-library/react";

const mockGetUser = jest.fn();
const mockRedirect = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}));

jest.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error("NEXT_REDIRECT");
  },
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("@/components/layout/Navbar", () => ({
  Navbar: () => <nav>navbar</nav>,
}));

jest.mock("@/components/layout/Footer", () => ({
  Footer: () => <footer>footer</footer>,
}));

import DashboardPage from "@/app/dashboard/page";

describe("Dashboard protected route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
  });

  it("renders dashboard when user is authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "jane@example.com",
          user_metadata: { full_name: "Jane Doe" },
        },
      },
      error: null,
    });

    const result = await DashboardPage();
    render(result);

    expect(screen.getByText(/hey, jane doe/i)).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("falls back to email username when full_name is not set", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-456",
          email: "anon@example.com",
          user_metadata: {},
        },
      },
      error: null,
    });

    const result = await DashboardPage();
    render(result);

    expect(screen.getByText(/hey, anon/i)).toBeInTheDocument();
  });
});
