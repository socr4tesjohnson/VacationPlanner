/**
 * Component Tests: Login Page
 *
 * Tests the Login page component including:
 * - Form rendering
 * - Form validation
 * - Error display
 * - Loading states
 * - Successful login flow
 * - API interaction
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Mock the AuthContext
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LoginPage Component", () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe("Rendering", () => {
    it("should render login form with all elements", () => {
      render(<LoginPage />);

      expect(screen.getByText("Admin Login")).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/back to home/i)).toBeInTheDocument();
    });

    it("should render demo credentials info", () => {
      render(<LoginPage />);

      expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    });

    it("should have proper input types", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Redirect When Authenticated", () => {
    it("should redirect to dashboard if already authenticated", () => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isAuthenticated: true, // Already authenticated
      });

      render(<LoginPage />);

      expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  describe("Form Validation", () => {
    it("should show email error for invalid email format", async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "not-an-email");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should show error for empty email", async () => {
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(passwordInput, "password123");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should show error for empty password", async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "test@example.com");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should show error for password less than 6 characters", async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "12345"); // Only 5 characters
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should clear validation errors when user types", async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      // Trigger validation error
      await userEvent.type(emailInput, "invalid");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });

      // Clear and type new value
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, "valid@example.com");

      // Error should be cleared
      expect(
        screen.queryByText(/please enter a valid email address/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Successful Login", () => {
    it("should call login with correct credentials", async () => {
      mockLogin.mockResolvedValue(undefined);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "admin@example.com");
      await userEvent.type(passwordInput, "password123");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          "admin@example.com",
          "password123"
        );
      });
    });

    it("should show loading state during login", async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "admin@example.com");
      await userEvent.type(passwordInput, "password123");
      fireEvent.click(submitButton);

      // Should show loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });

    it("should disable submit button during loading", async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "admin@example.com");
      await userEvent.type(passwordInput, "password123");

      expect(submitButton).not.toBeDisabled();

      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message on login failure", async () => {
      mockLogin.mockRejectedValue(new Error("Invalid credentials"));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "admin@example.com");
      await userEvent.type(passwordInput, "wrongpassword");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it("should show generic error when no error message provided", async () => {
      mockLogin.mockRejectedValue(new Error());

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "admin@example.com");
      await userEvent.type(passwordInput, "password123");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/login failed. please check your credentials/i)
        ).toBeInTheDocument();
      });
    });

    it("should clear error when form is resubmitted", async () => {
      mockLogin
        .mockRejectedValueOnce(new Error("Invalid credentials"))
        .mockResolvedValueOnce(undefined);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      // First attempt - fail
      await userEvent.type(emailInput, "admin@example.com");
      await userEvent.type(passwordInput, "wrongpassword");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Second attempt - should clear error
      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, "correctpassword");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid credentials/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit form on Enter key press", async () => {
      mockLogin.mockResolvedValue(undefined);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, "admin@example.com");
      await userEvent.type(passwordInput, "password123{Enter}");

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          "admin@example.com",
          "password123"
        );
      });
    });

    it("should not submit with only whitespace in inputs", async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "   ");
      await userEvent.type(passwordInput, "   ");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe("Navigation Links", () => {
    it("should have link back to home page", () => {
      render(<LoginPage />);

      const homeLink = screen.getByText(/back to home/i);
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("should have link to vacation planner in header", () => {
      render(<LoginPage />);

      const headerLink = screen.getByText(/vacation planner/i);
      expect(headerLink.closest("a")).toHaveAttribute("href", "/");
    });
  });
});
