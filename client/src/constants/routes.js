import {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  Landmark,
  LayoutGrid,
  Map,
  MessageSquare,
  Package,
  Settings,
  Shield,
  ShoppingBasket,
  Sprout,
  Truck,
  Users,
} from "lucide-react";

export const buyerNavigation = [
  { href: "/buyer/dashboard", id: "dashboard", label: "Dashboard", icon: Home },
  { href: "/buyer/orders", id: "orders", label: "Orders", icon: Package },
  { href: "/buyer/quotes", id: "quotes", label: "Quotes", icon: ClipboardList },
  { href: "/buyer/messages", id: "messages", label: "Messages", icon: MessageSquare },
  { href: "/buyer/saved", id: "saved", label: "Saved Listings", icon: ShoppingBasket },
  { href: "/buyer/documents", id: "documents", label: "Documents", icon: FileText },
  { href: "/buyer/profile", id: "profile", label: "Profile", icon: Users },
  { href: "/buyer/settings", id: "settings", label: "Settings", icon: Settings },
];

export const farmerNavigation = [
  { href: "/farmer/dashboard", id: "dashboard", label: "Dashboard", icon: Home },
  { href: "/farmer/listings", id: "listings", label: "Listings", icon: LayoutGrid },
  { href: "/farmer/orders", id: "orders", label: "Orders", icon: Package },
  { href: "/farmer/messages", id: "messages", label: "Messages", icon: MessageSquare },
  { href: "/farmer/notifications", id: "notifications", label: "Notifications", icon: Bell },
  { href: "/farmer/payments", id: "payments", label: "Payments", icon: CreditCard },
  { href: "/farmer/profile", id: "profile", label: "Profile", icon: Users },
  { href: "/farmer/settings", id: "settings", label: "Settings", icon: Settings },
];

export const adminNavigation = [
  { href: "/admin/dashboard", id: "dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/analytics", id: "analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/orders", id: "orders", label: "Orders", icon: Package },
  { href: "/admin/listings", id: "listings", label: "Listings", icon: Sprout },
  { href: "/admin/users", id: "users", label: "Users", icon: Users },
  { href: "/admin/payments", id: "payments", label: "Payments", icon: Landmark },
  { href: "/admin/logistics", id: "logistics", label: "Logistics", icon: Truck },
  { href: "/admin/inspections", id: "inspections", label: "Inspections", icon: Shield },
  { href: "/admin/disputes", id: "disputes", label: "Disputes", icon: ClipboardList },
  { href: "/admin/settings", id: "settings", label: "Settings", icon: Settings },
];

export const publicMarketplaceLinks = [
  { href: "/browse", label: "Browse Crops", icon: Sprout },
  { href: "/find-farmers", label: "Find Farmers", icon: Users },
  { href: "/request-quote", label: "Request a Quote", icon: ClipboardList },
  { href: "/international", label: "Export Program", icon: Map },
  { href: "/buyer-protection", label: "Buyer Protection", icon: Shield },
];
