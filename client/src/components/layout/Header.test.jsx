import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Header } from "./Header";

const { logoutMock, useAuthMock } = vi.hoisted(() => ({
  logoutMock: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => (
    <a href={typeof href === "string" ? href : href?.pathname} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("../../hooks/useAuth", () => ({
  default: useAuthMock,
}));

vi.mock("../../i18n/I18nProvider", () => ({
  useI18n: () => ({
    locale: "en",
    setLocale: vi.fn(),
    t: (key) => ({
      "common.country": "Country",
      "common.allCrops": "All crops",
      "common.search": "Search",
      "common.language": "Language",
      "common.signIn": "Sign in",
      "common.continueWith": "Continue with",
      "common.createAccount": "Create account",
      "common.signOut": "Sign out",
      "header.searchPlaceholder": "Search crops",
      "header.notifications": "Notifications",
      "header.accountMenu": "Account menu",
      "header.myAgriculNet": "My AgriculNet",
      "header.orders": "Orders",
      "header.messages": "Messages",
      "header.account": "Account",
      "header.settings": "Settings",
    })[key] || key,
  }),
}));

vi.mock("../../lib/startOAuth", () => ({
  startOAuth: vi.fn(),
}));

vi.mock("../common/BrandLogo", () => ({
  BrandLogo: () => <span>AgriculNet</span>,
}));

vi.mock("../common/CountrySelector", () => ({
  CountrySelector: ({ label }) => <label>{label}<select aria-label={label} /></label>,
}));

function renderHeader(role = null) {
  useAuthMock.mockReturnValue({
    user: role ? { email: `${role}@example.com`, role } : null,
    isAuthenticated: Boolean(role),
    logout: logoutMock,
  });

  return render(<Header />);
}

function expectLink(name, href) {
  expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
}

describe("Header role-aware destinations", () => {
  test("offers public authentication destinations to anonymous visitors", () => {
    renderHeader();

    const signInLinks = screen.getAllByRole("link", { name: "Sign in" });
    expect(signInLinks).not.toHaveLength(0);
    signInLinks.forEach((link) => expect(link).toHaveAttribute("href", "/auth/login"));
    expectLink("Create account", "/register/buyer");
    expect(screen.queryByRole("link", { name: "Notifications" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Account menu" })).not.toBeInTheDocument();
  });

  test.each([
    {
      role: "local_buyer",
      destinations: {
        notifications: "/buyer/notifications",
        dashboard: "/buyer/dashboard",
        orders: "/buyer/orders",
        messages: "/buyer/messages",
        account: "/buyer/profile",
        settings: "/buyer/settings",
      },
    },
    {
      role: "farmer",
      destinations: {
        notifications: "/farmer/notifications",
        dashboard: "/farmer/dashboard",
        orders: "/farmer/orders",
        messages: "/farmer/messages",
        account: "/farmer/profile",
        settings: "/farmer/settings",
      },
    },
  ])("routes an authenticated $role to the matching workspace", ({ role, destinations }) => {
    renderHeader(role);

    expectLink("Notifications", destinations.notifications);
    const accountMenu = screen.getByRole("button", { name: "Account menu" }).parentElement;
    expect(within(accountMenu).getByRole("link", { name: "My AgriculNet" })).toHaveAttribute(
      "href",
      destinations.dashboard,
    );
    expect(within(accountMenu).getByRole("link", { name: "Orders" })).toHaveAttribute(
      "href",
      destinations.orders,
    );
    expect(within(accountMenu).getByRole("link", { name: "Messages" })).toHaveAttribute(
      "href",
      destinations.messages,
    );
    expect(within(accountMenu).getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      destinations.account,
    );
    expect(within(accountMenu).getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      destinations.settings,
    );
  });

  test("routes admins to admin destinations without offering a messages link", () => {
    renderHeader("admin");

    expectLink("Notifications", "/admin/dashboard");
    const accountMenu = screen.getByRole("button", { name: "Account menu" }).parentElement;
    expect(within(accountMenu).getByRole("link", { name: "My AgriculNet" })).toHaveAttribute(
      "href",
      "/admin/dashboard",
    );
    expect(within(accountMenu).getByRole("link", { name: "Orders" })).toHaveAttribute(
      "href",
      "/admin/orders",
    );
    expect(within(accountMenu).getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/admin/settings",
    );
    expect(within(accountMenu).getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/admin/settings",
    );
    expect(within(accountMenu).queryByRole("link", { name: "Messages" })).not.toBeInTheDocument();
  });
});
