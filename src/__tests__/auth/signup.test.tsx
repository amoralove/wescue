import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "@/app/auth/signup/page";

const mockSignUp = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  }),
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

describe("Signup Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the signup form with name, email, and password fields", () => {
    render(<SignupPage />);

    expect(screen.getByPlaceholderText("What should we call you?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("At least 6 characters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders Google OAuth button", () => {
    render(<SignupPage />);

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("renders link to login page", () => {
    render(<SignupPage />);

    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toHaveAttribute("href", "/auth/login");
  });

  it("submits signup with name, email, and password", async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("What should we call you?"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await user.type(screen.getByPlaceholderText("At least 6 characters"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "password123",
        options: {
          data: { full_name: "Jane Doe" },
          emailRedirectTo: expect.stringContaining("/auth/confirm"),
        },
      });
    });
  });

  it("shows success message after successful signup", async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("What should we call you?"), "Jane");
    await user.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await user.type(screen.getByPlaceholderText("At least 6 characters"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("displays error message on signup failure", async () => {
    mockSignUp.mockResolvedValue({
      data: {},
      error: { message: "User already registered" },
    });
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("What should we call you?"), "Jane");
    await user.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await user.type(screen.getByPlaceholderText("At least 6 characters"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("User already registered")).toBeInTheDocument();
    });
  });

  it("shows loading state during signup", async () => {
    let resolveSignup: (value: unknown) => void;
    mockSignUp.mockReturnValue(
      new Promise((resolve) => {
        resolveSignup = resolve;
      })
    );
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("What should we call you?"), "Jane");
    await user.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await user.type(screen.getByPlaceholderText("At least 6 characters"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();

    resolveSignup!({ data: {}, error: null });
  });

  it("triggers Google OAuth signup", async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    render(<SignupPage />);
    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: expect.stringContaining("/auth/callback"),
      },
    });
  });

  it("displays error when Google OAuth fails", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: {},
      error: { message: "OAuth provider error" },
    });
    const user = userEvent.setup();

    render(<SignupPage />);
    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(screen.getByText("OAuth provider error")).toBeInTheDocument();
    });
  });
});
